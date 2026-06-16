import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { ProjectState } from "@/lib/types";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
  try {
    const data = await fs.readFile(stateFile, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
  try {
    const existing = await fs.readFile(stateFile, "utf-8");
    const currentState: ProjectState = JSON.parse(existing);
    const updates = await request.json();

    // Deep merge: project, documents, workflows
    const merged: ProjectState = {
      project: { ...currentState.project, ...updates.project },
      documents: updates.documents ?? currentState.documents,
      workflows: {
        ...currentState.workflows,
        ...Object.fromEntries(
          Object.entries(updates.workflows ?? {}).map(
            ([k, v]) => [
              k,
              { ...(currentState.workflows[k] ?? {}), ...(v as Record<string, unknown>) },
            ]
          )
        ),
      },
    };

    await fs.writeFile(stateFile, JSON.stringify(merged, null, 2), "utf-8");
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
