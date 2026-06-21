// Setup ingestion. Receives uploaded input files, copies originals into the
// project's 00 Input/, and produces the Markdown the pipeline reads:
//   brief / rubric / referencing -> a structured "what is required" summary (Claude);
//                                    the brief also detects essay vs presentation.
//   previous   -> verbatim Markdown extraction of each prior work (Alex's style source).
//   curriculum -> copy a picked folder (current / wiki) in + a generated index.
//
// Local-only: writes to the 01 projects/ folder + calls the Anthropic API. The
// deployed (read-only) app cannot use this route.
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import path from "path";
import fs from "fs/promises";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

// Single-file "understand the requirements" inputs -> canonical raw + md filenames.
const KIND = {
  brief: { raw: "assessment_brief", md: "assessment_brief.md" },
  rubric: { raw: "grading_rubric", md: "grading_rubric.md" },
  referencing: { raw: "referencing_style_guide", md: "referencing_style_guide.md" },
} as const;
type ConvertKind = keyof typeof KIND;

const DOC_EXTS = [".pdf", ".docx", ".md", ".txt"];

const BRIEF_PROMPT = `You are Christoph, the strict compliance lead at Essay Fabrik.
You are given a university ASSESSMENT BRIEF. Produce a structured Markdown summary that an
essay-production team can act on. Decode EXACTLY what is required — do not pad.

Begin the response with a YAML frontmatter block, then the markdown body:

---
assignmentType: essay        # "essay" OR "presentation" — infer from the brief
title: <short assignment title>
wordCount: <number or "">    # essays: word limit; leave "" if none stated
slideCount: <number or "">   # presentations: slide/min limit; "" otherwise
deadline: <as stated or "">
weighting: <as stated or "">
---

# Assessment Summary

## Task
<what the student must produce, in 1–3 sentences>

## Type & format
<essay or presentation; length/format constraints; submission format>

## Required coverage
<bullet list of what MUST be addressed>

## What earns top marks
<the highest-weighted rubric expectation(s) you can infer, named explicitly>

## Formal constraints
<referencing style, structure rules, anything graded that is easy to lose marks on>

Be faithful to the brief. If something is not stated, write "not specified" — never invent.`;

const RUBRIC_PROMPT = `You are Christoph, the compliance lead at Essay Fabrik. You are given a
GRADING RUBRIC. Produce a concise Markdown table of the criteria with their weightings and what
distinguishes a top grade on each. Start with a one-line note naming the highest-weighted
criterion. Do not invent criteria that are not in the rubric.`;

const REF_PROMPT = `You are Christoph at Essay Fabrik. You are given a REFERENCING STYLE GUIDE.
Summarise, in Markdown, the citation rules the writer must follow (in-text format, reference-list
format, common pitfalls). Keep it practical and short.`;

const TRANSCRIBE_PROMPT = `Transcribe the attached document to clean Markdown. Preserve the
author's EXACT wording, paragraph structure, and headings. Do NOT summarise, correct, or
re-style — this is a faithful transcription used to learn the student's personal writing voice.
Output only the transcription.`;

function convertPrompt(kind: ConvertKind): string {
  if (kind === "brief") return BRIEF_PROMPT;
  if (kind === "rubric") return RUBRIC_PROMPT;
  return REF_PROMPT;
}

async function docxToText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/** A Claude user content block from an uploaded file buffer (PDF native; docx/text inlined). */
async function buildBlocks(buffer: Buffer, ext: string, instruction: string): Promise<Anthropic.ContentBlockParam[]> {
  if (ext === ".pdf") {
    return [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") } },
      { type: "text", text: instruction },
    ];
  }
  const text = ext === ".docx" ? await docxToText(buffer) : buffer.toString("utf-8");
  return [{ type: "text", text: `${instruction}\n\n${text}` }];
}

