import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { listProjects, fsAvailable, PROJECTS_DIR } from "@/lib/projects-store";

export async function GET() {
  try {
    return NextResponse.json(listProjects());
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Creating a project writes to disk — only possible on the local/offline app.
  // Online (read-only filesystem) this is unavailable; surface a clear message.
  if (!fsAvailable()) {
    return NextResponse.json(
      { error: "Read-only online: create and edit projects in the local app." },
      { status: 501 }
    );
  }
  try {
    const body = await req.json();
    const id = body.id ?? body.name.toLowerCase().replace(/\s+/g, "-");
    const dir = path.join(PROJECTS_DIR, id);
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
