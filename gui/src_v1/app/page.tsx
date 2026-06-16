"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, ChevronRight, Briefcase, FolderOpen } from "lucide-react";
import Sidebar, { type View } from "@/components/Sidebar";
import { ProjectProvider, useProject } from "@/components/ProjectContext";
import WelcomePage from "@/components/WelcomePage";
import WorkflowsOverview from "@/components/WorkflowsOverview";
import ControllingPage from "@/components/ControllingPage";
import ProjectSelector from "@/components/ProjectSelector";
import WorkflowPage from "@/components/WorkflowPage";
import { t } from "@/lib/i18n";
import { projectPhases } from "@/lib/team";
import { essayFabrik, buTotal } from "@/lib/controlling";
import { WORKFLOW_IDS } from "@/lib/types";

// Workflow IDs that get the 3-panel WorkflowPage
const WORKFLOW_PAGE_IDS = new Set<string>(WORKFLOW_IDS);

// IDs that have their own dedicated pages
const DEDICATED_PAGES = new Set(["workflows-overview", "team", "controlling"]);

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>({ type: "landing" });
  const [darkMode, setDarkMode] = useState(false);
  const strings = t("en");
  const { projectState, loadProject } = useProject();

  // Restore active project from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem("ef-active-project");
    if (savedId) {
      loadProject(savedId);
    }
  }, [loadProject]);

  const buCost = buTotal(essayFabrik);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleProjectSelected = () => {
    setSidebarOpen(true);
    setCurrentView({ type: "workflow", phaseId: "welcome", workflowId: "workflows-overview" });
  };

  // Resolve breadcrumb
  let phaseName = "";
  let workflowName = "";
  if (currentView.type === "workflow") {
    const phase = projectPhases.find((p) => p.id === currentView.phaseId);
    if (phase) {
      phaseName = strings.phases[phase.nameKey as keyof typeof strings.phases] || phase.nameKey;
      const wf = phase.workflows.find((w) => w.id === currentView.workflowId);
      if (wf) {
        workflowName = strings.workflows[wf.nameKey as keyof typeof strings.workflows] || wf.nameKey;
      }
    }
  }

  // Check if current workflow should show the 3-panel layout
  const isWorkflowPage =
    currentView.type === "workflow" &&
    WORKFLOW_PAGE_IDS.has(currentView.workflowId) &&
    !DEDICATED_PAGES.has(currentView.workflowId);

  // If trying to open a workflow page without a project, redirect to project selector
  const needsProject = isWorkflowPage && !projectState;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 h-14 border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer flex-shrink-0"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

              <span className="font-semibold text-[14px] text-neutral-800 dark:text-neutral-200">
                {strings.appName}
              </span>

              {/* Project name in breadcrumb */}
              {projectState && currentView.type === "workflow" && (
                <div className="flex items-center gap-1.5 text-[13px] min-w-0 overflow-hidden">
                  <ChevronRight className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[120px]">
                    {projectState.project.name || projectState.project.id}
                  </span>
                </div>
              )}

              {/* Phase > Workflow breadcrumb */}
              {phaseName && (
                <div className="flex items-center gap-1.5 text-[13px] min-w-0 overflow-hidden">
                  <ChevronRight className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                  <span className="text-neutral-500 dark:text-neutral-400 truncate">{phaseName}</span>
                  {workflowName && (
                    <>
                      <ChevronRight className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                      <span className="text-neutral-500 dark:text-neutral-400 truncate">{workflowName}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSidebarOpen(true);
                  setCurrentView({ type: "workflow", phaseId: "welcome", workflowId: "controlling" });
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer transition-colors"
                title="Controlling"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="text-[12px] font-mono font-medium">
                  {(buCost.costEur + (buCost.cacheReadTokens / 1_000_000) * 0.50 * 0.92).toFixed(2)} &euro;
                </span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        <Sidebar currentView={currentView} onNavigate={handleNavigate} open={sidebarOpen} />

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/10 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className={`transition-all duration-200 ${sidebarOpen ? "lg:ml-60" : ""}`}>
          {/* Landing */}
          {currentView.type === "landing" && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
              <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
                {strings.appName}
              </h1>
              <p className="text-base text-neutral-400 dark:text-neutral-500 mb-10">
                {strings.slogan}
              </p>
              <button
                onClick={() => {
                  setSidebarOpen(true);
                  setCurrentView({ type: "project-selector" });
                }}
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                {strings.getStarted}
              </button>
            </div>
          )}

          {/* Project Selector */}
          {currentView.type === "project-selector" && (
            <ProjectSelector onProjectSelected={handleProjectSelected} />
          )}

          {/* Needs project redirect */}
          {needsProject && (
            <div className="p-8">
              <div className="max-w-lg mx-auto rounded-xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950/30">
                <FolderOpen size={32} className="mx-auto mb-3 text-amber-500" />
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  No project selected
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
                  Select or create a project to start working on this workflow.
                </p>
                <button
                  onClick={() => setCurrentView({ type: "project-selector" })}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  Select Project
                </button>
              </div>
            </div>
          )}

          {/* Workflow Pages (3-panel) */}
          {isWorkflowPage && projectState && (
            <WorkflowPage
              workflowId={currentView.workflowId}
              phaseId={currentView.phaseId}
            />
          )}

          {/* Workflows Overview */}
          {currentView.type === "workflow" && currentView.workflowId === "workflows-overview" && (
            <div className="p-8">
              <WorkflowsOverview />
            </div>
          )}

          {/* Team */}
          {currentView.type === "workflow" && currentView.workflowId === "team" && (
            <div className="p-8">
              <WelcomePage />
            </div>
          )}

          {/* Controlling */}
          {currentView.type === "workflow" && currentView.workflowId === "controlling" && (
            <div className="p-8">
              <ControllingPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
