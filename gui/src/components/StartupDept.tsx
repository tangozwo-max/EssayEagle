"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, AlertCircle,
  FileText, BookOpen, Scale, Users,
  ChevronDown, ChevronUp, Loader2, Save,
} from "lucide-react";

interface ResourceInfo {
  available: boolean;
  content: string | null;
  sourcePath: string | null;
  sourceExists: boolean;
}

interface StartupData {
  brief: ResourceInfo;
  rubric: ResourceInfo;
  referencing: ResourceInfo;
  previousAssignments: { count: number; indexContent: string | null };
  curriculum: { hasReadme: boolean; content: string | null };
}

type StatusLevel = "ok" | "warn" | "missing";

function StatusIcon({ level }: { level: StatusLevel }) {
  if (level === "ok") return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />;
  if (level === "warn") return <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />;
  return <XCircle size={14} className="text-red-400 flex-shrink-0" />;
}

function ResourceCard({
  icon, title, level, sourcePath, content, defaultExpanded,
}: {
  icon: React.ReactNode; title: string; level: StatusLevel;
  sourcePath?: string | null; content?: string | null; defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded ?? false);
  const hasDetails = !!(content || sourcePath);

  const borderColor =
    level === "ok" ? "border-emerald-200" :
    level === "warn" ? "border-amber-200" : "border-red-200";
  const bgColor =
    level === "ok" ? "bg-emerald-50/40" :
    level === "warn" ? "bg-amber-50/30" : "bg-red-50/20";
  const iconColor =
    level === "ok" ? "text-emerald-600" :
    level === "warn" ? "text-amber-600" : "text-red-500";

  return (
    <div className={`border rounded-xl overflow-hidden ${borderColor} ${bgColor}`}>
      <button
        onClick={() => hasDetails && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center gap-2.5">
          <span className={iconColor}>{icon}</span>
          <span className="font-medium text-sm text-neutral-800">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusIcon level={level} />
          {hasDetails && (open
            ? <ChevronUp size={13} className="text-neutral-400" />
            : <ChevronDown size={13} className="text-neutral-400" />
          )}
        </div>
      </button>

      {open && hasDetails && (
        <div className="px-4 pb-4 border-t border-white/60 pt-3 space-y-2">
          {sourcePath && (
            <p className="text-[11px] text-neutral-400 font-mono break-all leading-relaxed">
              {sourcePath}
            </p>
          )}
          {content && (
            <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function StartupDept({
  projectId,
  subtitle,
  onSubtitleSaved,
}: {
  projectId: string;
  subtitle?: string;
  onSubtitleSaved: (s: string) => void;
}) {
  const [data, setData] = useState<StartupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtitleDraft, setSubtitleDraft] = useState(subtitle ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/startup`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [projectId]);

  useEffect(() => {
    setSubtitleDraft(subtitle ?? "");
  }, [subtitle]);

  const saveSubtitle = async () => {
    setSaving(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { subtitle: subtitleDraft } }),
    });
    onSubtitleSaved(subtitleDraft);
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  const briefLevel: StatusLevel =
    !data?.brief.available ? "missing" :
    data.brief.sourceExists ? "ok" : "warn";

  const rubricLevel: StatusLevel =
    !data?.rubric.available ? "missing" :
    data.rubric.sourceExists ? "ok" : "warn";

  const refLevel: StatusLevel =
    !data?.referencing.available ? "missing" :
    data.referencing.sourceExists ? "ok" : "warn";

  const prevCount = data?.previousAssignments.count ?? 0;
  const prevLevel: StatusLevel = prevCount > 0 ? "ok" : "warn";

  const curriculumLevel: StatusLevel = data?.curriculum.hasReadme ? "ok" : "missing";

  const readyCount = [briefLevel, rubricLevel, refLevel, prevLevel, curriculumLevel]
    .filter(l => l === "ok").length;

  return (
    <div className="space-y-7 max-w-2xl">
      {/* Readiness badge */}
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-bold ${readyCount >= 4 ? "text-emerald-600" : readyCount >= 2 ? "text-amber-600" : "text-red-500"}`}>
          {readyCount}/5
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            {readyCount === 5 ? "All resources ready" : readyCount >= 3 ? "Most resources ready" : "Resources missing"}
          </p>
          <p className="text-xs text-neutral-400">Startup check — verify inputs before launching the pipeline.</p>
        </div>
      </div>

      {/* Assignment subtitle */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-500" />
            Assignment subtitle
          </h3>
          <p className="text-xs text-neutral-400">
            Shown in all phase headers. Describe the specific question or task (e.g. "Critical essay — addiction as a public health challenge").
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={subtitleDraft}
            onChange={e => setSubtitleDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveSubtitle()}
            placeholder="e.g. Critical essay — addiction and mental health…"
            className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          <button
            onClick={saveSubtitle}
            disabled={saving || subtitleDraft === subtitle}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving
              ? <Loader2 size={13} className="animate-spin" />
              : justSaved
              ? <CheckCircle size={13} />
              : <Save size={13} />}
            {justSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Input resources</h3>

        <ResourceCard
          icon={<FileText size={14} />}
          title="Assessment Brief"
          level={briefLevel}
          sourcePath={data?.brief.sourcePath}
          content={data?.brief.content}
          defaultExpanded
        />

        <ResourceCard
          icon={<Scale size={14} />}
          title="Grading Rubric"
          level={rubricLevel}
          sourcePath={data?.rubric.sourcePath}
          content={data?.rubric.content}
        />

        <ResourceCard
          icon={<BookOpen size={14} />}
          title="Warwick Referencing Guide"
          level={refLevel}
          sourcePath={data?.referencing.sourcePath}
          content={null}
        />

        <ResourceCard
          icon={<Users size={14} />}
          title={`Previous Assignments${prevCount > 0 ? ` (index + ${prevCount} file${prevCount !== 1 ? "s" : ""})` : " — index only"}`}
          level={prevLevel}
          sourcePath={null}
          content={data?.previousAssignments.indexContent}
        />

        <ResourceCard
          icon={<BookOpen size={14} />}
          title="Curriculum Paths"
          level={curriculumLevel}
          sourcePath={null}
          content={data?.curriculum.content}
        />
      </div>
    </div>
  );
}
