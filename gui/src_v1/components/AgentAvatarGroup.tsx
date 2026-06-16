"use client";

import Image from "next/image";
import { team } from "@/lib/team";
import { t } from "@/lib/i18n";

export default function AgentAvatarGroup({ agentIds }: { agentIds: string[] }) {
  const strings = t("en");
  const agents = agentIds
    .map((id) => team.find((m) => m.id === id))
    .filter(Boolean);

  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {agents.map((agent) => (
          <div
            key={agent!.id}
            className="relative h-7 w-7 rounded-full border-2 border-white dark:border-neutral-800 overflow-hidden"
            style={{ backgroundColor: agent!.color + "20" }}
            title={agent!.name}
          >
            <Image
              src={agent!.avatar}
              alt={agent!.name}
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
        {agents.map((a) => {
          const role = strings.roles[a!.id as keyof typeof strings.roles];
          return role?.title ?? a!.name;
        }).join(", ")}
      </div>
    </div>
  );
}
