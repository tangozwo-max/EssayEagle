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

export const CANON_WORKFLOWS: CanonWorkflow[] = [
  { id: "setup",              aliases: [],                       phase: "preparation",  folder: "01 Setup",                 result: "01 Setup/result.md",                 leads: ["christoph", "egbert"] },
  { id: "brainstorming",      aliases: [],                       phase: "preparation",  folder: "02 Brainstorming",         result: "02 Brainstorming/result.md",         leads: ["steven", "jackie"] },
  { id: "curriculum",         aliases: ["curriculum-mapping"],   phase: "preparation",  folder: "03 Curriculum",            result: "03 Curriculum/result.md",            leads: ["peter"] },
  { id: "research",           aliases: [],                       phase: "creation",     folder: "04 Research",              result: "04 Research/result.md",              leads: ["jackie"] },
  { id: "outline",            aliases: [],                       phase: "creation",     folder: "05 Outline",               result: "05 Outline/result.md",               leads: ["hank", "steven"] },
  { id: "drafting",           aliases: [],                       phase: "creation",     folder: "06 Drafting",              result: "06 Drafting/result.md",              leads: ["hank", "alex"] },
  { id: "illustration",       aliases: [],                       phase: "creation",     folder: "06 Drafting/illustrations", result: "06 Drafting/illustrations/result.md", leads: ["vanessa"], optional: true },
  { id: "quality-assessment", aliases: ["fqa", "qa"],            phase: "finalisation", folder: "07 QA",                    result: "07 QA/result.md",                    leads: ["christoph", "jackie", "peter", "steven", "alex"] },
  { id: "finalisation",       aliases: ["final"],                phase: "finalisation", folder: "08 Final",                 result: "08 Final/result.md",                 leads: ["egbert"] },
];

// Pipeline order as a literal tuple so WorkflowId stays a precise union.
export const WORKFLOW_IDS = [
  "setup",
  "brainstorming",
  "curriculum",
  "research",
  "outline",
  "drafting",
  "illustration",
  "quality-assessment",
  "finalisation",
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
