// Curriculum notes: the user's parked thoughts while reading the curriculum, each
// tagged (e.g. "Week 1") so they can be pulled into the essay later. Stored at
// 03 Curriculum/notes.json. Writes are local-only (read-only on Vercel); online the
// notes are read from the build-time snapshot.
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { fsAvailable, PROJECTS_DIR } from "@/lib/projects-store";
import snapshot from "@/data/projects-snapshot.json";

type Note = { id: string; tag: string; text: string; createdAt: string; pageSlug?: string };
type Snap = { projects: Record<string, { notes?: Note[] }> };
const snap = snapshot as unknown as Snap;

const notesPath = (id: string) => path.join(PROJECTS_DIR, id, "03 Curriculum", "notes.json");

async function readNotes(id: string): Promise<Note[]> {
  if (fsAvailable()) {
    try { return JSON.parse(await fs.readFile(notesPath(id), "utf-8")).notes ?? []; }
    catch { return []; }
  }
  return snap.projects[id]?.notes ?? [];
}

async function writeNotes(id: string, notes: Note[]): Promise<void> {
  const dir = path.join(PROJECTS_DIR, id, "03 Curriculum");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(notesPath(id), JSON.stringify({ notes }, null, 2) + "\n", "utf-8");
}

function readOnly() {
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !fsAvailable();
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ notes: await readNotes(id), readOnly: readOnly() });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (readOnly()) {
    return NextResponse.json({ error: "Notes are written locally (pnpm dev); the deployed app is read-only.", readOnly: true }, { status: 501 });
  }
  const { id } = await params;
  try {
    const body = await req.json() as { tag?: string; text?: string; pageSlug?: string };
    const text = (body.text ?? "").trim();
    const tag = (body.tag ?? "").trim() || "Untagged";
    if (!text) return NextResponse.json({ error: "Empty note" }, { status: 400 });
    const notes = await readNotes(id);
    const note: Note = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tag, text, createdAt: new Date().toISOString(),
      ...(body.pageSlug ? { pageSlug: body.pageSlug } : {}),
    };
    notes.push(note);
    await writeNotes(id, notes);
    return NextResponse.json({ note, notes });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (readOnly()) {
    return NextResponse.json({ error: "Notes are edited locally; the deployed app is read-only.", readOnly: true }, { status: 501 });
  }
  const { id } = await params;
  const noteId = new URL(req.url).searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 });
  const notes = (await readNotes(id)).filter((n) => n.id !== noteId);
  await writeNotes(id, notes);
  return NextResponse.json({ notes });
}