async function runClaude(
  client: Anthropic, system: string, blocks: Anthropic.ContentBlockParam[], maxTokens = 2048
): Promise<string> {
  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: blocks }],
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function parseAssignmentType(md: string): "essay" | "presentation" | null {
  const m = md.match(/assignmentType:\s*([a-zA-Z]+)/);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v === "presentation" ? "presentation" : v === "essay" ? "essay" : null;
}

const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._ -]/g, "_");
const baseNoExt = (n: string) => n.replace(/\.[^.]+$/, "");

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Serverless (Vercel/Lambda) has a read-only filesystem — ingestion writes files,
  // so it only works when the app runs locally. Fail clearly instead of EROFS.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return NextResponse.json(
      {
        error:
          "Setup ingestion writes files into your project folder, which only works when the app runs locally (pnpm dev). The deployed app is read-only — run setup locally, commit & push, and it will appear here.",
        readOnly: true,
      },
      { status: 501 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const { id } = await params;
  const projectDir = path.join(PROJECTS_DIR, id);
  const inputDir = path.join(projectDir, "00 Input");

  try {
    const formData = await request.formData();
    const kind = formData.get("kind") as string | null;
    if (!kind) return NextResponse.json({ error: "Missing kind" }, { status: 400 });

    const needsAI = kind === "brief" || kind === "rubric" || kind === "referencing" || kind === "previous";
    if (needsAI && (!apiKey || apiKey === "your-key-here")) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in gui/.env.local" }, { status: 503 });
    }
    const client = needsAI ? new Anthropic({ apiKey: apiKey! }) : null;

    // ── Single-file requirement inputs: copy + convert to a structured summary ──
    if (kind in KIND) {
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      const ext = path.extname(file.name).toLowerCase();
      if (!DOC_EXTS.includes(ext)) {
        return NextResponse.json({ error: `Unsupported "${ext}". Use PDF, .docx, .md, or .txt.` }, { status: 415 });
      }
      await fs.mkdir(inputDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      const ck = kind as ConvertKind;
      const rawPath = path.join(inputDir, `${KIND[ck].raw}${ext}`);
      await fs.writeFile(rawPath, buffer);

      const md = await runClaude(client!, convertPrompt(ck), await buildBlocks(buffer, ext, "Process the attached document per your instructions."));
      const mdWithSource = `<!-- generated from ${file.name} on ingest -->\n\n\`\`\`\n${rawPath}\n\`\`\`\n\n${md}\n`;
      await fs.writeFile(path.join(inputDir, KIND[ck].md), mdWithSource, "utf-8");

      let assignmentType: "essay" | "presentation" | null = null;
      if (ck === "brief") {
        assignmentType = parseAssignmentType(md);
        if (assignmentType) {
          try {
            const statePath = path.join(projectDir, "project-state.json");
            const state = JSON.parse(await fs.readFile(statePath, "utf-8"));
            state.project = state.project ?? {};
            state.project.assignmentType = assignmentType;
            await fs.writeFile(statePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
          } catch { /* state missing — md still holds the type */ }
        }
      }
      return NextResponse.json({ success: true, kind, original: file.name, assignmentType, markdown: md });
    }

    // ── Previous assignments: copy originals + verbatim Markdown extraction ──
    if (kind === "previous") {
      const files = formData.getAll("file").filter((f): f is File => f instanceof File);
      if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
      const prevDir = path.join(inputDir, "previous_assignments");
      await fs.mkdir(prevDir, { recursive: true });

      const results: { name: string; extracted: boolean; note?: string }[] = [];
      for (const file of files) {
        const ext = path.extname(file.name).toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());
        const clean = safeName(file.name);
        await fs.writeFile(path.join(prevDir, clean), buffer); // original (gitignored if pdf/docx)

        if (ext === ".md" || ext === ".txt") {
          await fs.writeFile(path.join(prevDir, `${baseNoExt(clean)}.md`), buffer.toString("utf-8"), "utf-8");
          results.push({ name: file.name, extracted: true });
        } else if (ext === ".docx") {
          const text = await docxToText(buffer);
          await fs.writeFile(path.join(prevDir, `${baseNoExt(clean)}.md`), `<!-- verbatim extraction of ${file.name} -->\n\n${text}\n`, "utf-8");
          results.push({ name: file.name, extracted: true });
        } else if (ext === ".pdf") {
          const md = await runClaude(client!, TRANSCRIBE_PROMPT, await buildBlocks(buffer, ext, "Transcribe the attached document."), 8192);
          await fs.writeFile(path.join(prevDir, `${baseNoExt(clean)}.md`), `<!-- verbatim extraction of ${file.name} -->\n\n${md}\n`, "utf-8");
          results.push({ name: file.name, extracted: true });
        } else {
          results.push({ name: file.name, extracted: false, note: `${ext} kept local; no text extractor` });
        }
      }

      // Rebuild index.md from what's on disk.
      const entries = (await fs.readdir(prevDir)).filter((f) => !f.startsWith(".") && f !== "index.md");
      const originals = entries.filter((f) => !f.endsWith(".md") || !entries.includes(f.replace(/\.md$/, "") + path.extname(f)));
      const rows = entries.filter((f) => !f.endsWith(".md")).map((orig) => {
        const md = `${baseNoExt(orig)}.md`;
        return `| ${orig} | ${entries.includes(md) ? md : "—"} |`;
      });
      const index = `# Previous Assignments\n\nPrior works by the student — Alex matches the essay's voice to these.\nOriginals kept local; \`.md\` extractions are committed.\n\n| Original | Text extraction |\n|---|---|\n${rows.join("\n")}\n`;
      await fs.writeFile(path.join(prevDir, "index.md"), index, "utf-8");

      return NextResponse.json({ success: true, kind, count: files.length, results, totalOnDisk: originals.length });
    }

    // ── Curriculum: copy a picked folder (current / wiki) in + rebuild the index ──
    if (kind === "curriculum") {
      const subdirRaw = (formData.get("subdir") as string | null) ?? "current";
      const subdir = subdirRaw === "wiki" ? "wiki" : "current";
      const files = formData.getAll("file").filter((f): f is File => f instanceof File);
      const relPaths = formData.getAll("path").map(String);
      if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

      const curDir = path.join(inputDir, "curriculum");
      const destRoot = path.join(curDir, subdir);
      await fs.mkdir(destRoot, { recursive: true });

      let copied = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Strip the chosen top folder from the relative path so we don't nest it twice.
        const rel = (relPaths[i] || file.name).split("/").slice(1).join("/") || safeName(file.name);
        const dest = path.join(destRoot, rel);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
        copied++;
      }

      // Rebuild curriculum/README.md from both subdirs.
      async function listDir(sub: string): Promise<string[]> {
        const out: string[] = [];
        async function walk(d: string, base: string) {
          let ents: import("fs").Dirent[] = [];
          try { ents = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
          for (const e of ents) {
            if (e.name.startsWith(".")) continue;
            const rel = path.join(base, e.name).replace(/\\/g, "/");
            if (e.isDirectory()) await walk(path.join(d, e.name), rel);
            else out.push(rel);
          }
        }
        await walk(path.join(curDir, sub), "");
        return out;
      }
      const cur = await listDir("current");
      const wiki = await listDir("wiki");
      const sec = (title: string, files: string[]) =>
        `## ${title}\n${files.length ? files.map((f) => `- ${f}`).join("\n") : "_(empty)_"}\n`;
      const readme = `# Curriculum\n\nModule materials copied into this project. Markdown is committed; heavy files stay local.\n\n${sec("current/", cur)}\n${sec("wiki/", wiki)}`;
      await fs.writeFile(path.join(curDir, "README.md"), readme, "utf-8");

      return NextResponse.json({ success: true, kind, subdir, copied });
    }

    return NextResponse.json({ error: `Unknown kind "${kind}"` }, { status: 400 });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("EROFS") || msg.includes("read-only")) {
      return NextResponse.json(
        { error: "This environment's filesystem is read-only — Setup ingestion only works locally (pnpm dev).", readOnly: true },
        { status: 501 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
