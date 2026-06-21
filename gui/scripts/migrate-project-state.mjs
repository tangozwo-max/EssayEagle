// One-off migration: reconcile every project-state.json to the canonical 12-workflow /
// 3-phase structure (structure/workflow-map.json) WITHOUT losing any progress fields.
// - normalizes workflow keys to canonical ids (curriculum-mapping -> curriculum, fqa -> quality-assessment, ...)
// - ensures all 12 workflows exist (missing ones added as locked)
// - adds project.currentPhase derived from currentWorkflow
// - derives per-workflow status from pipeline position (before=completed, at=in-progress, after=locked)
// - preserves project fields (currentVersion, acceptedVersion, openP1, passThreshold, budget, ...) verbatim
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, "..", "..", "01 projects");

// Canonical pipeline order.
const ORDER = [
  "setup", "curriculum", "brainstorming",
  "research", "outline", "drafting", "revision", "illustration",
  "quality-assessment", "finalisation", "submission-prep", "retrospective",
];
const PHASE_OF = {
  setup: "preparation", curriculum: "preparation", brainstorming: "preparation",
  research: "creation", outline: "creation", drafting: "creation", revision: "creation", illustration: "creation",
  "quality-assessment": "finalisation", finalisation: "finalisation", "submission-prep": "finalisation", retrospective: "finalisation",
};
const ALIAS = {
  "curriculum-mapping": "curriculum",
  fqa: "quality-assessment", qa: "quality-assessment",
  final: "finalisation", submission: "submission-prep",
};
const canon = (id) => ALIAS[id] ?? id;

function emptyWf(status) {
  return { status, input: { documents: [], notes: "" }, workingArea: { messages: [] }, output: { content: "", documents: [], summary: "" } };
}

function migrate(state) {
  const project = state.project ?? {};
  // normalize current pointer
  const curWf = canon(project.currentWorkflow ?? "setup");
  const curIdx = Math.max(0, ORDER.indexOf(curWf));
  project.currentWorkflow = curWf;
  project.currentPhase = PHASE_OF[curWf] ?? "preparation";

  // rebuild workflows under canonical keys, preserving any existing content
  const old = state.workflows ?? {};
  const byCanon = {};
  for (const [k, v] of Object.entries(old)) byCanon[canon(k)] = v;

  const workflows = {};
  ORDER.forEach((id, i) => {
    const derived = i < curIdx ? "completed" : i === curIdx ? "in-progress" : "locked";
    const prev = byCanon[id];
    if (prev) {
      workflows[id] = { ...prev, status: derived };
    } else {
      workflows[id] = emptyWf(derived);
    }
  });

  return { project, documents: state.documents ?? [], workflows };
}

const targets = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(PROJECTS_DIR, e.name, "project-state.json"))
  .filter((p) => fs.existsSync(p));

for (const file of targets) {
  const before = JSON.parse(fs.readFileSync(file, "utf-8"));
  const after = migrate(before);
  fs.writeFileSync(file, JSON.stringify(after, null, 2) + "\n", "utf-8");
  const rel = path.relative(path.join(PROJECTS_DIR, ".."), file);
  console.log(`migrated: ${rel}  (currentWorkflow=${after.project.currentWorkflow}, currentPhase=${after.project.currentPhase}, version=${after.project.currentVersion ?? "-"})`);
}
console.log(`\nDone. ${targets.length} files migrated.`);
