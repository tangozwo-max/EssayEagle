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
  brainstorming: {
    id: "brainstorming",
    inputLabel: "Assessment Summary",
    workingLabel: "Topic Exploration",
    outputLabel: "Selected Topic & Thesis",
    inputDescription: "Requirements from the Setup phase.",
    outputDescription: "3 topic options with pros/cons, selected topic, preliminary thesis statement.",
    previousWorkflow: "setup",
    leads: ["steven", "jackie"],
  },
  curriculum: {
    id: "curriculum",
    inputLabel: "Topic & Requirements",
    workingLabel: "Concept Mapping",
    outputLabel: "Theory Map",
    inputDescription: "Selected topic and assessment summary.",
    outputDescription: "Curriculum concepts list with placement suggestions and module alignment.",
    previousWorkflow: "brainstorming",
    leads: ["peter"],
  },
  research: {
    id: "research",
    inputLabel: "Topic & Theory Map",
    workingLabel: "Source Evaluation",
    outputLabel: "Source Database",
    inputDescription: "Topic, thesis, and theory map from previous steps.",
    outputDescription: "Citations, key findings, paraphrases, and source quality assessment.",
    previousWorkflow: "curriculum",
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
    outputDescription: "Complete draft text ready for quality assessment.",
    previousWorkflow: "outline",
    leads: ["hank", "alex"],
  },
  illustration: {
    id: "illustration",
    inputLabel: "Draft & Theory Map",
    workingLabel: "Diagramming",
    outputLabel: "Illustrations",
    inputDescription: "Draft text and theory map.",
    outputDescription: "Scientific diagrams and visualisations for the essay.",
    previousWorkflow: "drafting",
    leads: ["vanessa"],
  },
  "quality-assessment": {
    id: "quality-assessment",
    inputLabel: "Near-Final Draft",
    workingLabel: "FQA Process",
    outputLabel: "FQA Report",
    inputDescription: "Draft document for quality review.",
    outputDescription: "Scored assessment with prioritised improvement actions.",
    previousWorkflow: "drafting",
    leads: ["christoph", "jackie", "peter", "steven", "alex"],
  },
  finalisation: {
    id: "finalisation",
    inputLabel: "FQA Report & Draft",
    workingLabel: "Final Review",
    outputLabel: "Submission-Ready Document",
    inputDescription: "FQA report and the reviewed draft.",
    outputDescription: "Final document with all fixes applied, ready for submission.",
    previousWorkflow: "quality-assessment",
    leads: ["egbert"],
  },
};
