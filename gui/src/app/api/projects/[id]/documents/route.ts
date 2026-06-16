import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DocumentRef } from "@/lib/types";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

// Maps workflow IDs to folder names
const WORKFLOW_FOLDERS: Record<string, string> = {
  setup: "01 Setup",
  brainstorming: "02 Brainstorming",
  "curriculum-mapping": "03 Curriculum",
  research: "04 Research",
  outline: "05 Outline",
  drafting: "06 Drafting",
  "quality-assessment": "07 QA",
  finalisation: "08 Final",
};

function getFileType(filename: string): DocumentRef["type"] {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx" || ext === ".doc") return "docx";
  if (ext === ".md") return "md";
  return "other";
}

function guessCategory(filename: string): DocumentRef["category"] {
  const lower = filename.toLowerCase();
  if (lower.includes("rubric") || lower.includes("grading")) return "rubric";
  if (lower.includes("brief") || lower.includes("assessment")) return "assignment-brief";
  if (lower.includes("curriculum")) return "curriculum";
  if (lower.includes("draft")) return "draft";
  return "other";
}

async function scanDir(dirPath: string, relativeTo: string): Promise<DocumentRef[]> {
  const docs: DocumentRef[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subDocs = await scanDir(fullPath, relativeTo);
        docs.push(...subDocs);
      } else {
        const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, "/");
        docs.push({
          filename: entry.name,
          type: getFileType(entry.name),
          path: relPath,
          category: guessCategory(entry.name),
          addedAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return docs;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectDir = path.join(PROJECTS_DIR, id);

  // Check for ?workflow= query param
  const url = new URL(request.url);
  const workflowId = url.searchParams.get("workflow");

  if (workflowId && WORKFLOW_FOLDERS[workflowId]) {
    // Scan specific workflow folder
    const wfDir = path.join(projectDir, WORKFLOW_FOLDERS[workflowId]);
    const docs = await scanDir(wfDir, projectDir);
    return NextResponse.json({ documents: docs, total: docs.length });
  }

  // Scan all workflow folders + legacy Input/Output
  const allDocs: DocumentRef[] = [];

  // Scan workflow folders
  for (const [, folder] of Object.entries(WORKFLOW_FOLDERS)) {
    const wfDir = path.join(projectDir, folder);
    const docs = await scanDir(wfDir, projectDir);
    allDocs.push(...docs);
  }

  // Also scan legacy 01 Input / 02 Output for backwards compatibility
  const legacyInput = await scanDir(path.join(projectDir, "01 Input"), projectDir);
  const legacyOutput = await scanDir(path.join(projectDir, "02 Output"), projectDir);
  allDocs.push(...legacyInput, ...legacyOutput);

  return NextResponse.json({
    documents: allDocs,
    total: allDocs.length,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectDir = path.join(PROJECTS_DIR, id);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workflowId = formData.get("workflow") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine target folder
    const folder = workflowId && WORKFLOW_FOLDERS[workflowId]
      ? WORKFLOW_FOLDERS[workflowId]
      : "01 Setup";
    const targetDir = path.join(projectDir, folder);
    await fs.mkdir(targetDir, { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    const targetPath = path.join(targetDir, file.name);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ success: true, filename: file.name });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
