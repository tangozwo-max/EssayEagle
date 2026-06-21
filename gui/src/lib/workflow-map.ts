// Canonical pipeline definition for the EssayEagle app — the SINGLE SOURCE OF TRUTH
// for phase/workflow ids inside the GUI. It MIRRORS /structure/workflow-map.json (the
// language-neutral copy read by AI assistants and shown online). Keep the two in sync.
//
// Before this module, three files disagreed on ids (types.ts, team.ts, the phase-result
// route), which broke sidebar status dots and workflow pages for curriculum / fqa / final
// / illustration. Everything now derives from the canonical ids + aliases below.

export type PhaseId = "preparation" | "creation" | "finalisation";

export interface CanonWorkflow {
  id: string;
  aliases: string[];
  phase: PhaseId;
  folder: string; // relative to the project root
  result: string; // "<folder>/result.md" — the handover into the next workflow
  leads: string[];
  optional?: boolean;
}

export const PHASE_ORDER: PhaseId[] = ["preparation", "creation", "finalisation"];

// 12 workflows grouped under 3 phases. Folders 01–08 are the physical project
// directories; revision / submission-prep / retrospective live in sub-folders so
// every workflow still follows the "<folder>/result.md" handover convention.
// NOTE: Preparation runs setup → curriculum → brainstorming (map the module first,
// then brainstorm a topic within it), so display order differs from folder numbers.
export const CANON_WORKFLOWS: CanonWorkflow[] = [
  { id: "setup",              aliases: [],                       phase: "preparation",  folder: "01 Setup",                  result: "01 Setup/result.md",                  leads: ["christoph", "egbert"] },
  { id: "curriculum",         aliases: ["curriculum-mapping"],   phase: "preparation",  folder: "03 Curriculum",             result: "03 Curriculum/result.md",             leads: ["peter"] },
  { id: "brainstorming",      aliases: [],                       phase: "preparation",  folder: "02 Brainstorming",          result: "02 Brainstorming/result.md",          leads: ["steven", "jackie"] },
  { id: "research",           aliases: [],                       phase: "creation",     folder: "04 Research",               result: "04 Research/result.md",               leads: ["jackie"] },
  { id: "outline",            aliases: [],                       phase: "creation",     folder: "05 Outline",                result: "05 Outline/result.md",                leads: ["hank", "steven"] },
  { id: "drafting",           aliases: [],                       phase: "creation",     folder: "06 Drafting",               result: "06 Drafting/result.md",               leads: ["hank", "alex"] },
  { id: "revision",           aliases: [],                       phase: "creation",     folder: "06 Drafting/revision",      result: "06 Drafting/revision/result.md",      leads: ["steven", "peter", "alex"] },
  { id: "illustration",       aliases: [],                       phase: "creation",     folder: "06 Drafting/illustrations", result: "06 Drafting/illustrations/result.md", leads: ["vanessa"], optional: true },
  { id: "quality-assessment", aliases: ["fqa", "qa"],            phase: "finalisation", folder: "07 QA",                     result: "07 QA/result.md",                     leads: ["christoph", "jackie", "peter", "steven", "alex"] },
  { id: "finalisation",       aliases: ["final"],                phase: "finalisation", folder: "08 Final",                  result: "08 Final/result.md",                  leads: ["egbert"] },
  { id: "submission-prep",    aliases: ["submission"],           phase: "finalisation", folder: "08 Final/submission",       result: "08 Final/submission/result.md",       leads: ["praktikant", "christoph"] },
  { id: "retrospective",      aliases: [],                       phase: "finalisation", folder: "08 Final/retrospective",    result: "08 Final/retrospective/result.md",    leads: ["baerbel", "egbert"] },
];

// Pipeline order as a literal tuple so WorkflowId stays a precise union.
export const WORKFLOW_IDS = [
  "setup",
  "curriculum",
  "brainstorming",
  "research",
  "outline",
  "drafting",
  "revision",
  "illustration",
  "quality-assessment",
  "finalisation",
  "submission-prep",
  "retrospective",
] as const;

export type WorkflowId = (typeof WORKFLOW_IDS)[number];

const ALIAS_TO_ID: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const w of CANON_WORKFLOWS) {
    m[w.id] = w.id;
    for (const a of w.aliases) m[a] = w.id;
  }
  return m;
})();

/** Resolve any historical/alias id (e.g. "fqa", "curriculum-mapping") to its canonical id. */
export function canonicalId(id: string): string {
  return ALIAS_TO_ID[id] ?? id;
}

export function workflowById(id: string): CanonWorkflow | undefined {
  const cid = canonicalId(id);
  return CANON_WORKFLOWS.find((w) => w.id === cid);
}

export function workflowsInPhase(phase: PhaseId): CanonWorkflow[] {
  return CANON_WORKFLOWS.filter((w) => w.phase === phase);
}
