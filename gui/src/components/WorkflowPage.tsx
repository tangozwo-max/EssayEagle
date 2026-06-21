"use client";

import { useProject } from "./ProjectContext";
import { workflowConfigs } from "@/lib/workflow-config";
import { canonicalId } from "@/lib/workflow-map";
import { emptyWorkflowState } from "@/lib/types";
import WorkflowInput from "./WorkflowInput";
import WorkflowWorkingArea from "./WorkflowWorkingArea";
import WorkflowOutput from "./WorkflowOutput";

interface Props {
  workflowId: string;
  phaseId: string;
}

export default function WorkflowPage({ workflowId, phaseId }: Props) {
  const { projectState } = useProject();
  const wfId = canonicalId(workflowId);
  const config = workflowConfigs[wfId];

  if (!config || !projectState) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Workflow not found.
      </div>
    );
  }

  const workflowState = projectState.workflows?.[wfId] ?? emptyWorkflowState();

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      {/* 3-Column Layout: Input | Working Area | Output */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] h-full">
        {/* INPUT Panel (left) */}
        <div className="border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-hidden">
          <WorkflowInput config={config} workflowState={workflowState} workflowId={wfId} />
        </div>

        {/* WORKING AREA (center) */}
        <div className="border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <WorkflowWorkingArea
            config={config}
            workflowState={workflowState}
            workflowId={wfId}
          />
        </div>

        {/* OUTPUT Panel (right) */}
        <div className="overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/30">
          <WorkflowOutput
            config={config}
            workflowState={workflowState}
            workflowId={wfId}
          />
        </div>
      </div>
    </div>
  );
}
