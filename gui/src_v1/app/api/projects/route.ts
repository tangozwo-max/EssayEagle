import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Project, ProjectState } from "@/lib/types";
import { emptyWorkflowState, WORKFLOW_IDS } from "@/lib/types";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

export async function GET() {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: Project[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const stateFile = path.join(PROJECTS_DIR, entry.name, "project-state.json");
      try {
        const data = await fs.readFile(stateFile, "utf-8");
        const state: ProjectState = JSON.parse(data);
        projects.push(state.project);
      } catch {
        // No project-state.json yet — return minimal entry
        projects.push({
          id: entry.name,
          name: entry.name,
          module: "",
          part: "",
          status: "setup",
          createdAt: new Date().toISOString(),
          currentWorkflow: "setup",
        });
      }
    }

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}

// Workflow folder names (human-readable, ordered)
const WORKFLOW_FOLDERS = [
  { id: "setup", folder: "01 Setup" },
  { id: "brainstorming", folder: "02 Brainstorming" },
  { id: "curriculum-mapping", folder: "03 Curriculum" },
  { id: "research", folder: "04 Research" },
  { id: "outline", folder: "05 Outline" },
  { id: "drafting", folder: "06 Drafting" },
  { id: "quality-assessment", folder: "07 QA" },
  { id: "finalisation", folder: "08 Final" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    // Create a safe folder name from the project name
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    const projectDir = path.join(PROJECTS_DIR, id);

    // Create workflow subfolders
    for (const { folder } of WORKFLOW_FOLDERS) {
      await fs.mkdir(path.join(projectDir, folder), { recursive: true });
    }

    const initialWorkflows: Record<string, ReturnType<typeof emptyWorkflowState>> = {};
    WORKFLOW_IDS.forEach((wfId, i) => {
      initialWorkflows[wfId] = emptyWorkflowState(i === 0 ? "ready" : "locked");
    });

    const state: ProjectState = {
      project: {
        id,
        name,
        module: "",
        part: "",
        status: "setup",
        createdAt: new Date().toISOString(),
        currentWorkflow: "setup",
      },
      documents: [],
      workflows: initialWorkflows,
    };

    await fs.writeFile(
      path.join(projectDir, "project-state.json"),
      JSON.stringify(state, null, 2),
      "utf-8"
    );

    return NextResponse.json(state, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
