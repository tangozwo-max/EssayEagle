"use client";
import { useEffect, useRef, useState } from "react";
import {
  Send, Plus, Trash2, Sparkles, Loader2, AlertCircle,
  ChevronDown, ChevronUp, X,
} from "lucide-react";

interface Idea {
  id: string;
  title: string;
  thesis: string;
  createdAt: string;
  scores: { evidenceBase: number | null; actuality: number | null; curriculumFit: number | null };
  evaluation?: { evidenceRationale: string; actualityRationale: string; curriculumRationale: string };
  notes: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Parse ---IDEA--- blocks from AI response text
function extractIdeasFromText(text: string) {
  const results: { title: string; thesis: string }[] = [];
  const re = /---IDEA---\s*\*\*Title:\*\*\s*([\s\S]+?)\s*\*\*Thesis:\*\*\s*([\s\S]+?)\s*-{5,}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({ title: m[1].trim(), thesis: m[2].trim() });
  }
  return results;
}

function ScoreBadge({ label, score, rationale }: { label: string; score: number | null; rationale?: string }) {
  const [open, setOpen] = useState(false);
  if (score === null) return null;
  const color = score >= 8 ? "bg-emerald-100 text-emerald-700" : score >= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
  return (
    <div className="relative inline-block">
      <button
        onClick={() => rationale && setOpen(o => !o)}
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${color} ${rationale ? "cursor-pointer" : "cursor-default"}`}
        title={rationale}
      >
        {label}: {score}
      </button>
      {open && rationale && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg p-2.5 text-xs text-neutral-600 z-10">
          {rationale}
          <button onClick={() => setOpen(false)} className="absolute top-1 right-1 text-neutral-400 hover:text-neutral-600">
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea, onEvaluate, onDelete, evaluating,
}: {
  idea: Idea;
  onEvaluate: () => void;
  onDelete: () => void;
  evaluating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasScores = idea.scores.evidenceBase !== null;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-mono text-[10px] text-neutral-400 mr-1.5">[{idea.id}]</span>
            <span className="font-semibold text-sm text-neutral-800">{idea.title}</span>
          </div>
          {expanded ? <ChevronUp size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" />}
        </div>
        {hasScores && (
          <div className="flex gap-1.5 mt-2 flex-wrap" onClick={e => e.stopPropagation()}>
            <ScoreBadge label="J" score={idea.scores.evidenceBase} rationale={idea.evaluation?.evidenceRationale} />
            <ScoreBadge label="S" score={idea.scores.actuality} rationale={idea.evaluation?.actualityRationale} />
            <ScoreBadge label="P" score={idea.scores.curriculumFit} rationale={idea.evaluation?.curriculumRationale} />
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 pt-3 space-y-3">
          <p className="text-sm text-neutral-600 leading-relaxed italic">"{idea.thesis}"</p>
          <div className="flex gap-2">
            <button
              onClick={onEvaluate}
              disabled={evaluating}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {evaluating
                ? <Loader2 size={12} className="animate-spin" />
                : <Sparkles size={12} />}
              {evaluating ? "Evaluating…" : "Evaluate"}
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  msg, onCapture,
}: {
  msg: ChatMessage;
  onCapture: (title: string, thesis: string) => void;
}) {
  const isUser = msg.role === "user";
  const ideas = !isUser ? extractIdeasFromText(msg.content) : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-br-md"
          : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md"
      }`}>
        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
        {ideas.map((idea, i) => (
          <button
            key={i}
            onClick={() => onCapture(idea.title, idea.thesis)}
            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={11} />
            Save: "{idea.title}"
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BrainstormingDept({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [evaluating, setEvaluating] = useState<Set<string>>(new Set());
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [addForm, setAddForm] = useState<{ title: string; thesis: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/brainstorming/ideas`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setIdeas(d));
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages: ChatMessage[] = [...messages, userMsg];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    setApiKeyMissing(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/brainstorming/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503) setApiKeyMissing(true);
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: err.error ?? "Error — check API key configuration." },
        ]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              accumulated += event.delta.text;
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: accumulated },
              ]);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } finally {
      setStreaming(false);
    }
  };

  const captureIdea = (title: string, thesis: string) => {
    setAddForm({ title, thesis });
  };

  const saveIdea = async () => {
    if (!addForm) return;
    const res = await fetch(`/api/projects/${projectId}/brainstorming/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      const idea = await res.json();
      setIdeas(prev => [...prev, idea]);
      setAddForm(null);
    }
  };

  const evaluateIdea = async (ideaId: string) => {
    setEvaluating(prev => new Set(prev).add(ideaId));
    try {
      const res = await fetch(`/api/projects/${projectId}/brainstorming/ideas/${ideaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIdeas(prev => prev.map(i => i.id === ideaId ? updated : i));
      }
    } finally {
      setEvaluating(prev => { const s = new Set(prev); s.delete(ideaId); return s; });
    }
  };

  const deleteIdea = async (ideaId: string) => {
    await fetch(`/api/projects/${projectId}/brainstorming/ideas/${ideaId}`, { method: "DELETE" });
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Brainstorming</h2>
        <p className="text-sm text-neutral-400">Chat with Pascal to explore angles, then save and evaluate your best ideas.</p>
      </div>

      {apiKeyMissing && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <span>
            <strong>API key missing.</strong> Add <code className="font-mono bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> to <code className="font-mono bg-amber-100 px-1 rounded">gui/.env.local</code> and restart the dev server.
          </span>
        </div>
      )}

      <div className="flex gap-5" style={{ height: "calc(100vh - 280px)", minHeight: 500 }}>
        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden min-w-0">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Chat with Pascal</span>
            <span className="text-[10px] text-neutral-400">· Shift+Enter for new line</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-300 gap-2">
                <p className="text-sm">Ask Pascal to help brainstorm essay angles.</p>
                <p className="text-xs">e.g. "What are the strongest angles for a critical essay on addiction as a mental health issue?"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} onCapture={captureIdea} />
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-neutral-100 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Pascal for essay ideas…"
              rows={2}
              className="flex-1 resize-none border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* Ideas panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Ideas ({ideas.length})
            </span>
            <button
              onClick={() => setAddForm({ title: "", thesis: "" })}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus size={13} />
              Add
            </button>
          </div>

          {addForm && (
            <div className="bg-white border border-blue-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-neutral-600">New idea</p>
              <input
                type="text"
                value={addForm.title}
                onChange={e => setAddForm(f => f ? { ...f, title: e.target.value } : f)}
                placeholder="Title…"
                autoFocus
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              <textarea
                value={addForm.thesis}
                onChange={e => setAddForm(f => f ? { ...f, thesis: e.target.value } : f)}
                placeholder="Thesis — what will the essay argue?"
                rows={3}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveIdea}
                  disabled={!addForm.title.trim() || !addForm.thesis.trim()}
                  className="flex-1 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => setAddForm(null)}
                  className="flex-1 py-1.5 border border-neutral-200 text-xs rounded-lg hover:bg-neutral-50 text-neutral-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {ideas.length === 0 && !addForm && (
            <div className="text-center py-8 text-neutral-300 text-xs">
              No ideas yet.<br />Chat with Pascal or click Add.
            </div>
          )}

          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEvaluate={() => evaluateIdea(idea.id)}
              onDelete={() => deleteIdea(idea.id)}
              evaluating={evaluating.has(idea.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
