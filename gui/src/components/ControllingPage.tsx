"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Circle, Receipt, FolderOpen, Briefcase, Users } from "lucide-react";
import {
  essayFabrik,
  controllingMeta,
  buTotal,
  projektTotal,
  auftragTotal,
  roleTotal,
  allRolesInBU,
  type Auftrag,
  type Projekt,
} from "@/lib/controlling";
import { team, aiModels, type AIModel } from "@/lib/team";
import { theme } from "@/lib/theme";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

// Cache-Read costs: $0.50/1M tokens, converted to EUR (x0.92)
function cacheEur(cacheTokens: number) {
  return (cacheTokens / 1_000_000) * 0.50 * 0.92;
}

function eur(n: number) {
  return `${n.toFixed(2)} \u20ac`;
}

function StatusBadge({ status }: { status: "open" | "closed" | "active" | "completed" }) {
  const colors = {
    open: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
}

function RoleDot({ roleId }: { roleId: string }) {
  const roleColors: Record<string, string> = theme.roles;
  const color = roleColors[roleId] || "#9ca3af";
  return <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />;
}

function roleName(roleId: string) {
  const m = team.find((t) => t.id === roleId);
  return m ? m.name : roleId.charAt(0).toUpperCase() + roleId.slice(1);
}

function ModelBadge({ model }: { model: AIModel }) {
  const colors: Record<AIModel, string> = {
    opus:   "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    sonnet: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    haiku:  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  };
  const info = aiModels[model];
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${colors[model]}`}>
      {info.label}
    </span>
  );
}

function roleModel(roleId: string): AIModel {
  const m = team.find((t) => t.id === roleId);
  return m ? m.model : "opus";
}

function AuftragRow({ auftrag }: { auftrag: Auftrag }) {
  const [open, setOpen] = useState(false);
  const total = auftragTotal(auftrag);
  const hasBuchungen = auftrag.buchungen.length > 0;

  return (
    <div className="border border-neutral-150 rounded-lg bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
      <button
        onClick={() => hasBuchungen && setOpen(!open)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${hasBuchungen ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : "cursor-default"}`}
      >
        {hasBuchungen ? (
          open ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
        ) : (
          <Circle className="h-3 w-3 text-neutral-300 flex-shrink-0" />
        )}
        <Receipt className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
        <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 truncate flex-1">{auftrag.name}</span>

        {/* Role dots */}
        <div className="flex -space-x-0.5 flex-shrink-0">
          {[...new Set(auftrag.buchungen.map((b) => b.roleId))].map((rid) => (
            <RoleDot key={rid} roleId={rid} />
          ))}
        </div>

        <StatusBadge status={auftrag.status} />

        <div className="text-right flex-shrink-0 w-28">
          <div className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">{eur(total.costEur)} <span className="text-[10px] text-neutral-400">+ {eur(cacheEur(total.cacheReadTokens))}</span></div>
          <div className="text-[10px] text-neutral-400">{fmt(total.tokens)} tok &bull; {fmt(total.cacheReadTokens)} cache</div>
        </div>
      </button>

      {open && hasBuchungen && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-neutral-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-4 py-1.5 font-medium">Rolle</th>
                <th className="text-center px-4 py-1.5 font-medium">Modell</th>
                <th className="text-left px-4 py-1.5 font-medium">Beschreibung</th>
                <th className="text-right px-4 py-1.5 font-medium">Tokens</th>
                <th className="text-right px-4 py-1.5 font-medium">Cache</th>
                <th className="text-right px-4 py-1.5 font-medium">Arbeit EUR</th>
                <th className="text-right px-4 py-1.5 font-medium">Cache EUR</th>
                <th className="text-center px-4 py-1.5 font-medium">Session</th>
              </tr>
            </thead>
            <tbody>
              {auftrag.buchungen.map((b, i) => (
                <tr key={i} className="border-t border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <RoleDot roleId={b.roleId} />
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{roleName(b.roleId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center"><ModelBadge model={b.model} /></td>
                  <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">{b.description}</td>
                  <td className="px-4 py-2 text-right text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">{fmt(b.tokens)}</td>
                  <td className="px-4 py-2 text-right text-neutral-400 font-mono text-[11px]">{fmt(b.cacheReadTokens)}</td>
                  <td className="px-4 py-2 text-right text-neutral-700 dark:text-neutral-200 font-mono font-medium">{eur(b.costEur)}</td>
                  <td className="px-4 py-2 text-right text-neutral-400 font-mono text-[11px]">{eur(cacheEur(b.cacheReadTokens))}</td>
                  <td className="px-4 py-2 text-center text-neutral-400">{b.session}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <td colSpan={3} className="px-4 py-2 text-[11px] font-semibold text-neutral-500 uppercase">Summe</td>
                <td className="px-4 py-2 text-right font-mono font-semibold text-neutral-700 dark:text-neutral-200 text-[11px]">{fmt(total.tokens)}</td>
                <td className="px-4 py-2 text-right font-mono text-[11px] text-neutral-400">{fmt(total.cacheReadTokens)}</td>
                <td className="px-4 py-2 text-right font-mono font-bold text-neutral-900 dark:text-white">{eur(total.costEur)}</td>
                <td className="px-4 py-2 text-right font-mono font-semibold text-neutral-400 text-[11px]">{eur(cacheEur(total.cacheReadTokens))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjektSection({ projekt }: { projekt: Projekt }) {
  const [open, setOpen] = useState(true);
  const total = projektTotal(projekt);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 mb-3 cursor-pointer group"
      >
        {open ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
        <FolderOpen className="h-4 w-4 text-blue-500" />
        <span className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {projekt.name}
        </span>
        <StatusBadge status={projekt.status} />
        <span className="ml-auto text-[13px] font-bold text-neutral-700 dark:text-neutral-300">{eur(total.costEur + cacheEur(total.cacheReadTokens))}</span>
        <span className="text-[11px] text-neutral-400">{fmt(total.tokens)} tok &bull; {fmt(total.cacheReadTokens)} cache</span>
      </button>

      {open && (
        <div className="ml-4 space-y-2">
          {projekt.auftraege.map((a) => (
            <AuftragRow key={a.id} auftrag={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleSummary() {
  const [open, setOpen] = useState(false);
  const roles = allRolesInBU(essayFabrik);
  const totals = roles.map((r) => ({ roleId: r, ...roleTotal(essayFabrik, r) })).sort((a, b) => b.costEur - a.costEur);
  const buT = buTotal(essayFabrik);

  return (
    <div className="border border-neutral-150 rounded-lg bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />}
        <Users className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 flex-1">Kostenverteilung nach Rolle</span>
        <span className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">{eur(buT.costEur)}</span>
      </button>

      {open && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 space-y-2">
          {totals.map((r) => {
            const pct = buT.costEur > 0 ? (r.costEur / buT.costEur) * 100 : 0;
            return (
              <div key={r.roleId} className="flex items-center gap-3">
                <RoleDot roleId={r.roleId} />
                <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 w-24">{roleName(r.roleId)}</span>
                <ModelBadge model={roleModel(r.roleId)} />
                <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: theme.roles[r.roleId as keyof typeof theme.roles] || "#9ca3af",
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-neutral-400 w-14 text-right" title="Cache Read">{fmt(r.cacheReadTokens)}</span>
                <span className="text-[12px] font-mono text-neutral-600 dark:text-neutral-400 w-16 text-right">{eur(r.costEur)}</span>
                <span className="text-[10px] text-neutral-400 w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ControllingPage() {
  const buT = buTotal(essayFabrik);
  const openOrders = essayFabrik.projekte.flatMap((p) => p.auftraege).filter((a) => a.status === "open").length;
  const closedOrders = essayFabrik.projekte.flatMap((p) => p.auftraege).filter((a) => a.status === "closed").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Briefcase className="h-5 w-5 text-neutral-400" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Controlling</h2>
      </div>
      <p className="text-sm text-neutral-400 mb-6">Innerbetriebliche Leistungsverrechnung &mdash; {essayFabrik.name}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Gesamtkosten (API)</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{eur(buT.costEur + cacheEur(buT.cacheReadTokens))}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Arbeit {eur(buT.costEur)} + Cache {eur(cacheEur(buT.cacheReadTokens))}</div>
        </div>
        <div className="rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Output Tokens</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{fmt(buT.tokens)}</div>
        </div>
        <div className="rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Cache Tokens</div>
          <div className="text-2xl font-bold text-neutral-500 dark:text-neutral-400">{fmt(buT.cacheReadTokens)}</div>
        </div>
      </div>

      {/* Weekly usage bar + orders */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="col-span-2 rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Wochenlimit ({controllingMeta.weeklyUsage.plan})</div>
            <div className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300">{controllingMeta.weeklyUsage.percentUsed}%</div>
          </div>
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-blue-500"
              style={{ width: `${Math.min(controllingMeta.weeklyUsage.percentUsed, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-neutral-400">
            ~{fmt(controllingMeta.weeklyUsage.estimatedWeeklyLimit)} Tokens/Woche &bull; {Object.keys(controllingMeta.sessions).length} Sessions
          </div>
        </div>
        <div className="rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Auftr&auml;ge</div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openOrders}</span>
              <span className="text-[10px] text-neutral-400 ml-1">offen</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{closedOrders}</span>
              <span className="text-[10px] text-neutral-400 ml-1">done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Summary */}
      <div className="mb-6">
        <RoleSummary />
      </div>

      {/* Projekte mit Auftraegen */}
      <div className="space-y-6">
        {essayFabrik.projekte.map((p) => (
          <ProjektSection key={p.id} projekt={p} />
        ))}
      </div>

      {/* Rate Card */}
      <div className="mt-8 rounded-lg border border-neutral-150 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Stundensatz-Tabelle (API-Preise als Proxy)</h4>
        <div className="grid grid-cols-3 gap-3">
          {(["opus", "sonnet", "haiku"] as AIModel[]).map((m) => {
            const info = aiModels[m];
            const roles = team.filter((t) => t.model === m);
            return (
              <div key={m} className="rounded-md border border-neutral-100 dark:border-neutral-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ModelBadge model={m} />
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <div>Input: <span className="font-mono font-medium">${info.inputPer1M}/1M</span></div>
                  <div>Output: <span className="font-mono font-medium">${info.outputPer1M}/1M</span></div>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {roles.map((r) => (
                      <span key={r.id} className="inline-flex items-center gap-1">
                        <RoleDot roleId={r.id} />
                        <span className="text-[10px]">{r.name}</span>
                      </span>
                    ))}
                    {roles.length === 0 && <span className="text-[10px] italic text-neutral-300">Noch nicht zugewiesen</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-neutral-400 dark:text-neutral-500">
          Bei Abo-Modell (Claude Pro/Max) sind die tatsaechlichen Kosten im Abo enthalten. API-Preise dienen als Vergleichswert. 1 USD = 0.92 EUR.
        </p>
      </div>
    </div>
  );
}
