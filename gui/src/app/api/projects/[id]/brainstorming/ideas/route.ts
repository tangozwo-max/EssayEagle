import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

function ideasDir(projectId: string) {
  return path.join(PROJECTS_DIR, projectId, "02 Brainstorming", "ideas");
}

function readAllIdeas(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.startsWith("idea-") && f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ideas = readAllIdeas(ideasDir(id));
  return NextResponse.json(ideas);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, thesis } = await req.json() as { title: string; thesis: string };

  const dir = ideasDir(id);
  fs.mkdirSync(dir, { recursive: true });

  const ideaId = crypto.randomBytes(2).toString("hex");
  const idea = {
    id: ideaId,
    title: title.trim(),
    thesis: thesis.trim(),
    createdAt: new Date().toISOString(),
    scores: { evidenceBase: null, actuality: null, curriculumFit: null },
    notes: "",
  };

  fs.writeFileSync(path.join(dir, `idea-${ideaId}.json`), JSON.stringify(idea, null, 2));

  return NextResponse.json(idea, { status: 201 });
}
