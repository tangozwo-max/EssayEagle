"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { CheckCircle, Circle, ChevronRight, Upload, Copy, Check, X } from "lucide-react";

interface FqaScore { overall?: number; score?: number; fqaScore?: number; passThreshold?: number; accepted?: boolean; [k: string]: unknown; }
interface RunVersion {
  version: string;
  accepted: boolean;
  fqaScore: FqaScore | null;
  summary: string;
  files: string[];
}
type DocType = "fqa-report" | "paraphrase-audit" | "bqa" | "change-tasks";

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ projectId, onVersionCreated }: { projectId: string; onVersionCreated: (v: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ versionId: string; savedFiles: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...dropped.filter(f => !names.has(f.name))];
    });
  }, []);

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

  const createVersion = async () => {
    if (!files.length) return;
    setUploading(true);
    // Read all files as base64 and send as JSON — avoids FormData/body-size issues
    const filePayloads = await Promise.all(
      files.map(f => new Promise<{ name: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = (reader.result as string).split(",")[1]; // strip data:...;base64,
          resolve({ name: f.name, data: b64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(f);
      }))
    );
    const res = await fetch(`/api/projects/${projectId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: filePayloads }),
    });
    const data = await res.json();
    setResult(data);
    setUploading(false);
    onVersionCreated(data.versionId);
  };

  const fqaPrompt = result
    ? `Run FQA for project ${projectId}, version ${result.versionId}.

Files in runs/${result.versionId}/: ${result.savedFiles.join(", ")}

Please perform:
1. **FQA Report** — score the draft against the grading rubric (passThreshold: 85). Critical analysis & synthesis is the dominant criterion; curriculum coverage is selective deep application, not a coverage target. Save as \`runs/${result.versionId}/fqa-report.html\`
2. **Paraphrase Audit** (applied verification) — go through EVERY in-text citation **in order of first appearance**. For each, give three labelled parts: (a) **Essay** — what the essay claims; (b) **Source + DOI link**; (c) **Source** — the EXACT one-to-three verbatim sentence(s) from the actual paper that back the claim (extract from the local full-text PDF; fall back to the published abstract only when no full text exists, and flag it). Badge each: ● VERBATIM (full text) / ● ABSTRACT (abstract/image-only) / ● FETCH (no local PDF). Follow the standard in \`framework/templates/essay-fabrik/paraphrase-audit-template.md\`. Save as \`runs/${result.versionId}/paraphrase-audit.html\`
3. **BQA** (bibliography quality audit) — dashboard, evidence-tier distribution, full source table (tier/access/PDF/wiki/cited/DOI), action checklist. Save as \`runs/${result.versionId}/reference-check.html\`
4. **Detailed Change Tasks** — list all required changes with priorities. Save as \`runs/${result.versionId}/change-tasks.html\`
5. **FQA Score** — write \`runs/${result.versionId}/fqa-score.json\` with overall score and criteria breakdown.

Use the rubric from \`00 Input/\`, style profile from previous versions (match the student's own essays), and bibliography from \`04 Research/bibliography/\`.`
    : "";

  const copyPrompt = () => {
    navigator.clipboard.writeText(fqaPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // After version created — show prompt panel
  if (result) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="font-semibold text-neutral-900">Version <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm">{result.versionId}</code> created</span>
          <span className="text-xs text-neutral-400 ml-1">— {result.savedFiles.join(", ")}</span>
        </div>
        <div>
          <p className="text-sm text-neutral-600 mb-2">Copy this prompt into Claude Code to run FQA, Change Tasks &amp; Reference Check:</p>
          <div className="relative">
            <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed overflow-auto max-h-48">{fqaPrompt}</pre>
            <button
              onClick={copyPrompt}
              className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copied ? "bg-emerald-100 text-emerald-700" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>
        <button onClick={() => { setResult(null); setFiles([]); }} className="text-xs text-neutral-400 hover:text-neutral-600">
          Create another version
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900 text-sm">Create New Version</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Drop your draft file(s) here — PDF, DOCX, PPTX, MD</p>
        </div>
      </div>

      {/* Drop area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-400 bg-blue-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
        }`}
      >
        <Upload size={22} className="mx-auto mb-2 text-neutral-300" />
        <p className="text-sm text-neutral-500">Drop files here or <span className="text-blue-600 font-medium">browse</span></p>
        <p className="text-xs text-neutral-400 mt-1">Any file type · multiple files allowed</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => {
          const picked = Array.from(e.target.files ?? []);
          setFiles(prev => {
            const names = new Set(prev.map(f => f.name));
            return [...prev, ...picked.filter(f => !names.has(f.name))];
          });
        }} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
              <span className="text-xs text-neutral-700 flex-1 truncate">{f.name}</span>
              <span className="text-[10px] text-neutral-400">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => removeFile(f.name)} className="text-neutral-300 hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={createVersion}
            disabled={uploading}
            className="w-full mt-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {uploading ? "Creating version…" : `Create new version with ${files.length} file${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FinalisationDept({ projectId }: { projectId: string }) {
  const [runs, setRuns] = useState<RunVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<RunVersion | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocType>("fqa-report");
  const [docContent, setDocContent] = useState<{ content: string; isHtml: boolean } | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const loadRuns = () => {
    fetch(`/api/projects/${projectId}/runs`)
      .then(r => r.json())
      .then(d => {
        setRuns(d);
        setLoading(false);
        if (d.length && !selectedRun) selectRun(d[0], "fqa-report");
      });
  };

  useEffect(() => { loadRuns(); }, [projectId]);

  const selectRun = (run: RunVersion, type: DocType) => {
    setSelectedRun(run);
    setActiveDoc(type);
    loadDoc(run.version, type);
  };

  const loadDoc = (version: string, type: DocType) => {
    setDocLoading(true);
    setDocContent(null);
    fetch(`/api/projects/${projectId}/runs/${version}?type=${type}`)
      .then(r => r.json())
      .then(d => { setDocContent(d.file ? { content: d.content ?? "", isHtml: d.isHtml } : null); setDocLoading(false); });
  };

  const switchDoc = (type: DocType) => {
    setActiveDoc(type);
    if (selectedRun) loadDoc(selectedRun.version, type);
  };

  const getScore = (run: RunVersion) => {
    const s = run.fqaScore;
    if (!s) return null;
    return (s.fqaScore ?? s.overall ?? s.score) as number | null;
  };

  const isAccepted = (run: RunVersion) => run.accepted || run.fqaScore?.accepted === true;

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-neutral-400";
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-500";
  };

  const DOC_TABS: { id: DocType; label: string }[] = [
    { id: "fqa-report", label: "FQA Report" },
    { id: "paraphrase-audit", label: "Paraphrase Audit" },
    { id: "bqa", label: "BQA" },
    { id: "change-tasks", label: "Change Tasks" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Finalisation</h2>
        <p className="text-sm text-neutral-400">FQA runs, quality reports, and reference checks</p>
      </div>

      {/* Drop Zone — always visible at top */}
      <DropZone projectId={projectId} onVersionCreated={() => { setLoading(true); loadRuns(); }} />

      {/* Runs + viewer */}
      {loading && <p className="text-neutral-400 text-sm">Loading runs…</p>}

      {!loading && runs.length === 0 && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center text-neutral-400 text-sm">
          No versions yet. Drop a draft above to create the first one.
        </div>
      )}

      {!loading && runs.length > 0 && (
        <div className="flex gap-4" style={{ height: "calc(100vh - 380px)" }}>
          {/* Runs list */}
          <div className="w-56 flex-shrink-0 bg-white border border-neutral-200 rounded-xl overflow-y-auto">
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-sm font-semibold text-neutral-900">Versions</p>
              <p className="text-xs text-neutral-400">{runs.length} total</p>
            </div>
            <div className="p-2 space-y-1">
              {runs.map(run => {
                const score = getScore(run);
                return (
                  <button
                    key={run.version}
                    onClick={() => selectRun(run, activeDoc)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      selectedRun?.version === run.version ? "bg-blue-50" : "hover:bg-neutral-50"
                    }`}
                  >
                    {isAccepted(run)
                      ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      : <Circle size={14} className="text-neutral-300 flex-shrink-0" />
                    }
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-mono font-medium ${selectedRun?.version === run.version ? "text-blue-700" : "text-neutral-800"}`}>
                          {run.version}
                        </span>
                        {score !== null && (
                          <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
                        )}
                      </div>
                      {isAccepted(run) && <p className="text-[10px] text-emerald-600 font-medium">Accepted</p>}
                    </div>
                    <ChevronRight size={12} className="text-neutral-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document viewer */}
          <div className="flex-1 bg-white border border-neutral-200 rounded-xl flex flex-col overflow-hidden">
            <div className="flex border-b border-neutral-100 px-4">
              {DOC_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchDoc(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeDoc === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {docLoading && (
                <div className="p-5"><p className="text-neutral-400 text-sm">Loading…</p></div>
              )}
              {!docLoading && !docContent && (
                <div className="text-center py-12 text-neutral-300 text-sm">
                  No {activeDoc.replace(/-/g, " ")} found for {selectedRun?.version}.
                </div>
              )}
              {!docLoading && docContent && (
                docContent.isHtml
                  ? <iframe
                      key={`${selectedRun?.version}-${activeDoc}`}
                      src={`/api/projects/${projectId}/runs/${selectedRun?.version}?type=${activeDoc}&format=raw`}
                      className="w-full flex-1 border-0"
                      title={activeDoc}
                    />
                  : <div className="flex-1 overflow-y-auto p-5">
                      <pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">{docContent.content}</pre>
                    </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}