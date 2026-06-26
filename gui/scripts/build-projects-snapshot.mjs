// Build-time snapshot of project data so the app can show projects ONLINE (Vercel),
// where the local "../01 projects" folder isn't on the serverless filesystem.
//
// Scans ../01 projects, captures each project-state.json plus the handover-relevant
// markdown (PROJECT.md, _handover/*.md, **/result.md), and writes a single bundled
// JSON inside the app at src/data/projects-snapshot.json. The API reads the live
// filesystem first (fresh locally) and falls back to this snapshot online.
//
// Runs in `prebuild` (and `predev`). If the projects folder isn't reachable at build
// time, it leaves any existing committed snapshot untouched.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUI_DIR = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.resolve(GUI_DIR, "..", "01 projects");
const OUT_FILE = path.join(GUI_DIR, "src", "data", "projects-snapshot.json");

// The five canonical Setup markdown outputs the Setup view displays (NOT every input
// .md — curriculum can be ~100 pages; we only bundle the index to keep the snapshot lean).
const SETUP_MD = new Set([
  "00 Input/assessment_brief.md",
  "00 Input/grading_rubric.md",
  "00 Input/referencing_style_guide.md",
  "00 Input/previous_assignments/index.md",
  "00 Input/curriculum/index.md",
]);

const INCLUDE_MD = [
  (rel) => rel === "PROJECT.md",
  (rel) => rel.startsWith("_handover/") && rel.endsWith(".md"),
  (rel) => rel.endsWith("result.md"),
  (rel) => SETUP_MD.has(rel),
];

// Canonical input drop-folders — captured as a name listing (incl. binaries) so the
// online Setup view can show "this folder has data" even though originals aren't committed.
const INPUT_FOLDERS = ["assignment_brief", "grading_rubric", "referencing_guide", "previous_assignments", "curriculum"];

function listInputs(projDir) {
  const out = {};
  for (const folder of INPUT_FOLDERS) {
    const dir = path.join(projDir, "00 Input", folder);
    const names = [];
    if (fs.existsSync(dir)) {
      const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          if (e.name.startsWith(".")) continue;
          const abs = path.join(d, e.name);
          if (e.isDirectory()) walk(abs);
          else names.push(path.relative(dir, abs).split(path.sep).join("/"));
        }
      };
      walk(dir);
    }
    out[folder] = names;
  }
  return out;
}

function walkMd(dir, base, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(base, abs).split(path.sep).join("/");
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walkMd(abs, base, acc);
    } else if (e.name.endsWith(".md") && INCLUDE_MD.some((f) => f(rel))) {
      acc[rel] = fs.readFileSync(abs, "utf-8");
    }
  }
}

function build() {
  const snapshot = { generatedAt: new Date().toISOString(), projects: {} };

  if (!fs.existsSync(PROJECTS_DIR)) {
    if (fs.existsSync(OUT_FILE)) {
      console.log(`[snapshot] ${PROJECTS_DIR} not found — keeping existing snapshot.`);
      return;
    }
    console.log(`[snapshot] ${PROJECTS_DIR} not found — writing empty snapshot.`);
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2));
    return;
  }

  for (const e of fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith(".")) continue;
    const projDir = path.join(PROJECTS_DIR, e.name);
    const stateFile = path.join(projDir, "project-state.json");
    if (!fs.existsSync(stateFile)) continue;
    let state;
    try {
      state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    } catch {
      continue;
    }
    const files = {};
    walkMd(projDir, projDir, files);
    // Curriculum notes (user's parked thoughts) so the online dashboard can show them.
    let notes = [];
    try {
      const np = path.join(projDir, "03 Curriculum", "notes.json");
      if (fs.existsSync(np)) notes = JSON.parse(fs.readFileSync(np, "utf-8")).notes ?? [];
    } catch { /* ignore */ }
    snapshot.projects[e.name] = { state, files, inputs: listInputs(projDir), notes };
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2));
  const ids = Object.keys(snapshot.projects);
  console.log(`[snapshot] wrote ${ids.length} project(s): ${ids.join(", ")}`);
}

build();
