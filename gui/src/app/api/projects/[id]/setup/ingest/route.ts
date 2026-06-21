// Setup ingestion / conversion. Two source modes, same conversion logic:
//   - fromFolder=true : convert the file(s) the user already dropped into the canonical
//                       00 Input/<type>/ folder (the primary, read-only-FS-friendly flow);
//   - upload          : convert an uploaded file and copy it into that folder.
// Outputs the Markdown the pipeline reads:
//   brief/rubric/referencing -> a structured "what is required" summary (Claude); brief
//                               also detects essay vs presentation -> project.assignmentType.
//   previous   -> verbatim Markdown extraction of each prior work (Alex's style source).
//   curriculum -> an index of the copied current/ + wiki/ trees.
//
// Writes files + calls the Anthropic API, so it only works locally (read-only on Vercel).
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import path from "path";
import fs from "fs/promises";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

// brief/rubric/referencing: a drop-folder + a canonical generated-markdown path.
const KIND = {
  brief: { folder: "assignment_brief", md: "assessment_brief.md" },
  rubric: { folder: "grading_rubric", md: "grading_rubric.md" },
  referencing: { folder: "referencing_guide", md: "referencing_style_guide.md" },
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

async function runClaude(client: Anthropic, system: string, blocks: Anthropic.ContentBlockParam[], maxTokens = 2048): Promise<string> {
  const resp = await client.messages.create({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages: [{ role: "user", content: blocks }] });
  return resp.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
}

function parseAssignmentType(md: string): "essay" | "presentation" | null {
  const m = md.match(/assignmentType:\s*([a-zA-Z]+)/);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v === "presentation" ? "presentation" : v === "essay" ? "essay" : null;
}

const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._ -]/g, "_");
const baseNoExt = (n: string) => n.replace(/\.[^.]+$/, "");

