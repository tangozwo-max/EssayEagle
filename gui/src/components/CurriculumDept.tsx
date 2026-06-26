"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, ChevronDown, FileText, Plus, X, StickyNote, Loader2 } from "lucide-react";

interface CurrPage { week: number; page: number; title: string; slug: string; }
interface CurrWeek { week: number; pages: CurrPage[]; }
interface CurrData { available: boolean; weeks: CurrWeek[]; }
interface Note { id: string; tag: string; text: string; createdAt: string; pageSlug?: string; }

export default function CurriculumDept({ projectId }: { projectId: string }) {
  const [data, setData] = useState<CurrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const [selectedPage, setSelectedPage] = useState<CurrPage | null>(null);
  const [pageContent, setPageContent] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesReadOnly, setNotesReadOnly] = useState(false);
  const [noteTag, setNoteTag] = useState("Week 1");
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const loadNotes = useCallback(() => {
    return fetch(`/api/projects/${projectId}/curriculum/notes`)
      .then(r => r.json())
      .then(d => { setNotes(d.notes ?? []); setNotesReadOnly(d.readOnly ?? false); });
  }, [projectId]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/curriculum`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); if (d.weeks?.length) setOpenWeeks(new Set([d.weeks[0].week])); });
    loadNotes();
  }, [projectId, loadNotes]);

  const toggleWeek = (w: number) => {
    setOpenWeeks(prev => { const s = new Set(prev); if (s.has(w)) s.delete(w); else s.add(w); return s; });
  };

  const loadPage = (page: CurrPage) => {
    setSelectedPage(page);
    setNoteTag(`Week ${page.week}`); // default the note tag to the page you're reading
    setPageLoading(true);
    fetch(`/api/projects/${projectId}/curriculum/${page.slug}`)
      .then(r => r.json())
      .then(d => { setPageContent(d.content ?? ""); setPageLoading(false); });
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/curriculum/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: noteTag, text: noteText.trim(), pageSlug: selectedPage?.slug }),
      });
      if (res.ok) { setNoteText(""); await loadNotes(); }
    } finally { setAddingNote(false); }
  };

  const deleteNote = async (noteId: string) => {
    await fetch(`/api/projects/${projectId}/curriculum/notes?noteId=${encodeURIComponent(noteId)}`, { method: "DELETE" });
    await loadNotes();
  };

  // Group notes by tag; weeks first (numeric), then custom tags.
  const grouped = notes.reduce<Record<string, Note[]>>((acc, n) => { (acc[n.tag] ??= []).push(n); return acc; }, {});
  const weekNum = (t: string) => { const m = t.match(/week\s*(\d+)/i); return m ? parseInt(m[1]) : null; };
  const tagOrder = Object.keys(grouped).sort((a, b) => {
    const wa = weekNum(a), wb = weekNum(b);
    if (wa != null && wb != null) return wa - wb;
    if (wa != null) return -1;
    if (wb != null) return 1;
    return a.localeCompare(b);
  });

  if (loading) return <p className="text-neutral-400 text-sm py-8">Loading curriculum…</p>;

  const weeksForTags = data?.weeks?.map(w => w.week) ?? [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex gap-5 h-[calc(100vh-220px)]">
      {/* Tree */}
      <div className="w-56 flex-shrink-0 bg-white border border-neutral-200 rounded-xl overflow-y-auto">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900 text-sm">Weeks</h3>
          <p className="text-xs text-neutral-400">
            {data?.available ? `${data.weeks.length} weeks · ${data.weeks.reduce((s, w) => s + w.pages.length, 0)} pages` : "no curriculum on disk"}
          </p>
        </div>
        <div className="p-2">
          {!data?.available && <p className="text-xs text-neutral-400 px-3 py-2">Drop curriculum into <code>00 Input/curriculum/</code>.</p>}
          {data?.weeks.map(week => (
            <div key={week.week} className="mb-1">
              <button onClick={() => toggleWeek(week.week)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 text-left transition-colors">
                {openWeeks.has(week.week) ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
                <span className="text-sm font-medium text-neutral-800">Week {week.week}</span>
                <span className="ml-auto text-xs text-neutral-400">{week.pages.length}</span>
              </button>
              {openWeeks.has(week.week) && (
                <div className="ml-4 border-l border-neutral-100 pl-3 space-y-0.5">
                  {week.pages.map(page => (
                    <button key={page.slug} onClick={() => loadPage(page)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${selectedPage?.slug === page.slug ? "bg-blue-50 text-blue-700 font-medium" : "text-neutral-600 hover:bg-neutral-50"}`}>
                      <FileText size={11} className="flex-shrink-0" />
                      <span className="truncate">P{String(page.page).padStart(2, "0")} — {page.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 bg-white border border-neutral-200 rounded-xl overflow-y-auto min-w-0">
        {!selectedPage && <div className="flex items-center justify-center h-full text-neutral-300 text-sm">Select a page to view its content</div>}
        {selectedPage && (
          <div className="p-6">
            <h3 className="font-bold text-neutral-900 mb-1">Week {selectedPage.week} · Page {selectedPage.page}</h3>
            <h4 className="text-lg font-semibold text-neutral-800 mb-4">{selectedPage.title}</h4>
            {pageLoading ? <p className="text-neutral-400 text-sm">Loading…</p> : <pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">{pageContent}</pre>}
          </div>
        )}
      </div>

      {/* Notes panel */}
      <div className="w-72 flex-shrink-0 bg-white border border-neutral-200 rounded-xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
          <StickyNote size={14} className="text-amber-500" />
          <h3 className="font-semibold text-neutral-900 text-sm">My Notes</h3>
          <span className="ml-auto text-xs text-neutral-400">{notes.length}</span>
        </div>

        {/* Add form */}
        {!notesReadOnly ? (
          <div className="p-3 border-b border-neutral-100 space-y-2">
            <div className="flex flex-wrap gap-1">
              {weeksForTags.map(w => (
                <button key={w} onClick={() => setNoteTag(`Week ${w}`)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${noteTag === `Week ${w}` ? "bg-blue-600 text-white border-blue-600" : "bg-white text-neutral-500 border-neutral-200 hover:border-blue-300"}`}>
                  W{w}
                </button>
              ))}
            </div>
            <input
              type="text" value={noteTag} onChange={e => setNoteTag(e.target.value)}
              placeholder="tag (e.g. Week 1, or anything)"
              className="w-full border border-neutral-200 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <textarea
              value={noteText} onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }}
              placeholder="Park a thought for the essay… (⌘/Ctrl+Enter to add)"
              rows={3}
              className="w-full border border-neutral-200 rounded-md px-2 py-1.5 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <button onClick={addNote} disabled={!noteText.trim() || addingNote}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {addingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Add note {noteTag && <span className="opacity-70">→ {noteTag}</span>}
            </button>
          </div>
        ) : (
          <div className="p-3 border-b border-neutral-100 text-[11px] text-neutral-400">
            Read-only here — add notes in the local app (<code>pnpm dev</code>).
          </div>
        )}

        {/* Notes list grouped by tag */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {notes.length === 0 && <p className="text-[12px] text-neutral-300 text-center py-6">No notes yet. Park your essay thoughts per week as you read.</p>}
          {tagOrder.map(tag => (
            <div key={tag}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">{tag}</div>
              <div className="space-y-1.5">
                {grouped[tag].map(n => (
                  <div key={n.id} className="group bg-amber-50/50 border border-amber-100 rounded-md px-2.5 py-1.5 text-[12px] text-neutral-700 flex items-start gap-1.5">
                    <span className="flex-1 whitespace-pre-wrap leading-snug">{n.text}</span>
                    {!notesReadOnly && (
                      <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-opacity flex-shrink-0">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
