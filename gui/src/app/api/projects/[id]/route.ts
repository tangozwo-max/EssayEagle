import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
    if (!fs.existsSync(stateFile)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    return NextResponse.json(state);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
    if (!fs.existsSync(stateFile)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    const updates = await req.json();
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === "object" && !Array.isArray(updates[key]) && state[key]) {
        state[key] = { ...state[key], ...updates[key] };
      } else {
        state[key] = updates[key];
      }
    }
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    return NextResponse.json(state);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}