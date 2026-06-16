"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderSearch, ChevronDown, ChevronRight, Upload } from "lucide-react";
import type { DocumentRef, WorkflowState } from "@/lib/types";
import type { WorkflowConfig } from "@/lib/workflow-config";
import { useProject } from "./ProjectContext";
import { scanDocuments, uploadDocument } from "@/lib/projects";
import DocumentCard from "./DocumentCard";

interface Props {
  config: WorkflowConfig;
  workflowState: WorkflowState;
  workflowId: string;
}

export default function WorkflowInput({ config, workflowState, workflowId }: Props) {
  const { projectState } = useProject();
  const [documents, setDocuments] = useState<DocumentRef[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showDocs, setShowDocs] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleScan = useCallback(async () => {
    if (!projectState) return;
    setScanning(true);
    try {
      const result = await scanDocuments(projectState.project.id, workflowId);
      setDocuments(result.documents ?? []);
    } finally {
      setScanning(false);
    }
  }, [projectState, workflowId]);

  useEffect(() => {
    if (projectState) handleScan();
  }, [projectState?.project.id, workflowId, handleScan]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!projectState) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadDocument(projectState.project.id, workflowId, file);
      }
      await handleScan();
    } finally {
      setUploading(false);
    }
  }, [projectState, workflowId, handleScan]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // Previous workflow output
  const previousOutput = config.previousWorkflow && projectState
    ? projectState.workflows[config.previousWorkflow]?.output?.summary
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
          {config.inputLabel}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          {config.inputDescription}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Previous Workflow Output */}
        {previousOutput && (
          <div>
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 cursor-pointer"
            >
              {showPrevious ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Previous Step Output
            </button>
            {showPrevious && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-[12px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                {previousOutput}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowDocs(!showDocs)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
            >
              {showDocs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Documents ({documents.length})
            </button>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer disabled:opacity-40 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <FolderSearch size={13} />
              {scanning ? "Scanning..." : "Check Folder"}
            </button>
          </div>

          {showDocs && (
            <div className="space-y-1.5">
              {documents.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
            </div>
          )}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-3 border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <Upload size={20} className={`mx-auto mb-2 ${dragOver ? "text-blue-500" : "text-neutral-400"}`} />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {uploading
              ? "Uploading..."
              : dragOver
                ? "Drop files here"
                : "Drag & drop files here to add to this step"}
          </p>
        </div>

        {/* Notes */}
        {workflowState.input.notes && (
          <div>
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Notes
            </div>
            <div className="text-[12px] text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
              {workflowState.input.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
