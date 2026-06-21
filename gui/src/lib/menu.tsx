// Workspace menu: phases + items come from the central config (src/config/menu.json),
// which is editable without touching code. This file is the ONLY code that changes when
// you add a brand-new menu item — it binds each item id to its React component + icon.
// Reassigning existing items between phases is a pure menu.json edit.
import type { ReactNode } from "react";
import { Rocket, BookOpen, GraduationCap, Lightbulb, Flag } from "lucide-react";
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

/** id -> renders the component for that menu item. Add an entry to introduce a new menu. */
export const MENU_RENDERERS: Record<string, (ctx: MenuCtx) => ReactNode> = {
  startup: (c) => (
    <StartupDept projectId={c.projectId} subtitle={c.subtitle} onSubtitleSaved={c.setSubtitle} />
  ),
  bibliography: (c) => <BibliographyDept projectId={c.projectId} />,
  curriculum: (c) => <CurriculumDept projectId={c.projectId} />,
  brainstorming: (c) => <BrainstormingDept projectId={c.projectId} />,
  finalisation: (c) => <FinalisationDept projectId={c.projectId} />,
};

/** id -> nav icon. */
export const MENU_ICONS: Record<string, ReactNode> = {
  startup: <Rocket size={15} />,
  bibliography: <BookOpen size={15} />,
  curriculum: <GraduationCap size={15} />,
  brainstorming: <Lightbulb size={15} />,
  finalisation: <Flag size={15} />,
};
