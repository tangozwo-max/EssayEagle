"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import type { WorkflowState, WorkflowMessage } from "@/lib/types";
import type { WorkflowConfig } from "@/lib/workflow-config";
import { useProject } from "./ProjectContext";
import AgentAvatarGroup from "./AgentAvatarGroup";
import { team } from "@/lib/team";

interface Props {
  config: WorkflowConfig;
  workflowState: WorkflowState;
  workflowId: string;
}

const TYPE_COLORS: Record<string, string> = {
  note: "border-l-neutral-300 dark:border-l-neutral-600",
  suggestion: "border-l-blue-400 dark:border-l-blue-500",
  decision: "border-l-emerald-400 dark:border-l-emerald-500",
  deliverable: "border-l-amber-400 dark:border-l-amber-500",
};

export default function WorkflowWorkingArea({ config, workflowState, workflowId }: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<WorkflowMessage["type"]>("note");
  const { updateWorkflow } = useProject();

  const messages = workflowState.workingArea.messages ?? [];

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const msg: WorkflowMessage = {
      id: Date.now().toString(),
      agentId: "user",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: messageType,
    };

    await updateWorkflow(workflowId, {
      workingArea: {
        messages: [...messages, msg],
      },
    });

    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentName = (id: string) => {
    if (id === "user") return "You";
    return team.find((m) => m.id === id)?.name ?? id;
  };

  const getAgentColor = (id: string) => {
    if (id === "user") return "#6366f1";
    return team.find((m) => m.id === id)?.color ?? "#999";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200 mb-1.5">
          {config.workingLabel}
        </h3>
        <AgentAvatarGroup agentIds={config.leads} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500">
            <MessageSquare size={28} className="mb-2 opacity-40" />
            <p className="text-[12px]">Start collaborating. Add notes, suggestions, or decisions.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`border-l-2 pl-3 py-1.5 ${TYPE_COLORS[msg.type] ?? TYPE_COLORS.note}`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getAgentColor(msg.agentId) }}
              />
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {getAgentName(msg.agentId)}
              </span>
              <span className="text-[10px] text-neutral-400">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-[9px] font-medium uppercase text-neutral-400 ml-auto">
                {msg.type}
              </span>
            </div>
            <p className="text-[12px] text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2 mb-2">
          {(["note", "suggestion", "decision", "deliverable"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMessageType(type)}
              className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                messageType === type
                  ? "border-blue-400 text-blue-600 bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/30"
                  : "border-neutral-300 text-neutral-400 dark:border-neutral-600 dark:text-neutral-500 hover:border-neutral-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Chat with ${config.leads.map(id => team.find(m => m.id === id)?.name).filter(Boolean).join(", ")}...`}
            rows={2}
            className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="self-end p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 cursor-pointer transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
