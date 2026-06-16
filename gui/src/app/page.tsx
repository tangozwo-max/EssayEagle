"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Plus, Archive, RotateCcw } from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  currentPhase: string;
  budget: { capEur: number; spentEur: number } | null;
  currentVersion: string | null;
}

const PHASE_LABELS: Record<string, string> = {
  setup: "Setup",
  brainstorming: "Brainstorming",
  "curriculum-mapping": "Curriculum Mapping",
  research: "Research",
  outline: "Outline",
  drafting: "Drafting",
  "quality-assessment": "Quality Assessment",
  finalisation: "Finalisation",
};

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newModule, setNewModule] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleClose = async (id: string, currentStatus: string) => {
    const archived = currentStatus !== "archived";
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { archived } }),
    });
    load();
  };

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), module: newModule.trim() }),
    });
    setNewName(""); setNewModule(""); setShowCreate(false); setCreating(false);
    load();
  };

  const active = projects.filter(p => p.status !== "archived");
  const archived = projects.filter(p => p.status === "archived");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Essay Fabrik</h1>
          <p className="text-sm text-neutral-400">Mission Control</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && <p className="text-neutral-400 text-sm">Loading projects…</p>}

        {!loading && active.length === 0 && !showCreate && (
          <div className="text-center py-16">
            <FolderOpen size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-400">No open projects. Create one to get started.</p>
          </div>
        )}

        {/* Active projects */}
        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Open Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {active.map(p => (
                <ProjectCard key={p.id} project={p} onToggle={toggleClose} />
              ))}
            </div>
          </section>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Closed Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {archived.map(p => (
                <ProjectCard key={p.id} project={p} onToggle={toggleClose} archived />
              ))}
            </div>
          </section>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="font-semibold text-neutral-900 mb-4">New Project</h3>
              <label className="block text-sm text-neutral-600 mb-1">Project Name</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Module 5 Part A"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <label className="block text-sm text-neutral-600 mb-1">Module (optional)</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. module5"
                value={newModule}
                onChange={e => setNewModule(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={createProject}
                  disabled={creating || !newName.trim()}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-neutral-100 text-neutral-700 rounded-lg py-2 text-sm font-medium hover:bg-neutral-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project, onToggle, archived }: {
  project: ProjectSummary;
  onToggle: (id: string, status: string) => void;
  archived?: boolean;
}) {
  const spentPct = project.budget
    ? Math.min(100, (project.budget.spentEur / project.budget.capEur) * 100)
    : null;

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${archived ? "opacity-50" : "border-neutral-200 hover:border-blue-300"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{project.name}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{PHASE_LABELS[project.currentPhase] ?? project.currentPhase}</p>
        </div>
        {project.currentVersion && (
          <span className="text-[11px] bg-neutral-100 text-neutral-500 rounded px-1.5 py-0.5 font-mono flex-shrink-0">
            {project.currentVersion}
          </span>
        )}
      </div>

      {spentPct !== null && (
        <div>
          <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
            <span>Budget</span>
            <span>€{project.budget!.spentEur.toFixed(2)} / €{project.budget!.capEur}</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${spentPct > 80 ? "bg-amber-400" : "bg-blue-500"}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-1">
        {!archived && (
          <Link
            href={`/projects/${project.id}`}
            className="flex-1 text-center bg-blue-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Open
          </Link>
        )}
        <button
          onClick={() => onToggle(project.id, project.status)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
          title={archived ? "Reopen" : "Close"}
        >
          {archived ? <RotateCcw size={13} /> : <Archive size={13} />}
          {archived ? "Reopen" : "Close"}
        </button>
      </div>
    </div>
  );
}