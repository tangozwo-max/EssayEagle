"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle, XCircle, AlertCircle,
  FileText, BookOpen, Scale, Users,
  ChevronDown, ChevronUp, Loader2, Save, Upload,
} from "lucide-react";

interface ResourceInfo {
  available: boolean;
  content: string | null;
  sourcePath: string | null;
  sourceExists: boolean;
}

interface StartupData {
  assignmentType: string | null;
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

interface UploadProp {
  kind: string;
  uploading: boolean;
  accept: string;
  onPick: (file: File) => void;
}

function UploadButton({
  label, accept, multiple, directory, busy, onFiles,
}: {
  label: string; accept?: string; multiple?: boolean; directory?: boolean;
  busy: boolean; onFiles: (files: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
        {busy ? "Working…" : label}
      </button>
    </>
  );
}

function ResourceCard({
  icon, title, level, sourcePath, content, defaultExpanded, upload, actions,
}: {
  icon: React.ReactNode; title: string; level: StatusLevel;
  sourcePath?: string | null; content?: string | null; defaultExpanded?: boolean;
  upload?: UploadProp; actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultExpanded ?? false);
  const fileRef = useRef<HTMLInputElement>(null);
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
      <div className="w-full flex items-center justify-between px-4 py-3">
        <button
          onClick={() => hasDetails && setOpen(o => !o)}
          className={`flex items-center gap-2.5 text-left ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className={iconColor}>{icon}</span>
          <span className="font-medium text-sm text-neutral-800">{title}</span>
        </button>
        <div className="flex items-center gap-2">
          {upload && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept={upload.accept}
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) upload.onPick(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={upload.uploading}
                className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                {upload.uploading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Upload size={11} />}
                {upload.uploading ? "Converting…" : (level === "missing" ? "Pick file" : "Replace")}
              </button>
            </>
          )}
          {actions}
          <StatusIcon level={level} />
          {hasDetails && (
            <button onClick={() => setOpen(o => !o)} className="cursor-pointer">
              {open
                ? <ChevronUp size={13} className="text-neutral-400" />
                : <ChevronDown size={13} className="text-neutral-400" />}
            </button>
          )}
        </div>
      </div>

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
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadStartup = useCallback(() => {
    return fetch(`/api/projects/${projectId}/startup`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [projectId]);

  useEffect(() => { loadStartup(); }, [loadStartup]);

  useEffect(() => {
    setSubtitleDraft(subtitle ?? "");
  }, [subtitle]);

  const handleUpload = async (kind: string, file: File) => {
    setUploadingKind(kind);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch(`/api/projects/${projectId}/setup/ingest`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ ok: false, msg: json.error ?? "Upload failed" });
      } else {
        const typeMsg = json.assignmentType ? ` — detected ${json.assignmentType}` : "";
        setNotice({ ok: true, msg: `${file.name} ingested${typeMsg}.` });
        await loadStartup();
      }
    } catch (e) {
      setNotice({ ok: false, msg: String(e) });
    } finally {
      setUploadingKind(null);
    }
  };

  const handlePrevious = async (files: File[]) => {
    setUploadingKind("previous");
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("kind", "previous");
      files.forEach(f => fd.append("file", f));
      const res = await fetch(`/api/projects/${projectId}/setup/ingest`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setNotice({ ok: false, msg: json.error ?? "Upload failed" });
      else {
        const skipped = (json.results ?? []).filter((r: { extracted: boolean }) => !r.extracted).length;
        setNotice({ ok: true, msg: `${json.count} file(s) added${skipped ? ` (${skipped} need .docx support)` : ""}.` });
        await loadStartup();
      }
    } catch (e) {
      setNotice({ ok: false, msg: String(e) });
    } finally {
      setUploadingKind(null);
    }
  };

  const handleCurriculum = async (subdir: "current" | "wiki", files: File[]) => {
    setUploadingKind(`curriculum-${subdir}`);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("kind", "curriculum");
      fd.append("subdir", subdir);
      files.forEach(f => {
        fd.append("file", f);
        fd.append("path", (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name);
      });
      const res = await fetch(`/api/projects/${projectId}/setup/ingest`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setNotice({ ok: false, msg: json.error ?? "Upload failed" });
      else {
        setNotice({ ok: true, msg: `Curriculum (${subdir}): ${json.copied} file(s) copied.` });
        await loadStartup();
      }
    } catch (e) {
      setNotice({ ok: false, msg: String(e) });
    } finally {
      setUploadingKind(null);
    }
  };

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

  const docAccept = ".pdf,.docx,.md,.txt";
  const assignmentType = data?.assignmentType ?? null;

  return (
    <div className="space-y-7 max-w-2xl">
      {/* Setup header — readiness + detected assignment type */}
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-bold ${readyCount >= 4 ? "text-emerald-600" : readyCount >= 2 ? "text-amber-600" : "text-red-500"}`}>
          {readyCount}/5
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">
            Setup — {readyCount === 5 ? "all inputs ready" : readyCount >= 3 ? "most inputs ready" : "inputs missing"}
          </p>
          <p className="text-xs text-neutral-400">Pick each input below; the assignment brief is converted and its type detected.</p>
        </div>
        {assignmentType && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 capitalize">
            {assignmentType}
          </span>
        )}
      </div>

      {/* Upload notice */}
      {notice && (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${
          notice.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {notice.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
          <span className="break-all">{notice.msg}</span>
        </div>
      )}

      {/* Assignment subtitle */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-500" />
            Assignment subtitle
          </h3>
          <p className="text-xs text-neutral-400">
            Shown in all phase headers. Describe the specific question or task (e.g. &quot;Critical essay — addiction as a public health challenge&quot;).
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
          upload={{ kind: "brief", uploading: uploadingKind === "brief", accept: docAccept, onPick: f => handleUpload("brief", f) }}
        />

        <ResourceCard
          icon={<Scale size={14} />}
          title="Grading Rubric"
          level={rubricLevel}
          sourcePath={data?.rubric.sourcePath}
          content={data?.rubric.content}
          upload={{ kind: "rubric", uploading: uploadingKind === "rubric", accept: docAccept, onPick: f => handleUpload("rubric", f) }}
        />

        <ResourceCard
          icon={<BookOpen size={14} />}
          title="Warwick Referencing Guide"
          level={refLevel}
          sourcePath={data?.referencing.sourcePath}
          content={data?.referencing.content}
          upload={{ kind: "referencing", uploading: uploadingKind === "referencing", accept: docAccept, onPick: f => handleUpload("referencing", f) }}
        />

        <ResourceCard
          icon={<Users size={14} />}
          title={`Previous Assignments${prevCount > 0 ? ` (index + ${prevCount} file${prevCount !== 1 ? "s" : ""})` : " — index only"}`}
          level={prevLevel}
          sourcePath={null}
          content={data?.previousAssignments.indexContent}
          actions={
            <UploadButton
              label={prevCount > 0 ? "Add files" : "Pick files"}
              accept=".pdf,.docx,.md,.txt"
              multiple
              busy={uploadingKind === "previous"}
              onFiles={handlePrevious}
            />
          }
        />

        <ResourceCard
          icon={<BookOpen size={14} />}
          title="Curriculum Paths"
          level={curriculumLevel}
          sourcePath={null}
          content={data?.curriculum.content}
          actions={
            <>
              <UploadButton
                label="Current ▸ folder"
                directory
                busy={uploadingKind === "curriculum-current"}
                onFiles={f => handleCurriculum("current", f)}
              />
              <UploadButton
                label="Wiki ▸ folder"
                directory
                busy={uploadingKind === "curriculum-wiki"}
                onFiles={f => handleCurriculum("wiki", f)}
              />
            </>
          }
        />
      </div>

      <p className="text-[11px] text-neutral-400">
        Ingestion writes to your local project folder and calls Claude — run the app locally
        (<code>pnpm dev</code>). PDF and <code>.docx</code> both convert. Curriculum pickers grab a
        whole folder (current + wiki).
      </p>
    </div>
  );
}
