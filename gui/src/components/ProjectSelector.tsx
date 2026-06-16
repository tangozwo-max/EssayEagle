"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, ArrowRight, BookOpen } from "lucide-react";
import type { Project } from "@/lib/types";
import { fetchProjects, createProject } from "@/lib/projects";
import { useProject } from "./ProjectContext";
import { theme } from "@/lib/theme";

interface Props {
  onProjectSelected: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  setup: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  archived: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function ProjectSelector({ onProjectSelected }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const { loadProject } = useProject();

  useEffect(() => {
    fetchProjects().then(setProjects);
  }, []);

  const handleSelect = async (id: string) => {
    await loadProject(id);
    onProjectSelected();
  };

  const handleCreate = async () => {
    if (!formName) return;
    const state = await createProject({ name: formName });
    await loadProject(state.project.id);
    onProjectSelected();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: theme.brand.primary }}
        >
          Projects
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Select an existing project or create a new one to get started.
        </p>
      </div>

      {/* Project Grid */}
      <div className="grid gap-4 mb-8">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className="flex items-center gap-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.brand.primary + "15" }}
            >
              <FolderOpen size={22} style={{ color: theme.brand.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                {p.name || p.id}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {p.id}
                <span className="text-neutral-400 dark:text-neutral-500">
                  {" "}&middot; {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? STATUS_COLORS.setup}`}
            >
              {p.status}
            </span>
            <ArrowRight
              size={18}
              className="text-neutral-300 dark:text-neutral-600 group-hover:text-blue-500 transition-colors shrink-0"
            />
          </button>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            No projects yet. Create your first one below.
          </div>
        )}
      </div>

      {/* Create New */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors w-full justify-center"
        >
          <Plus size={18} />
          Create New Project
        </button>
      ) : (
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
            New Project
          </h3>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Project name (e.g., Module 4 Part A - Presentation)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName}
                className="px-5 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-40"
                style={{ backgroundColor: theme.brand.primary }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
