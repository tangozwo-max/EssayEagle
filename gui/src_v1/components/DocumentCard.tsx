"use client";

import { FileText, File, FileCode } from "lucide-react";
import type { DocumentRef } from "@/lib/types";

const TYPE_ICONS = {
  pdf: FileText,
  docx: FileText,
  md: FileCode,
  other: File,
};

const CATEGORY_COLORS: Record<string, string> = {
  "assignment-brief": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  rubric: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  curriculum: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  source: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  output: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  other: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function DocumentCard({ doc }: { doc: DocumentRef }) {
  const Icon = TYPE_ICONS[doc.type] ?? TYPE_ICONS.other;
  const catColor = CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.other;

  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
      <Icon size={16} className="text-neutral-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {doc.filename}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catColor}`}>
            {doc.category}
          </span>
          <span className="text-[10px] text-neutral-400 uppercase">{doc.type}</span>
        </div>
        {doc.summary && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">
            {doc.summary}
          </p>
        )}
      </div>
    </div>
  );
}
