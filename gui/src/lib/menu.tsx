// Workspace menu: phases + items come from the central config (src/config/menu.json),
// which is editable without touching code. This file is the ONLY code that changes when
// you add a brand-new menu item — it binds each item id to its React component + icon.
// Reassigning existing items between phases is a pure menu.json edit.
import type { ReactNode } from "react";
import {
  Rocket, BookOpen, GraduationCap, Lightbulb, Flag,
  List, FileText, RefreshCw, PieChart, ClipboardCheck, Send, BarChart3,
} from "lucide-react";
import menu from "@/config/menu.json";

import StartupDept from "@/components/StartupDept";
import BibliographyDept from "@/components/BibliographyDept";
import CurriculumDept from "@/components/CurriculumDept";
import BrainstormingDept from "@/components/BrainstormingDept";
import FinalisationDept from "@/components/FinalisationDept";

export interface MenuItem {
  id: string;
  label: string;
}
export interface MenuPhase {
  id: string;
  number: string;
  name: string;
  items: MenuItem[];
}

export const menuPhases: MenuPhase[] = (menu.phases ?? []) as MenuPhase[];

/** Flat list of items in phase/menu order. */
export const menuItems: MenuItem[] = menuPhases.flatMap((p) => p.items);

/** First item id (the default tab). */
export const firstItemId: string = menuItems[0]?.id ?? "";

/** Context passed to each item renderer. */
export interface MenuCtx {
  projectId: string;
  subtitle?: string;
  setSubtitle: (s: string) => void;
}

// id -> renders the component for that menu item. Keys are canonical workflow ids
// (structure/workflow-map.json). Workflows without an entry here render the graceful
// "not built yet" placeholder in page.tsx — that is intentional for the empty tabs.
export const MENU_RENDERERS: Record<string, (ctx: MenuCtx) => ReactNode> = {
  setup: (c) => (
    <StartupDept projectId={c.projectId} subtitle={c.subtitle} onSubtitleSaved={c.setSubtitle} />
  ),
  curriculum: (c) => <CurriculumDept projectId={c.projectId} />,
  brainstorming: (c) => <BrainstormingDept projectId={c.projectId} />,
  research: (c) => <BibliographyDept projectId={c.projectId} />,
  finalisation: (c) => <FinalisationDept projectId={c.projectId} />,
};

/** id -> nav icon (one per workflow; empty tabs still get an icon). */
export const MENU_ICONS: Record<string, ReactNode> = {
  setup: <Rocket size={15} />,
  curriculum: <GraduationCap size={15} />,
  brainstorming: <Lightbulb size={15} />,
  research: <BookOpen size={15} />,
  outline: <List size={15} />,
  drafting: <FileText size={15} />,
  revision: <RefreshCw size={15} />,
  illustration: <PieChart size={15} />,
  "quality-assessment": <ClipboardCheck size={15} />,
  finalisation: <Flag size={15} />,
  "submission-prep": <Send size={15} />,
  retrospective: <BarChart3 size={15} />,
};
