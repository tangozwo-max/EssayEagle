"use client";

import { projectPhases, team } from "@/lib/team";
import { t } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function WorkflowsOverview() {
  const strings = t("en");

  const nonWelcomePhases = projectPhases.filter((p) => p.id !== "welcome");

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Phases & Workflows</h2>
      <p className="text-sm text-neutral-400 mb-8">How your essay moves from assignment brief to submission.</p>

      <div className="space-y-8">
        {nonWelcomePhases.map((phase, phaseIdx) => {
          const phaseName = strings.phases[phase.nameKey as keyof typeof strings.phases];

          return (
            <div key={phase.id}>
              {/* Phase header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white dark:bg-white dark:text-neutral-900">
                  {phaseIdx + 1}
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{phaseName}</h3>
              </div>

              {/* Workflows */}
              <div className="ml-3 border-l-2 border-neutral-100 dark:border-neutral-800 pl-6 space-y-3">
                {phase.workflows.map((wf, wfIdx) => {
                  const wfName = strings.workflows[wf.nameKey as keyof typeof strings.workflows];
                  const leads = wf.leads.map((id) => team.find((m) => m.id === id)).filter(Boolean);

                  return (
                    <div key={wf.id} className="rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">{wfName}</h4>
                          <p className="mt-0.5 text-[12px] text-neutral-400 leading-relaxed">{wf.description}</p>
                        </div>
                        <div className="flex -space-x-2 ml-4 flex-shrink-0">
                          {leads.map((m) => (
                            <Image key={m!.id} src={m!.avatar} alt={m!.name} width={28} height={28} className="rounded-full ring-2 ring-white dark:ring-neutral-900" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Arrow between phases */}
              {phaseIdx < nonWelcomePhases.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="h-4 w-4 text-neutral-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
