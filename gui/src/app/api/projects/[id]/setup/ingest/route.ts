// Setup ingestion: receive an uploaded input file, copy the original into the
// project's 00 Input/, and (for the assessment brief) use Claude to produce a
// structured Markdown summary of what the assignment actually requires AND detect
// whether it is an essay or a presentation. The detected type is written into
// project-state.json (project.assignmentType).
//
// Local-only: writes to the 01 projects/ folder + calls the Anthropic API. The
// deployed (read-only) app cannot use this route.
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import fs from "fs/promises";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

// Canonical raw + markdown filenames per input kind (live under 00 Input/).
const KIND = {
  brief: { raw: "assessment_brief", md: "assessment_brief.md" },
  rubric: { raw: "grading_rubric", md: "grading_rubric.md" },
  referencing: { raw: "referencing_style_guide", md: "referencing_style_guide.md" },
} as const;
type Kind = keyof typeof KIND;

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

function promptFor(kind: Kind): string {
  if (kind === "brief") return BRIEF_PROMPT;
  if (kind === "rubric") return RUBRIC_PROMPT;
  return REF_PROMPT;
}

/** Build the user content block for Claude from the uploaded file. */
function buildContent(buffer: Buffer, ext: string): Anthropic.ContentBlockParam[] {
  if (ext === ".pdf") {
    return [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") } },
      { type: "text", text: "Process the attached document per your instructions." },
    ];
  }
  // md / txt — send as text
  return [{ type: "text", text: buffer.toString("utf-8") }];
}

function parseAssignmentType(markdown: string): "essay" | "presentation" | null {
  const m = markdown.match(/assignmentType:\s*([a-zA-Z]+)/);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v === "presentation" ? "presentation" : v === "essay" ? "essay" : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in gui/.env.local" }, { status: 503 });
  }

  const { id } = await params;
  const projectDir = path.join(PROJECTS_DIR, id);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string | null) as Kind | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!kind || !(kind in KIND)) {
      return NextResponse.json({ error: `Unknown kind "${kind}"` }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".pdf", ".md", ".txt"].includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type "${ext}". Use PDF (or .md/.txt) for now — .docx support is coming next.` },
        { status: 415 }
      );
    }

    const inputDir = path.join(projectDir, "00 Input");
    await fs.mkdir(inputDir, { recursive: true });

    // 1. Copy the original in (kept local — gitignored for PDFs).
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawPath = path.join(inputDir, `${KIND[kind].raw}${ext}`);
    await fs.writeFile(rawPath, buffer);

    // 2. Convert to a structured Markdown summary via Claude.
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: promptFor(kind),
      messages: [{ role: "user", content: buildContent(buffer, ext) }],
    });
    const markdown = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // Prepend a provenance line so the readiness check can resolve the original.
    const mdWithSource = `<!-- generated from ${file.name} on ingest -->\n\n\`\`\`\n${rawPath}\n\`\`\`\n\n${markdown}\n`;
    await fs.writeFile(path.join(inputDir, KIND[kind].md), mdWithSource, "utf-8");

    // 3. For the brief, record the detected assignment type in project-state.json.
    let assignmentType: "essay" | "presentation" | null = null;
    if (kind === "brief") {
      assignmentType = parseAssignmentType(markdown);
      if (assignmentType) {
        const statePath = path.join(projectDir, "project-state.json");
        try {
          const state = JSON.parse(await fs.readFile(statePath, "utf-8"));
          state.project = state.project ?? {};
          state.project.assignmentType = assignmentType;
          await fs.writeFile(statePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
        } catch {
          /* state file missing — skip, the .md still holds the type */
        }
      }
    }

    return NextResponse.json({
      success: true,
      kind,
      original: file.name,
      assignmentType,
      markdown,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
