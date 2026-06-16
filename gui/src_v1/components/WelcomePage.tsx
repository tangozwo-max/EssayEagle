"use client";

import { useState } from "react";
import { team, TeamMember } from "@/lib/team";
import { t } from "@/lib/i18n";
import { X } from "lucide-react";
import Image from "next/image";

function Avatar({ member, size = 56 }: { member: TeamMember; size?: number }) {
  return (
    <Image
      src={member.avatar}
      alt={member.name}
      width={size}
      height={size}
      className="rounded-full ring-2 ring-white dark:ring-neutral-900"
    />
  );
}

function MemberDetail({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const strings = t("en");
  const roleStrings = strings.roles[member.id as keyof typeof strings.roles];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <Avatar member={member} size={64} />
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{member.name}</h3>
            <p className="text-sm font-medium" style={{ color: member.color }}>{roleStrings.title}</p>
          </div>
        </div>
        <p className="mt-4 text-[14px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {roleStrings.intro}
        </p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const strings = t("en");

  const egbert = team.find((m) => m.id === "egbert")!;
  // Direct reports to Egbert
  const reportsToEgbert = ["christoph", "pascal", "alex", "baerbel"];
  const egbertDirect = reportsToEgbert.map((id) => team.find((m) => m.id === id)!).filter(Boolean);
  // Reports to Pascal
  const reportsToPascal = ["peter", "jackie", "steven", "hank", "vanessa", "praktikant"];
  const pascalTeam = reportsToPascal.map((id) => team.find((m) => m.id === id)!).filter(Boolean);

  const MemberNode = ({ member }: { member: TeamMember }) => {
    const role = strings.roles[member.id as keyof typeof strings.roles];
    return (
      <button onClick={() => setSelected(member)} className="flex flex-col items-center gap-1.5 cursor-pointer group">
        <Avatar member={member} />
        <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline">{member.name}</span>
        <span className="text-[11px] text-neutral-400 text-center max-w-[100px] leading-tight">{role.title}</span>
      </button>
    );
  };

  const VerticalLine = () => (
    <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600 mx-auto" />
  );

  const HorizontalConnector = ({ count }: { count: number }) => (
    <div className="relative h-4 mx-auto" style={{ width: `${Math.min(count * 120, 600)}px` }}>
      {/* Horizontal line */}
      <div className="absolute top-0 left-[60px] right-[60px] h-px bg-neutral-300 dark:bg-neutral-600" />
      {/* Vertical drops */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-px h-4 bg-neutral-300 dark:bg-neutral-600"
          style={{ left: `${(i / (count - 1)) * 100}%`, transform: "translateX(-50%)" }}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">The Collective</h2>
      <p className="text-sm text-neutral-400 mb-10">Click on a member to learn about their role.</p>

      <div className="flex flex-col items-center">
        {/* Level 1: Egbert */}
        <MemberNode member={egbert} />

        <VerticalLine />

        {/* Level 2: Direct reports to Egbert */}
        <div className="relative">
          <HorizontalConnector count={egbertDirect.length} />
          <div className="flex items-start justify-center gap-8">
            {egbertDirect.map((m) => (
              <div key={m.id} className="flex flex-col items-center">
                <MemberNode member={m} />
                {/* Pascal gets a sub-tree */}
                {m.id === "pascal" && (
                  <>
                    <div className="mt-3">
                      <VerticalLine />
                    </div>
                    <div className="relative">
                      <HorizontalConnector count={pascalTeam.length} />
                      <div className="flex items-start justify-center gap-5">
                        {pascalTeam.map((sub) => (
                          <MemberNode key={sub.id} member={sub} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && <MemberDetail member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
