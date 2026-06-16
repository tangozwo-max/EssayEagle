// Essay Fabrik V0.2 — Project & Workflow Types

export interface Project {
  id: string;
  name: string;
  module: string;
  part: string;
  status: "setup" | "in-progress" | "submitted" | "archived";
  createdAt: string;
  currentWorkflow: string;
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

// All workflow IDs in pipeline order
export const WORKFLOW_IDS = [
  "setup",
  "brainstorming",
  "curriculum-mapping",
  "research",
  "outline",
  "drafting",
  "quality-assessment",
  "finalisation",
] as const;

export type WorkflowId = (typeof WORKFLOW_IDS)[number];
