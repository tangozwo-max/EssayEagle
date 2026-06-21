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

const INCLUDE_MD = [
  (rel) => rel === "PROJECT.md",
  (rel) => rel.startsWith("_handover/") && rel.endsWith(".md"),
  (rel) => rel.endsWith("result.md"),
];

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
    snapshot.projects[e.name] = { state, files };
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2));
  const ids = Object.keys(snapshot.projects);
  console.log(`[snapshot] wrote ${ids.length} project(s): ${ids.join(", ")}`);
}

build();
