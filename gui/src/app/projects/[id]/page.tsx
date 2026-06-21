"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  menuPhases,
  firstItemId,
  MENU_RENDERERS,
  MENU_ICONS,
  type MenuCtx,
} from "@/lib/menu";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState(id);
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [activeItem, setActiveItem] = useState<string>(firstItemId);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.project?.name) setProjectName(data.project.name);
        if (data.project?.subtitle !== undefined) setSubtitle(data.project.subtitle);
      });
  }, [id]);

  const ctx: MenuCtx = { projectId: id, subtitle, setSubtitle };
  const render = MENU_RENDERERS[activeItem];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-neutral-900 leading-tight">{projectName}</h1>
          {subtitle
            ? <p className="text-xs text-blue-500 truncate max-w-xl">{subtitle}</p>
            : <p className="text-xs text-neutral-400">Mission Control</p>
          }
        </div>
      </header>

      {/* Phase-grouped navigation (from src/config/menu.json) */}
      <div className="bg-white border-b border-neutral-200 px-6">
        <nav className="flex items-stretch gap-5 overflow-x-auto">
          {menuPhases.map((phase, i) => (
            <div key={phase.id} className="flex items-stretch">
              <div className="flex flex-col justify-end pr-4 min-w-max">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300 leading-none mb-1 pt-2">
                  {phase.number} · {phase.name}
                </span>
                <div className="flex gap-0.5 -mb-px">
                  {phase.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveItem(item.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeItem === item.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {MENU_ICONS[item.id]}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              {i < menuPhases.length - 1 && (
                <div className="w-px bg-neutral-200 self-stretch my-2" aria-hidden />
              )}
            </div>
          ))}
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {render
          ? render(ctx)
          : (
            <div className="text-center py-16 text-neutral-400 text-sm">
              No view configured for &ldquo;{activeItem}&rdquo;. Add a renderer in <code>src/lib/menu.tsx</code>.
            </div>
          )}
      </main>
    </div>
  );
}
