// Wiki browser: lists the module 1–5 knowledge vault copied into
// 00 Input/curriculum/wiki/ (concepts / entities / sources / …) and serves a note's
// content. Reads disk locally; online the tree comes from the snapshot listing and
// content is read-only (open the local app to read full notes).
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { fsAvailable, PROJECTS_DIR } from "@/lib/projects-store";
import snapshot from "@/data/projects-snapshot.json";

const snap = snapshot as unknown as { projects: Record<string, { inputs?: Record<string, string[]> }> };

const wikiDir = (id: string) => path.join(PROJECTS_DIR, id, "00 Input", "curriculum", "wiki");

function listWikiFs(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    let ents: fs.Dirent[] = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.name.endsWith(".md")) out.push(path.relative(dir, abs).split(path.sep).join("/"));
    }
  };
  walk(dir);
  return out;
}

const titleOf = (rel: string) => (rel.split("/").pop() || rel).replace(/\.md$/, "");

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = fsAvailable();
  const dir = wikiDir(id);
  const filePath = new URL(req.url).searchParams.get("path");

  // ── content of a single note ──
  if (filePath) {
    const safe = filePath.replace(/\\/g, "/").replace(/\.\.+/g, "");
    if (live) {
      const fp = path.join(dir, safe);
      if (fp.startsWith(dir) && fs.existsSync(fp)) {
        return NextResponse.json({ path: safe, content: fs.readFileSync(fp, "utf-8") });
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ path: safe, content: null, readOnly: true });
  }

  // ── tree, grouped by top-level category ──
  const files = live
    ? listWikiFs(dir)
    : (snap.projects[id]?.inputs?.curriculum ?? []).filter((f) => f.startsWith("wiki/") && f.endsWith(".md")).map((f) => f.slice("wiki/".length));

  const categories: Record<string, { title: string; path: string }[]> = {};
  for (const f of files) {
    const top = f.includes("/") ? f.split("/")[0] : "root";
    (categories[top] ??= []).push({ title: titleOf(f), path: f });
  }
  for (const k of Object.keys(categories)) categories[k].sort((a, b) => a.title.localeCompare(b.title));

  return NextResponse.json({ available: files.length > 0, readOnly: !live, total: files.length, categories });
}
