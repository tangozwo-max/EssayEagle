// Per-workflow configuration: what each step expects and produces

export interface WorkflowConfig {
  id: string;
  inputLabel: string;
  workingLabel: string;
  outputLabel: string;
  inputDescription: string;
  outputDescription: string;
  previousWorkflow: string | null;
  leads: string[]; // team member ids
}

export const workflowConfigs: Record<string, WorkflowConfig> = {
  setup: {
    id: "setup",
    inputLabel: "Assignment Documents",
    workingLabel: "Requirements Analysis",
    outputLabel: "Assessment Summary",
    inputDescription: "Upload or reference Assignment Brief, Grading Rubric, and any constraints.",
    outputDescription: "Parsed requirements, rubric criteria, formal constraints, and key expectations.",
    previousWorkflow: null,
    leads: ["christoph", "egbert"],
  },
  curriculum: {
    id: "curriculum",
    inputLabel: "Assessment Summary",
    workingLabel: "Concept Mapping",
    outputLabel: "Theory Map",
    inputDescription: "Requirements and constraints from the Setup phase.",
    outputDescription: "Curriculum concepts list with placement suggestions and module alignment.",
    previousWorkflow: "setup",
    leads: ["peter"],
  },
  brainstorming: {
    id: "brainstorming",
    inputLabel: "Theory Map & Summary",
    workingLabel: "Topic Exploration",
    outputLabel: "Selected Topic & Thesis",
    inputDescription: "Mapped curriculum concepts and the assessment summary.",
    outputDescription: "3 topic options with pros/cons, selected topic, preliminary thesis statement.",
    previousWorkflow: "curriculum",
    leads: ["steven", "jackie"],
  },
  research: {
    id: "research",
    inputLabel: "Topic & Theory Map",
    workingLabel: "Source Evaluation",
    outputLabel: "Source Database",
    inputDescription: "Topic, thesis, and theory map from previous steps.",
    outputDescription: "Citations, key findings, paraphrases, and source quality assessment.",
    previousWorkflow: "brainstorming",
    leads: ["jackie"],
  },
  outline: {
    id: "outline",
    inputLabel: "All Prior Outputs",
    workingLabel: "Structure Building",
    outputLabel: "Detailed Outline",
    inputDescription: "Summary, topic, theory map, and source database.",
    outputDescription: "Section structure with purposes, word budget, evidence placement plan.",
    previousWorkflow: "research",
    leads: ["hank", "steven"],
  },
  drafting: {
    id: "drafting",
    inputLabel: "Outline & Sources",
    workingLabel: "Writing & Review",
    outputLabel: "Draft",
    inputDescription: "Detailed outline, paraphrases, theory map, and style profile.",
    outputDescription: "Complete draft text ready for revision.",
    previousWorkflow: "outline",
    leads: ["hank", "alex"],
  },
  revision: {
    id: "revision",
    inputLabel: "Draft (and FQA report)",
    workingLabel: "Revision & Iteration",
    outputLabel: "Revised Draft",
    inputDescription: "The current draft, plus FQA recommendations when re-entered from the quality loop.",
    outputDescription: "Improved draft (argumentation, flow, authenticity); each iteration snapshotted to runs/vNNN.",
    previousWorkflow: "drafting",
    leads: ["steven", "peter", "alex"],
  },
  illustration: {
    id: "illustration",
    inputLabel: "Draft & Theory Map",
    workingLabel: "Diagramming",
    outputLabel: "Illustrations",
    inputDescription: "Near-final draft and theory map.",
    outputDescription: "Scientific diagrams and visualisations for the essay.",
    previousWorkflow: "revision",
    leads: ["vanessa"],
  },
  "quality-assessment": {
    id: "quality-assessment",
    inputLabel: "Near-Final Draft",
    workingLabel: "FQA Process",
    outputLabel: "FQA Report",
    inputDescription: "Draft document for quality review.",
    outputDescription: "Scored assessment with prioritised improvement actions (loops back to revision until the gate passes).",
    previousWorkflow: "illustration",
    leads: ["christoph", "jackie", "peter", "steven", "alex"],
  },
  finalisation: {
    id: "finalisation",
    inputLabel: "FQA Report & Draft",
    workingLabel: "Final Corrections",
    outputLabel: "Submission-Ready Document",
    inputDescription: "FQA report and the reviewed draft.",
    outputDescription: "Final document with all FQA fixes applied.",
    previousWorkflow: "quality-assessment",
    leads: ["egbert"],
  },
  "submission-prep": {
    id: "submission-prep",
    inputLabel: "Final Document",
    workingLabel: "Submission Packaging",
    outputLabel: "Submission File",
    inputDescription: "The approved final document.",
    outputDescription: "Cover sheet, authenticity statement, correct filename, and final compliance check.",
    previousWorkflow: "finalisation",
    leads: ["praktikant", "christoph"],
  },
  retrospective: {
    id: "retrospective",
    inputLabel: "Cost & Process Data",
    workingLabel: "Retrospective",
    outputLabel: "Retrospective Report",
    inputDescription: "Cost ledger and process notes from all sessions.",
    outputDescription: "Cost analysis per role and phase, lessons learned, and process improvements.",
    previousWorkflow: "submission-prep",
    leads: ["baerbel", "egbert"],
  },
};
