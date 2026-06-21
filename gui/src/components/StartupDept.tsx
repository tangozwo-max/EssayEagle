"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle, XCircle, AlertCircle,
  FileText, BookOpen, Scale, Users, GraduationCap, FolderOpen,
  ChevronDown, ChevronUp, Loader2, Save, RefreshCw,
} from "lucide-react";

interface InputInfo { hasSource: boolean; sources: string[]; md: string | null; }
interface StartupData { readOnly: boolean; assignmentType: string | null; inputs: Record<string, InputInfo>; }

type StatusLevel = "ok" | "warn" | "missing";

const TYPES: { key: string; title: string; folder: string; icon: React.ReactNode }[] = [
  { key: "brief", title: "Assignment Brief", folder: "assignment_brief", icon: <FileText size={14} /> },
  { key: "rubric", title: "Grading Rubric", folder: "grading_rubric", icon: <Scale size={14} /> },
  { key: "referencing", title: "Referencing Guide", folder: "referencing_guide", icon: <BookOpen size={14} /> },
  { key: "previous", title: "Previous Assignments", folder: "previous_assignments", icon: <Users size={14} /> },
  { key: "curriculum", title: "Curriculum", folder: "curriculum", icon: <GraduationCap size={14} /> },
];

function StatusIcon({ level }: { level: StatusLevel }) {
  if (level === "ok") return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />;
  if (level === "warn") return <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />;
  return <XCircle size={14} className="text-red-400 flex-shrink-0" />;
}

