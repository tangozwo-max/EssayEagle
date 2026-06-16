"use client";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";

interface CurrPage { week: number; page: number; title: string; slug: string; }
interface CurrWeek { week: number; pages: CurrPage[]; }
interface CurrData { available: boolean; weeks: CurrWeek[]; }

export default function CurriculumDept({ projectId }: { projectId: string }) {
  const [data, setData] = useState<CurrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const [selectedPage, setSelectedPage] = useState<CurrPage | null>(null);
  const [pageContent, setPageContent] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/curriculum`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); if (d.weeks?.length) setOpenWeeks(new Set([d.weeks[0].week])); });
  }, [projectId]);

  const toggleWeek = (w: number) => {
    setOpenWeeks(prev => { const s = new Set(prev); if (s.has(w)) s.delete(w); else s.add(w); return s; });
  };

  const loadPage = (page: CurrPage) => {
    setSelectedPage(page);
    setPageLoading(true);
    fetch(`/api/projects/${projectId}/curriculum/${page.slug}`)
      .then(r => r.json())
      .then(d => { setPageContent(d.content ?? ""); setPageLoading(false); });
  };

  if (loading) return <p className="text-neutral-400 text-sm py-8">Loading curriculum…</p>;
  if (!data?.available) return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center text-neutral-400">
      No curriculum available for this project.
    </div>
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-220px)]">
      {/* Tree */}
      <div className="w-72 flex-shrink-0 bg-white border border-neutral-200 rounded-xl overflow-y-auto">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900 text-sm">Weeks</h3>
          <p className="text-xs text-neutral-400">{data.weeks.length} weeks · {data.weeks.reduce((s, w) => s + w.pages.length, 0)} pages</p>
        </div>
        <div className="p-2">
          {data.weeks.map(week => (
            <div key={week.week} className="mb-1">
              <button
                onClick={() => toggleWeek(week.week)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 text-left transition-colors"
              >
                {openWeeks.has(week.week) ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
                <span className="text-sm font-medium text-neutral-800">Week {week.week}</span>
                <span className="ml-auto text-xs text-neutral-400">{week.pages.length}</span>
              </button>
              {openWeeks.has(week.week) && (
                <div className="ml-4 border-l border-neutral-100 pl-3 space-y-0.5">
                  {week.pages.map(page => (
                    <button
                      key={page.slug}
                      onClick={() => loadPage(page)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        selectedPage?.slug === page.slug
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <FileText size={11} className="flex-shrink-0" />
                      <span className="truncate">P{String(page.page).padStart(2,"0")} — {page.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 bg-white border border-neutral-200 rounded-xl overflow-y-auto">
        {!selectedPage && (
          <div className="flex items-center justify-center h-full text-neutral-300 text-sm">
            Select a page to view its content
          </div>
        )}
        {selectedPage && (
          <div className="p-6">
            <h3 className="font-bold text-neutral-900 mb-1">Week {selectedPage.week} · Page {selectedPage.page}</h3>
            <h4 className="text-lg font-semibold text-neutral-800 mb-4">{selectedPage.title}</h4>
            {pageLoading
              ? <p className="text-neutral-400 text-sm">Loading…</p>
              : <pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">{pageContent}</pre>
            }
          </div>
        )}
      </div>
    </div>
  );
}