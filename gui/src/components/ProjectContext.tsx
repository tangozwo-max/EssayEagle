"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ProjectState, WorkflowState } from "@/lib/types";
import { fetchProject, updateProjectState as apiUpdate } from "@/lib/projects";

interface ProjectContextValue {
  projectState: ProjectState | null;
  loading: boolean;
  loadProject: (id: string) => Promise<void>;
  clearProject: () => void;
  updateWorkflow: (workflowId: string, updates: Partial<WorkflowState>) => Promise<void>;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue>({
  projectState: null,
  loading: false,
  loadProject: async () => {},
  clearProject: () => {},
  updateWorkflow: async () => {},
  refreshProject: async () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const state = await fetchProject(id);
      setProjectState(state);
      if (id) localStorage.setItem("ef-active-project", id);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProject = useCallback(() => {
    setProjectState(null);
    localStorage.removeItem("ef-active-project");
  }, []);

  const updateWorkflow = useCallback(
    async (workflowId: string, updates: Partial<WorkflowState>) => {
      if (!projectState) return;
      const merged = await apiUpdate(projectState.project.id, {
        workflows: { [workflowId]: updates } as Record<string, WorkflowState>,
      });
      setProjectState(merged);
    },
    [projectState]
  );

  const refreshProject = useCallback(async () => {
    if (!projectState) return;
    const state = await fetchProject(projectState.project.id);
    setProjectState(state);
  }, [projectState]);

  return (
    <ProjectContext.Provider
      value={{ projectState, loading, loadProject, clearProject, updateWorkflow, refreshProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