function InputCard({
  title, folder, icon, info, readOnly, converting, onConvert,
}: {
  title: string; folder: string; icon: React.ReactNode; info: InputInfo;
  readOnly: boolean; converting: boolean; onConvert: () => void;
}) {
  const [open, setOpen] = useState(false);
  const level: StatusLevel = info.md ? "ok" : info.hasSource ? "warn" : "missing";

  const border = level === "ok" ? "border-emerald-200" : level === "warn" ? "border-amber-200" : "border-neutral-200";
  const bg = level === "ok" ? "bg-emerald-50/40" : level === "warn" ? "bg-amber-50/30" : "bg-neutral-50/40";
  const iconColor = level === "ok" ? "text-emerald-600" : level === "warn" ? "text-amber-600" : "text-neutral-400";

  const canConvert = info.hasSource && !readOnly;
  const convertLabel = converting ? "Converting…" : info.md ? "Re-convert" : "Convert";

  return (
    <div className={`border rounded-xl overflow-hidden ${border} ${bg}`}>
      <div className="w-full flex items-center justify-between px-4 py-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={iconColor}>{icon}</span>
          <span className="font-medium text-sm text-neutral-800 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onConvert}
            disabled={!canConvert || converting}
            title={readOnly ? "Conversion runs locally (pnpm dev)" : !info.hasSource ? `Drop files into 00 Input/${folder}/ first` : "Convert source to markdown"}
            className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {converting ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {readOnly ? "Local only" : convertLabel}
          </button>
          <StatusIcon level={level} />
          {info.md && (
            <button onClick={() => setOpen(o => !o)} className="cursor-pointer text-neutral-400">
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 -mt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
          <FolderOpen size={11} className={info.hasSource ? "text-emerald-500" : "text-neutral-300"} />
          {info.hasSource ? (
            <span><span className="font-medium">{info.sources.length}</span> file{info.sources.length !== 1 ? "s" : ""} in <code className="text-neutral-400">00 Input/{folder}/</code>{info.sources.length <= 4 ? ` — ${info.sources.join(", ")}` : ""}</span>
          ) : (
            <span className="text-neutral-400">empty — drop files into <code>00 Input/{folder}/</code></span>
          )}
        </div>
        {!info.md && (
          <div className="text-[11px] text-neutral-400 mt-1">No markdown yet{info.hasSource ? " — click Convert" : ""}.</div>
        )}
      </div>

      {open && info.md && (
        <div className="px-4 pb-4 border-t border-white/60 pt-3">
          <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto bg-white/60 rounded-lg p-3 border border-neutral-100">
            {info.md}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function StartupDept({
  projectId, subtitle, onSubtitleSaved,
}: {
  projectId: string; subtitle?: string; onSubtitleSaved: (s: string) => void;
}) {
  const [data, setData] = useState<StartupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtitleDraft, setSubtitleDraft] = useState(subtitle ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [convertingKey, setConvertingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadStartup = useCallback(() => {
    return fetch(`/api/projects/${projectId}/startup`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [projectId]);

  useEffect(() => { loadStartup(); }, [loadStartup]);
  useEffect(() => { setSubtitleDraft(subtitle ?? ""); }, [subtitle]);

  const convert = async (key: string) => {
    setConvertingKey(key);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("kind", key);
      fd.append("fromFolder", "true");
      const res = await fetch(`/api/projects/${projectId}/setup/ingest`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setNotice({ ok: false, msg: json.error ?? "Conversion failed" });
      else {
        const typeMsg = json.assignmentType ? ` — detected ${json.assignmentType}` : "";
        setNotice({ ok: true, msg: `Converted ${TYPES.find(t => t.key === key)?.title ?? key}${typeMsg}.` });
        await loadStartup();
      }
    } catch (e) { setNotice({ ok: false, msg: String(e) }); }
    finally { setConvertingKey(null); }
  };

  const saveSubtitle = async () => {
    setSaving(true);
    await fetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: { subtitle: subtitleDraft } }) });
    onSubtitleSaved(subtitleDraft);
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={20} className="animate-spin text-neutral-300" /></div>;
  }

  const inputs = data?.inputs ?? {};
  const readyCount = TYPES.filter(t => inputs[t.key]?.md).length;
  const readOnly = data?.readOnly ?? false;
  const assignmentType = data?.assignmentType ?? null;

  return (
    <div className="space-y-7 max-w-2xl">
      {/* Setup header — converted count + detected assignment type */}
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-bold ${readyCount >= 4 ? "text-emerald-600" : readyCount >= 2 ? "text-amber-600" : "text-neutral-400"}`}>
          {readyCount}/5
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">
            Setup — {readyCount === 5 ? "all inputs converted" : readyCount > 0 ? "conversion in progress" : "no inputs converted yet"}
          </p>
          <p className="text-xs text-neutral-400">
            Drop source files into each <code>00 Input/…</code> folder, then Convert to markdown.
            {readOnly ? " (Read-only here — convert locally; this view shows committed markdown.)" : ""}
          </p>
        </div>
        {assignmentType && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 capitalize">{assignmentType}</span>
        )}
      </div>

      {notice && (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${notice.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
          {notice.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
          <span className="break-all">{notice.msg}</span>
        </div>
      )}

      {/* Assignment subtitle */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-500" /> Assignment subtitle
          </h3>
          <p className="text-xs text-neutral-400">Shown in all phase headers. Describe the specific question or task.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text" value={subtitleDraft}
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
            {saving ? <Loader2 size={13} className="animate-spin" /> : justSaved ? <CheckCircle size={13} /> : <Save size={13} />}
            {justSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Input types */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Input resources</h3>
        {TYPES.map(t => (
          <InputCard
            key={t.key}
            title={t.title} folder={t.folder} icon={t.icon}
            info={inputs[t.key] ?? { hasSource: false, sources: [], md: null }}
            readOnly={readOnly}
            converting={convertingKey === t.key}
            onConvert={() => convert(t.key)}
          />
        ))}
      </div>

      <p className="text-[11px] text-neutral-400">
        Move files into the <code>00 Input/…</code> folders on disk (originals stay local), then
        Convert. Conversion runs locally (<code>pnpm dev</code>) and calls Claude; the deployed app
        shows the committed markdown read-only.
      </p>
    </div>
  );
}
