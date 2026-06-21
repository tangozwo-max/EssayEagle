// Server-only data access for projects. Reads the live filesystem first (fresh, and
// writable, when running locally / offline) and falls back to the build-time snapshot
// (src/data/projects-snapshot.json) when the "../01 projects" folder isn't available —
// e.g. on Vercel, where the app is read-only and the folder isn't deployed.
import path from "path";
import fs from "fs";
import snapshot from "@/data/projects-snapshot.json";

export const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

type Snapshot = {
  generatedAt: string;
  projects: Record<string, { state: ProjectStateLike; files: Record<string, string> }>;
};
type ProjectStateLike = {
  project?: Record<string, unknown>;
  budget?: Record<string, unknown>;
  [k: string]: unknown;
};

const snap = snapshot as unknown as Snapshot;

/** True when the live projects folder is readable (local/offline). */
export function fsAvailable(): boolean {
  try {
    return fs.existsSync(PROJECTS_DIR) && fs.statSync(PROJECTS_DIR).isDirectory();
  } catch {
    return false;
  }
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  currentPhase: string;
  budget: { capEur: number; spentEur: number } | null;
  currentVersion: string | null;
  acceptedVersion: string | null;
}

function summarize(id: string, state: ProjectStateLike): ProjectSummary {
  const p = (state.project ?? {}) as Record<string, unknown>;
  const budget = (p.budget ?? state.budget ?? null) as Record<string, unknown> | null;
  return {
    id,
    name: (p.name as string) ?? id,
    status: p.archived ? "archived" : "active",
    currentPhase: (p.currentWorkflow as string) ?? (state.currentPhase as string) ?? "unknown",
    budget: budget
      ? {
          capEur: (budget.cap as number) ?? (budget.capEur as number) ?? 15,
          spentEur: (budget.spent as number) ?? (budget.spentEur as number) ?? 0,
        }
      : null,
    currentVersion: (p.currentVersion as string) ?? null,
    acceptedVersion: (p.acceptedVersion as string) ?? null,
  };
}

/** List project summaries: live filesystem if present, else the bundled snapshot. */
export function listProjects(): ProjectSummary[] {
  if (fsAvailable()) {
    try {
      const out: ProjectSummary[] = [];
      for (const e of fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })) {
        if (!e.isDirectory() || e.name.startsWith("_")) continue;
        const stateFile = path.join(PROJECTS_DIR, e.name, "project-state.json");
        if (!fs.existsSync(stateFile)) continue;
        out.push(summarize(e.name, JSON.parse(fs.readFileSync(stateFile, "utf-8"))));
      }
      if (out.length > 0) return out;
    } catch {
      /* fall through to snapshot */
    }
  }
  return Object.entries(snap.projects).map(([id, p]) => summarize(id, p.state));
}

/** Full project state for one id: live filesystem if present, else the snapshot. */
export function getProjectState(id: string): ProjectStateLike | null {
  if (fsAvailable()) {
    const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    }
  }
  return snap.projects[id]?.state ?? null;
}

/**
 * Read the first existing project file from a list of relative candidates
 * (e.g. ["07 QA/result.md"]). Returns { rel, content } or null.
 */
export function readProjectFile(
  id: string,
  candidates: string[]
): { rel: string; content: string } | null {
  if (fsAvailable()) {
    const base = path.join(PROJECTS_DIR, id);
    for (const rel of candidates) {
      const fp = path.join(base, rel);
      if (fs.existsSync(fp)) return { rel, content: fs.readFileSync(fp, "utf-8") };
    }
  }
  const files = snap.projects[id]?.files ?? {};
  for (const rel of candidates) {
    if (rel in files) return { rel, content: files[rel] };
  }
  return null;
}
