"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Rocket, BookOpen, GraduationCap, Lightbulb, Flag } from "lucide-react";
import StartupDept from "@/components/StartupDept";
import BibliographyDept from "@/components/BibliographyDept";
import CurriculumDept from "@/components/CurriculumDept";
import BrainstormingDept from "@/components/BrainstormingDept";
import FinalisationDept from "@/components/FinalisationDept";

type Dept = "startup" | "bibliography" | "curriculum" | "brainstorming" | "finalisation";

const TABS: { id: Dept; label: string; icon: React.ReactNode }[] = [
  { id: "startup",       label: "Startup",               icon: <Rocket size={15} /> },
  { id: "bibliography",  label: "Bibliography",           icon: <BookOpen size={15} /> },
  { id: "curriculum",    label: "Curriculum",             icon: <GraduationCap size={15} /> },
  { id: "brainstorming", label: "Brainstorming & Outline",icon: <Lightbulb size={15} /> },
  { id: "finalisation",  label: "Finalisation",           icon: <Flag size={15} /> },
];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState(id);
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Dept>("startup");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.project?.name) setProjectName(data.project.name);
        if (data.project?.subtitle !== undefined) setSubtitle(data.project.subtitle);
      });
  }, [id]);

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

      <div className="bg-white border-b border-neutral-200 px-6">
        <nav className="flex gap-0.5 -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === "startup" && (
          <StartupDept
            projectId={id}
            subtitle={subtitle}
            onSubtitleSaved={s => setSubtitle(s)}
          />
        )}
        {activeTab === "bibliography"  && <BibliographyDept  projectId={id} />}
        {activeTab === "curriculum"    && <CurriculumDept    projectId={id} />}
        {activeTab === "brainstorming" && <BrainstormingDept projectId={id} />}
        {activeTab === "finalisation"  && <FinalisationDept  projectId={id} />}
      </main>
    </div>
  );
}