/** Source files a user dropped in a folder (excludes README/index/dotfiles). */
async function listSources(dir: string): Promise<string[]> {
  try {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    return ents.filter((e) => e.isFile() && !e.name.startsWith(".") && e.name !== "README.md" && e.name !== "index.md").map((e) => e.name);
  } catch { return []; }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return NextResponse.json(
      { error: "Conversion writes files and only works locally (pnpm dev). The deployed app is read-only — convert locally, commit & push.", readOnly: true },
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
    const fromFolder = formData.get("fromFolder") === "true";
    if (!kind) return NextResponse.json({ error: "Missing kind" }, { status: 400 });

    const needsAI = kind === "brief" || kind === "rubric" || kind === "referencing" || kind === "previous";
    if (needsAI && (!apiKey || apiKey === "your-key-here")) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in gui/.env.local" }, { status: 503 });
    }
    const client = needsAI ? new Anthropic({ apiKey: apiKey! }) : null;

    // ── brief / rubric / referencing: one source -> structured markdown ──
    if (kind in KIND) {
      const ck = kind as ConvertKind;
      const folderDir = path.join(inputDir, KIND[ck].folder);
      await fs.mkdir(folderDir, { recursive: true });

      let name: string, ext: string, buffer: Buffer;
      if (fromFolder) {
        const sources = (await listSources(folderDir)).filter((n) => DOC_EXTS.includes(path.extname(n).toLowerCase()));
        if (sources.length === 0) {
          return NextResponse.json({ error: `No source file in 00 Input/${KIND[ck].folder}/. Drop your file there first.` }, { status: 404 });
        }
        name = sources[0];
        ext = path.extname(name).toLowerCase();
        buffer = await fs.readFile(path.join(folderDir, name));
      } else {
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
        ext = path.extname(file.name).toLowerCase();
        if (!DOC_EXTS.includes(ext)) return NextResponse.json({ error: `Unsupported "${ext}". Use PDF, .docx, .md, or .txt.` }, { status: 415 });
        name = safeName(file.name);
        buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(path.join(folderDir, name), buffer); // copy into the drop folder
      }

      const md = await runClaude(client!, convertPrompt(ck), await buildBlocks(buffer, ext, "Process the attached document per your instructions."));
      const mdWithSource = `<!-- generated from 00 Input/${KIND[ck].folder}/${name} -->\n\n${md}\n`;
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
          } catch { /* state missing */ }
        }
      }
      return NextResponse.json({ success: true, kind, original: name, assignmentType, markdown: md });
    }

    // ── previous assignments: copy + verbatim markdown extraction per file ──
    if (kind === "previous") {
      const prevDir = path.join(inputDir, "previous_assignments");
      await fs.mkdir(prevDir, { recursive: true });

      // Gather sources: either already-dropped files, or uploads we copy in.
      let sourceNames: string[];
      if (fromFolder) {
        sourceNames = await listSources(prevDir);
      } else {
        const uploads = formData.getAll("file").filter((f): f is File => f instanceof File);
        if (uploads.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
        sourceNames = [];
        for (const file of uploads) {
          const clean = safeName(file.name);
          await fs.writeFile(path.join(prevDir, clean), Buffer.from(await file.arrayBuffer()));
          sourceNames.push(clean);
        }
      }

      const results: { name: string; extracted: boolean }[] = [];
      for (const fname of sourceNames) {
        const ext = path.extname(fname).toLowerCase();
        if (ext === ".md") { results.push({ name: fname, extracted: true }); continue; } // already markdown
        const buffer = await fs.readFile(path.join(prevDir, fname));
        if (ext === ".txt") {
          await fs.writeFile(path.join(prevDir, `${baseNoExt(fname)}.md`), buffer.toString("utf-8"), "utf-8");
          results.push({ name: fname, extracted: true });
        } else if (ext === ".docx") {
          await fs.writeFile(path.join(prevDir, `${baseNoExt(fname)}.md`), `<!-- verbatim extraction of ${fname} -->\n\n${await docxToText(buffer)}\n`, "utf-8");
          results.push({ name: fname, extracted: true });
        } else if (ext === ".pdf") {
          const md = await runClaude(client!, TRANSCRIBE_PROMPT, await buildBlocks(buffer, ext, "Transcribe the attached document."), 8192);
          await fs.writeFile(path.join(prevDir, `${baseNoExt(fname)}.md`), `<!-- verbatim extraction of ${fname} -->\n\n${md}\n`, "utf-8");
          results.push({ name: fname, extracted: true });
        } else {
          results.push({ name: fname, extracted: false });
        }
      }

      const entries = (await fs.readdir(prevDir)).filter((f) => !f.startsWith(".") && f !== "index.md" && f !== "README.md");
      const rows = entries.filter((f) => !f.endsWith(".md")).map((orig) => {
        const md = `${baseNoExt(orig)}.md`;
        return `| ${orig} | ${entries.includes(md) ? md : "—"} |`;
      });
      const index = `# Previous Assignments\n\nPrior works by the student — Alex matches the essay's voice to these.\nOriginals kept local; \`.md\` extractions are committed.\n\n| Original | Text extraction |\n|---|---|\n${rows.join("\n")}\n`;
      await fs.writeFile(path.join(prevDir, "index.md"), index, "utf-8");
      return NextResponse.json({ success: true, kind, count: sourceNames.length, results });
    }

    // ── curriculum: (optionally copy an uploaded folder) + rebuild index.md ──
    if (kind === "curriculum") {
      const curDir = path.join(inputDir, "curriculum");
      await fs.mkdir(curDir, { recursive: true });

      if (!fromFolder) {
        const subdir = (formData.get("subdir") as string | null) === "wiki" ? "wiki" : "current";
        const files = formData.getAll("file").filter((f): f is File => f instanceof File);
        const relPaths = formData.getAll("path").map(String);
        if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
        const destRoot = path.join(curDir, subdir);
        for (let i = 0; i < files.length; i++) {
          const rel = (relPaths[i] || files[i].name).split("/").slice(1).join("/") || safeName(files[i].name);
          const dest = path.join(destRoot, rel);
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.writeFile(dest, Buffer.from(await files[i].arrayBuffer()));
        }
      }

      async function listTree(sub: string): Promise<string[]> {
        const out: string[] = [];
        async function walk(d: string, base: string) {
          let ents: import("fs").Dirent[] = [];
          try { ents = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
          for (const e of ents) {
            if (e.name.startsWith(".")) continue;
            const rel = path.join(base, e.name).replace(/\\/g, "/");
            if (e.isDirectory()) await walk(path.join(d, e.name), rel);
            else if (e.name !== "index.md" && e.name !== "README.md") out.push(rel);
          }
        }
        await walk(path.join(curDir, sub), "");
        return out;
      }
      const cur = await listTree("current");
      const wiki = await listTree("wiki");
      const sec = (title: string, files: string[]) => `## ${title}\n${files.length ? files.map((f) => `- ${f}`).join("\n") : "_(empty)_"}\n`;
      await fs.writeFile(path.join(curDir, "index.md"), `# Curriculum\n\nModule materials in this project. Markdown is committed; heavy files stay local.\n\n${sec("current/", cur)}\n${sec("wiki/", wiki)}`, "utf-8");
      return NextResponse.json({ success: true, kind, copied: cur.length + wiki.length });
    }

    return NextResponse.json({ error: `Unknown kind "${kind}"` }, { status: 400 });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("EROFS") || msg.includes("read-only")) {
      return NextResponse.json({ error: "Filesystem is read-only — conversion only works locally (pnpm dev).", readOnly: true }, { status: 501 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
