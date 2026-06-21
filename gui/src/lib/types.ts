// Essay Fabrik V0.2 — Project & Workflow Types

export interface Project {
  id: string;
  name: string;
  module: string;
  part: string;
  subtitle?: string;
  status: "setup" | "in-progress" | "submitted" | "archived";
  createdAt: string;
  currentPhase?: string;
  currentWorkflow: string;
}

export interface BrainstormingIdea {
  id: string;
  title: string;
  thesis: string;
  createdAt: string;
  scores?: {
    evidenceBase: number | null;
    actuality: number | null;
    curriculumFit: number | null;
  };
  notes?: string;
}

export interface DocumentRef {
  filename: string;
  type: "pdf" | "docx" | "md" | "other";
  path: string;
  category:
    | "assignment-brief"
    | "rubric"
    | "curriculum"
    | "source"
    | "draft"
    | "output"
    | "other";
  summary?: string;
  addedAt: string;
}

export interface WorkflowMessage {
  id: string;
  agentId: string; // team member id or "user"
  content: string;
  timestamp: string;
  type: "note" | "suggestion" | "decision" | "deliverable";
}

export interface WorkflowState {
  status: "locked" | "ready" | "in-progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  input: {
    documents: DocumentRef[];
    previousWorkflowOutput?: string;
    notes: string;
  };
  workingArea: {
    messages: WorkflowMessage[];
  };
  output: {
    content: string;
    documents: DocumentRef[];
    summary: string;
  };
}

export interface ProjectState {
  project: Project;
  documents: DocumentRef[];
  workflows: Record<string, WorkflowState>;
}

// Default empty workflow state
export function emptyWorkflowState(
  status: WorkflowState["status"] = "locked"
): WorkflowState {
  return {
    status,
    input: { documents: [], notes: "" },
    workingArea: { messages: [] },
    output: { content: "", documents: [], summary: "" },
  };
}

// Workflow ids in pipeline order — re-exported from the single source of truth
// (lib/workflow-map.ts, which mirrors /structure/workflow-map.json).
export { WORKFLOW_IDS } from "./workflow-map";
export type { WorkflowId } from "./workflow-map";
