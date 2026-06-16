"use client";

import { useState } from "react";
import { Save, CheckCircle, Lock } from "lucide-react";
import type { WorkflowState } from "@/lib/types";
import type { WorkflowConfig } from "@/lib/workflow-config";
import { useProject } from "./ProjectContext";
import { WORKFLOW_IDS } from "@/lib/types";

interface Props {
  config: WorkflowConfig;
  workflowState: WorkflowState;
  workflowId: string;
}

export default function WorkflowOutput({ config, workflowState, workflowId }: Props) {
  const [content, setContent] = useState(workflowState.output.content ?? "");
  const [summary, setSummary] = useState(workflowState.output.summary ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { updateWorkflow } = useProject();

  const isCompleted = workflowState.status === "completed";
  const isLocked = workflowState.status === "locked";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWorkflow(workflowId, {
        status: "in-progress",
        startedAt: workflowState.startedAt ?? new Date().toISOString(),
        output: {
          content,
          summary,
          documents: workflowState.output.documents ?? [],
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    // Save output and mark as completed
    const updates: Partial<WorkflowState> = {
      status: "completed",
      completedAt: new Date().toISOString(),
      output: {
        content,
        summary,
        documents: workflowState.output.documents ?? [],
      },
    };

    await updateWorkflow(workflowId, updates);

    // Unlock next workflow
    const currentIdx = WORKFLOW_IDS.indexOf(workflowId as typeof WORKFLOW_IDS[number]);
    if (currentIdx >= 0 && currentIdx < WORKFLOW_IDS.length - 1) {
      const nextId = WORKFLOW_IDS[currentIdx + 1];
      await updateWorkflow(nextId, { status: "ready" });
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-neutral-400 dark:text-neutral-500">
        <Lock size={24} className="mb-2 opacity-40" />
        <p className="text-[12px]">Complete the previous workflow first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
            {config.outputLabel}
          </h3>
          {isCompleted && (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle size={12} /> Completed
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          {config.outputDescription}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Summary (brief handoff) */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Summary (for next step)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={isCompleted}
            placeholder="Brief summary that the next workflow step will see..."
            rows={3}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 resize-none disabled:opacity-60"
          />
        </div>

        {/* Full Output */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Detailed Output
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isCompleted}
            placeholder="Full deliverable content (markdown supported)..."
            rows={12}
            className="w-full text-[12px] px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 resize-y font-mono disabled:opacity-60"
          />
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2 justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-40"
          >
            <Save size={13} />
            {saved ? "Saved!" : saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleComplete}
            disabled={!content.trim() || !summary.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors disabled:opacity-40"
          >
            <CheckCircle size={13} />
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}
