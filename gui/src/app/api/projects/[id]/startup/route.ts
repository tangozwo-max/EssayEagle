// Setup readiness for the Setup view. For each input type it reports:
//   - whether the drop-folder (00 Input/<folder>/) has source files ("folder has data"),
//   - the converted markdown content (to display / scroll), if it exists.
// Reads the live filesystem locally; falls back to the build-time snapshot online
// (where originals aren't committed — only the markdown + a captured file listing).
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { fsAvailable, PROJECTS_DIR } from "@/lib/projects-store";
import snapshot from "@/data/projects-snapshot.json";

type SnapEntry = {
  state?: { project?: { assignmentType?: string } };
  files?: Record<string, string>;
  inputs?: Record<string, string[]>;
};
const snap = snapshot as unknown as { projects: Record<string, SnapEntry> };

const TYPES = [
  { key: "brief", folder: "assignment_brief", md: "00 Input/assessment_brief.md" },
  { key: "rubric", folder: "grading_rubric", md: "00 Input/grading_rubric.md" },
  { key: "referencing", folder: "referencing_guide", md: "00 Input/referencing_style_guide.md" },
  { key: "previous", folder: "previous_assignments", md: "00 Input/previous_assignments/index.md" },
  { key: "curriculum", folder: "curriculum", md: "00 Input/curriculum/index.md" },
] as const;

// README = drop instructions, index = generated index — neither counts as a "source".
const IGNORE = new Set(["README.md", "index.md"]);

function listFolderFs(projDir: string, folder: string): string[] {
  const dir = path.join(projDir, "00 Input", folder);
  const names: string[] = [];
  if (!fs.existsSync(dir)) return names;
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else names.push(path.relative(dir, abs).split(path.sep).join("/"));
    }
  };
  walk(dir);
  return names;
}

const sourcesOf = (all: string[]) => all.filter((n) => !IGNORE.has(n.split("/").pop() || ""));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = fsAvailable();
  const projDir = path.join(PROJECTS_DIR, id);

  const readMd = (rel: string): string | null => {
    if (live) {
      const p = path.join(projDir, rel);
      return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
    }
    return snap.projects[id]?.files?.[rel] ?? null;
  };
  const folderFiles = (folder: string): string[] =>
    live ? listFolderFs(projDir, folder) : snap.projects[id]?.inputs?.[folder] ?? [];

  const inputs: Record<string, { hasSource: boolean; sources: string[]; md: string | null }> = {};
  for (const t of TYPES) {
    const sources = sourcesOf(folderFiles(t.folder));
    inputs[t.key] = { hasSource: sources.length > 0, sources, md: readMd(t.md) };
  }

  let assignmentType: string | null = null;
  if (live) {
    const sp = path.join(projDir, "project-state.json");
    if (fs.existsSync(sp)) {
      try { assignmentType = JSON.parse(fs.readFileSync(sp, "utf-8"))?.project?.assignmentType ?? null; } catch {}
    }
  } else {
    assignmentType = snap.projects[id]?.state?.project?.assignmentType ?? null;
  }

  return NextResponse.json({ readOnly: !live, assignmentType, inputs });
}
