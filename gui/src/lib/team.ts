import { theme } from "./theme";

export type AIModel = "opus" | "sonnet" | "haiku";

export interface AIModelInfo {
  id: AIModel;
  label: string;
  inputPer1M: number;   // USD
  outputPer1M: number;  // USD
}

export const aiModels: Record<AIModel, AIModelInfo> = {
  opus:   { id: "opus",   label: "Opus 4.6",   inputPer1M: 5,  outputPer1M: 25 },
  sonnet: { id: "sonnet", label: "Sonnet 4.6", inputPer1M: 3,  outputPer1M: 15 },
  haiku:  { id: "haiku",  label: "Haiku 4.5",  inputPer1M: 1,  outputPer1M: 5  },
};

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  avatar: string;
  level: "executive" | "specialist" | "trainee";
  reportsTo: string | null;
  model: AIModel;
}

export const team: TeamMember[] = [
  { id: "egbert",     name: "Egbert",     color: theme.roles.egbert,     avatar: "/avatars/avatar.gif",     level: "executive",  reportsTo: null,     model: "opus" },
  { id: "pascal",     name: "Pascal",     color: theme.roles.pascal,     avatar: "/avatars/avatar.gif",     level: "executive",  reportsTo: "egbert", model: "sonnet" },
  { id: "christoph",  name: "Christoph",  color: theme.roles.christoph,  avatar: "/avatars/avatar.gif",  level: "executive",  reportsTo: "egbert", model: "opus" },
  { id: "alex",       name: "Alex",       color: theme.roles.alex,       avatar: "/avatars/avatar.gif",       level: "executive",  reportsTo: "egbert", model: "sonnet" },
  { id: "peter",      name: "Peter",      color: theme.roles.peter,      avatar: "/avatars/avatar.gif",      level: "specialist", reportsTo: "pascal", model: "sonnet" },
  { id: "jackie",     name: "Jackie",     color: theme.roles.jackie,     avatar: "/avatars/avatar.gif",     level: "specialist", reportsTo: "pascal", model: "sonnet" },
  { id: "steven",     name: "Steven",     color: theme.roles.steven,     avatar: "/avatars/avatar.gif",     level: "specialist", reportsTo: "pascal", model: "sonnet" },
  { id: "hank",       name: "Hank",       color: theme.roles.hank,       avatar: "/avatars/avatar.gif",       level: "specialist", reportsTo: "pascal", model: "sonnet" },
  { id: "vanessa",    name: "Vanessa",    color: theme.roles.vanessa,    avatar: "/avatars/avatar.gif",    level: "specialist", reportsTo: "pascal", model: "sonnet" },
  { id: "baerbel",    name: "B\u00e4rbel",    color: theme.roles.baerbel,    avatar: "/avatars/avatar.gif",    level: "executive",  reportsTo: "egbert", model: "haiku" },
  { id: "praktikant", name: "Praktikant", color: theme.roles.praktikant, avatar: "/avatars/avatar.gif", level: "trainee",    reportsTo: "egbert", model: "haiku" },
];

export interface Workflow {
  id: string;
  nameKey: string;
  leads: string[];
  description: string;
}

export interface ProjectPhase {
  id: string;
  nameKey: string;
  workflows: Workflow[];
}

export const projectPhases: ProjectPhase[] = [
  {
    id: "welcome",
    nameKey: "welcome",
    workflows: [
      { id: "workflows-overview", nameKey: "workflowsOverview", leads: ["egbert"], description: "Overview of all phases and workflows in the essay production process." },
      { id: "team", nameKey: "agentTeam", leads: [], description: "Meet the specialists who will work on your essay." },
    ],
  },
  {
    id: "preparation",
    nameKey: "preparation",
    workflows: [
      { id: "setup", nameKey: "setup", leads: ["christoph", "egbert"], description: "Upload assignment brief, rubric, and reference materials." },
      { id: "brainstorming", nameKey: "brainstorming", leads: ["steven", "jackie"], description: "Explore topics, check literature availability, choose your angle." },
      { id: "curriculum", nameKey: "curriculumMapping", leads: ["peter"], description: "Map module concepts to your essay and identify theory placements." },
    ],
  },
  {
    id: "creation",
    nameKey: "creation",
    workflows: [
      { id: "research", nameKey: "research", leads: ["jackie"], description: "Search for studies, critically appraise them, build the source database." },
      { id: "outline", nameKey: "outline", leads: ["hank", "steven"], description: "Build the essay structure with section purposes and evidence plan." },
      { id: "drafting", nameKey: "drafting", leads: ["hank", "alex"], description: "Write and iterate on the draft. Live word count and style checking." },
      { id: "illustration", nameKey: "illustration", leads: ["vanessa"], description: "Create scientific diagrams and visualisations." },
    ],
  },
  {
    id: "finalisation",
    nameKey: "finalisation",
    workflows: [
      { id: "quality-assessment", nameKey: "qualityAssessment", leads: ["christoph", "jackie", "peter", "steven", "alex"], description: "Full quality review with scores from each specialist." },
      { id: "finalisation", nameKey: "finalisation", leads: ["egbert"], description: "Implement changes, final checks, prepare submission." },
    ],
  },
];
