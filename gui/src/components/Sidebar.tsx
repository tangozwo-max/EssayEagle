"use client";

import { projectPhases, team } from "@/lib/team";
import { t } from "@/lib/i18n";
import { ChevronDown, ChevronRight, Circle, FolderOpen, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { useProject } from "./ProjectContext";
import { canonicalId } from "@/lib/workflow-map";
import { theme } from "@/lib/theme";

export type View =
  | { type: "landing" }
  | { type: "project-selector" }
  | { type: "workflow"; phaseId: string; workflowId: string };

const STATUS_DOT: Record<string, string> = {
  locked: "bg-neutral-300 dark:bg-neutral-600",
  ready: "bg-amber-400",
  "in-progress": "bg-blue-500",
  completed: "bg-emerald-500",
};

export default function Sidebar({
  currentView,
  onNavigate,
  open,
}: {
  currentView: View;
  onNavigate: (view: View) => void;
  open: boolean;
}) {
  const strings = t("en");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(["welcome"]));
  const { projectState } = useProject();

  if (!open) return null;

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getWorkflowStatus = (wfId: string) => {
    if (!projectState) return null;
    return projectState.workflows?.[canonicalId(wfId)]?.status ?? null;
  };

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 w-60 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 overflow-y-auto">
      {/* Project Header */}
      <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
        {projectState ? (
          <button
            onClick={() => onNavigate({ type: "project-selector" })}
            className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer group"
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.brand.primary + "15" }}
            >
              <FolderOpen size={15} style={{ color: theme.brand.primary }} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                {projectState.project.name || projectState.project.id}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                M{projectState.project.module} Part {projectState.project.part}
              </div>
            </div>
            <ArrowLeftRight size={12} className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate({ type: "project-selector" })}
            className="flex items-center gap-2 w-full rounded-lg px-2.5 py-2.5 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-colors text-[12px] cursor-pointer"
          >
            <FolderOpen size={14} />
            Select Project
          </button>
        )}
      </div>

      {/* Phase Navigation */}
      <nav className="py-3 px-2 space-y-0.5">
        {projectPhases.map((phase) => {
          const phaseName = strings.phases[phase.nameKey as keyof typeof strings.phases];
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <div key={phase.id}>
              <button
                onClick={() => togglePhase(phase.id)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
              >
                <span>{phaseName}</span>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isExpanded && (
                <div className="mt-0.5 space-y-px">
                  {phase.workflows.map((wf) => {
                    const wfName = strings.workflows[wf.nameKey as keyof typeof strings.workflows];
                    const isActive = currentView.type === "workflow" && currentView.workflowId === wf.id;
                    const leads = wf.leads.map((id) => team.find((m) => m.id === id)).filter(Boolean);
                    const wfStatus = getWorkflowStatus(wf.id);

                    return (
                      <button
                        key={wf.id}
                        onClick={() => onNavigate({ type: "workflow", phaseId: phase.id, workflowId: wf.id })}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-800 dark:text-white"
                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
                        }`}
                      >
                        {/* Status dot or default circle */}
                        {wfStatus ? (
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${STATUS_DOT[wfStatus] ?? STATUS_DOT.locked}`} />
                        ) : (
                          <Circle className={`h-1.5 w-1.5 flex-shrink-0 ${isActive ? "fill-current" : ""}`} />
                        )}
                        <span className="truncate">{wfName}</span>
                        {leads.length > 0 && (
                          <div className="ml-auto flex -space-x-1">
                            {leads.slice(0, 2).map((m) => (
                              <span
                                key={m!.id}
                                className="inline-block h-3.5 w-3.5 rounded-full border border-white dark:border-neutral-950"
                                style={{ backgroundColor: m!.color }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
