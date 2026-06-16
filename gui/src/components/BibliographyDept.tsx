"use client";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface MissingEntry { type: string; title: string; author: string; year: string; doi?: string; url?: string; isbn?: string; }

interface BibStats {
  zoteroCount: number | null;
  risFile: string;
  pdfTotal: number | null;
  pdfAccessible: number | null;
  pdfNoAccess: number | null;
  pdfPartA: number | null;
  pdfPartB: number | null;
  wikiCount: number | null;
  hasStatusHtml: boolean;
  missingPdf: MissingEntry[];
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
// RIGHT_W must match in every row so all tracks are exactly the same width
const RIGHT_W = "w-32";

function HBar({ label, value, max, color, sub }: {
  label: string; value: number; max: number; color: string; sub?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-right flex-shrink-0">
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className="flex-1 h-7 bg-neutral-100 rounded-lg overflow-hidden relative">
        <div className={`h-full rounded-lg transition-all duration-700 ${color}`}
             style={{ width: `${pct}%` }} />
        <span className="absolute inset-0 flex items-center px-3 text-sm font-bold text-neutral-800">
          {value}
        </span>
      </div>
      {/* Always render right spacer — keeps track width identical across all rows */}
      <div className={`${RIGHT_W} flex-shrink-0`}>
        {sub && <span className="text-xs text-neutral-400">{sub}</span>}
      </div>
    </div>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  "Journal":      "bg-blue-100 text-blue-700",
  "Book":         "bg-purple-100 text-purple-700",
  "Book Chapter": "bg-violet-100 text-violet-700",
  "Report":       "bg-amber-100 text-amber-700",
  "Website":      "bg-neutral-100 text-neutral-600",
};
function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? "bg-neutral-100 text-neutral-500";
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{type}</span>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BibliographyDept({ projectId }: { projectId: string }) {
  const [stats, setStats] = useState<BibStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/bibliography`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, [projectId]);

  if (loading) return <p className="text-neutral-400 text-sm py-8">Loading…</p>;
  if (!stats)  return <p className="text-red-500  text-sm py-8">Failed to load.</p>;

  const z   = stats.zoteroCount  ?? 0;
  const w   = stats.wikiCount    ?? 0;
  const p   = stats.pdfTotal     ?? 0;
  const acc = stats.pdfAccessible ?? 0;
  const no  = stats.pdfNoAccess   ?? 0;
  const max = Math.max(z, w, p, 1);

  const promptText = `Run bibliography quality assessment for project ${projectId}. Check all sources in the RIS file against the wiki entries, identify missing PDFs, assess source quality and coverage.`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Bibliography</h2>
        <p className="text-sm text-neutral-400">Source library — {stats.risFile ?? "no RIS"}</p>
      </div>

      {/* ── Bar chart ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-neutral-700 mb-1">Source Coverage</h3>
        <HBar label="Zotero"       value={z} max={max} color="bg-purple-400" />
        <HBar label="Wiki entries" value={w} max={max} color="bg-amber-400"  sub={w < z ? `${z - w} not in wiki` : "complete"} />
        <HBar label="PDFs total"   value={p} max={max} color="bg-blue-400"   sub={p < z ? `${z - p} no PDF` : "complete"} />

        {/* Stacked accessible / no-access — identical layout to HBar rows */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-right flex-shrink-0">
            <span className="text-xs text-neutral-500">PDF access</span>
          </div>
          <div className="flex-1">
            <div className="h-7 w-full bg-neutral-100 rounded-lg overflow-hidden flex">
              <div className="bg-emerald-400 h-full transition-all duration-700"
                   style={{ width: `${Math.round(acc / max * 100)}%` }} />
              <div className="bg-red-300 h-full transition-all duration-700"
                   style={{ width: `${Math.round(no / max * 100)}%` }} />
            </div>
            <div className="flex mt-1 text-[10px] text-neutral-500">
              <div style={{ width: `${Math.round(acc / max * 100)}%` }} className="flex items-center gap-1 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{acc} accessible</span>
              </div>
              <div style={{ width: `${Math.round(no / max * 100)}%` }} className="flex items-center gap-1 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-red-300 flex-shrink-0" />
                <span className="whitespace-nowrap">{no} no access</span>
              </div>
            </div>
          </div>
          <div className={`${RIGHT_W} flex-shrink-0`} />
        </div>
      </div>

      {/* ── Missing PDFs ──────────────────────────────────────────────── */}
      {stats.missingPdf && stats.missingPdf.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowMissing(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-800">
                {stats.missingPdf.length} entries without a local PDF
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">
                {[...new Set(stats.missingPdf.map(e => e.type))].join(" · ")}
              </span>
            </div>
            <span className="text-xs text-neutral-400">{showMissing ? "hide ▲" : "show ▼"}</span>
          </button>
          {showMissing && (
            <div className="divide-y divide-neutral-50 max-h-72 overflow-y-auto">
              {stats.missingPdf.map((e, i) => {
                const doiUrl = e.doi ? `https://doi.org/${e.doi}` : null;
                const link = doiUrl ?? e.url ?? null;
                const isbnUrl = e.isbn ? `https://www.worldcat.org/search?q=isbn:${e.isbn.replace(/[^0-9X]/gi,"")}` : null;
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors">
                    <TypeBadge type={e.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-neutral-800 leading-snug" title={e.title}>{e.title}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{e.author} {e.year}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {link && (
                        <a href={link} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          title={link}>
                          {e.doi ? "DOI" : "URL"} <ExternalLink size={10} />
                        </a>
                      )}
                      {isbnUrl && !link && (
                        <a href={isbnUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-violet-600 hover:text-violet-800 hover:underline flex items-center gap-1"
                          title={`ISBN: ${e.isbn}`}>
                          ISBN <ExternalLink size={10} />
                        </a>
                      )}
                      {isbnUrl && link && (
                        <a href={isbnUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-violet-500 hover:text-violet-700 hover:underline flex items-center gap-1"
                          title={`ISBN: ${e.isbn}`}>
                          ISBN <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Assessment (always visible) ───────────────────────────────── */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Quality Assessment</h3>
            <p className="text-xs text-neutral-400 mt-0.5">bibliography-quality-assessment.html</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(promptText)}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            <ExternalLink size={12} /> Copy Run Prompt
          </button>
        </div>
        {stats.hasStatusHtml ? (
          <iframe
            src={`/api/projects/${projectId}/bibliography/assessment`}
            className="w-full h-[600px]"
            title="Bibliography assessment"
          />
        ) : (
          <div className="px-5 py-10 text-center text-neutral-400 text-sm">
            No assessment yet. Run the bibliography quality assessment to generate one.
          </div>
        )}
      </div>
    </div>
  );
}