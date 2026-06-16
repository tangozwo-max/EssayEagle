import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

function getProjectDir(id: string) {
  return path.join(PROJECTS_DIR, id);
}

export async function GET() {
  try {
    const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
    const projects = [];
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith("_")) continue;
      const stateFile = path.join(PROJECTS_DIR, e.name, "project-state.json");
      if (!fs.existsSync(stateFile)) continue;
      const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
      const p = state.project ?? {};
      const budget = p.budget ?? state.budget ?? null;
      projects.push({
        id: e.name,
        name: p.name ?? e.name,
        // "archived" field we set ourselves; project.status is workflow phase
        status: p.archived ? "archived" : "active",
        currentPhase: p.currentWorkflow ?? state.currentPhase ?? "unknown",
        budget: budget ? {
          capEur: budget.cap ?? budget.capEur ?? 15,
          spentEur: budget.spent ?? budget.spentEur ?? 0,
        } : null,
        currentVersion: p.currentVersion ?? null,
        acceptedVersion: p.acceptedVersion ?? null,
      });
    }
    return NextResponse.json(projects);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id ?? body.name.toLowerCase().replace(/\s+/g, "-");
    const dir = getProjectDir(id);
    if (fs.existsSync(dir)) {
      return NextResponse.json({ error: "Project already exists" }, { status: 409 });
    }
    fs.mkdirSync(dir, { recursive: true });
    const state = {
      project: { id, name: body.name, module: body.module ?? "", status: "active" },
      currentPhase: "setup",
      budget: { capEur: 15, warnAtEur: 12, spentEur: 0 },
    };
    fs.writeFileSync(path.join(dir, "project-state.json"), JSON.stringify(state, null, 2));
    return NextResponse.json({ id, ...state });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
