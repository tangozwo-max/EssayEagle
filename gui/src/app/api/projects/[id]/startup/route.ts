import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

function readInputFile(projectPath: string, relPath: string): string | null {
  const p = path.join(projectPath, "00 Input", relPath);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
}

function extractSourcePath(content: string): string | null {
  const m = content.match(/```[^\n]*\r?\n([A-Z]:\\[^\r\n`]+)\r?\n```/);
  return m ? m[1].trim() : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectPath = path.join(PROJECTS_DIR, id);

  if (!fs.existsSync(projectPath)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const briefContent = readInputFile(projectPath, "assessment_brief.md");
  const rubricContent = readInputFile(projectPath, "grading_rubric.md");
  const refContent = readInputFile(projectPath, "referencing_style_guide.md");
  const curriculumContent = readInputFile(projectPath, "curriculum/README.md");

  const briefPath = briefContent ? extractSourcePath(briefContent) : null;
  const rubricPath = rubricContent ? extractSourcePath(rubricContent) : null;
  const refPath = refContent ? extractSourcePath(refContent) : null;

  const prevDir = path.join(projectPath, "00 Input", "previous_assignments");
  const prevFiles = fs.existsSync(prevDir)
    ? fs.readdirSync(prevDir).filter(f => !f.startsWith(".") && f !== "index.md")
    : [];

  const prevIndexContent = readInputFile(projectPath, "previous_assignments/index.md");

  // Detected assignment type (set by the brief ingestion), read from project-state.
  let assignmentType: string | null = null;
  try {
    const statePath = path.join(projectPath, "project-state.json");
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
      assignmentType = state.project?.assignmentType ?? null;
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    assignmentType,
    brief: {
      available: briefContent !== null,
      content: briefContent,
      sourcePath: briefPath,
      sourceExists: briefPath ? fs.existsSync(briefPath) : false,
    },
    rubric: {
      available: rubricContent !== null,
      content: rubricContent,
      sourcePath: rubricPath,
      sourceExists: rubricPath ? fs.existsSync(rubricPath) : false,
    },
    referencing: {
      available: refContent !== null,
      content: refContent,
      sourcePath: refPath,
      sourceExists: refPath ? fs.existsSync(refPath) : false,
    },
    previousAssignments: {
      count: prevFiles.length,
      indexContent: prevIndexContent,
    },
    curriculum: {
      hasReadme: curriculumContent !== null,
      content: curriculumContent,
    },
  });
}
