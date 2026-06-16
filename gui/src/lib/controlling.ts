// Controlling Data Model - Innerbetriebliche Leistungsverrechnung
// Structure: BusinessUnit → Projekt → Auftrag → Buchung
// Data source: Team_folder/Baerbel/controlling-db.json (dynamisch)

import type { AIModel } from "./team";
import controllingData from "../data/controlling-db.json";

export interface Buchung {
  roleId: string;
  model: AIModel;
  description: string;
  tokens: number;                // output tokens (was Claude geschrieben hat)
  cacheReadTokens: number;       // cache hits (guenstig, $0.50/1M)
  cacheWriteTokens?: number;     // cache writes (teuer, $6.25-10/1M)
  inputTokensUncached?: number;  // echte neue input tokens ($5/1M)
  costEur: number;
  session: string;
  date: string;
}

export interface Auftrag {
  id: string;
  name: string;
  status: "open" | "closed";
  buchungen: Buchung[];
}

export interface Projekt {
  id: string;
  name: string;
  status: "active" | "completed";
  auftraege: Auftrag[];
}

export interface BusinessUnit {
  id: string;
  name: string;
  projekte: Projekt[];
}

export interface SessionMeta {
  date: string;
  totalTokens: number;
  cacheReadTokens: number;
  outputTokens: number;
  apiCalls: number;
}

export interface ControllingMeta {
  lastUpdated: string;
  sessions: Record<string, SessionMeta>;
  weeklyUsage: {
    percentUsed: number;
    estimatedWeeklyLimit: number;
    plan: string;
  };
}

// Computed helpers
export function auftragTotal(a: Auftrag) {
  return a.buchungen.reduce(
    (sum, b) => ({ tokens: sum.tokens + b.tokens, cacheReadTokens: sum.cacheReadTokens + b.cacheReadTokens, costEur: sum.costEur + b.costEur }),
    { tokens: 0, cacheReadTokens: 0, costEur: 0 }
  );
}

export function projektTotal(p: Projekt) {
  return p.auftraege.reduce((sum, a) => {
    const t = auftragTotal(a);
    return { tokens: sum.tokens + t.tokens, cacheReadTokens: sum.cacheReadTokens + t.cacheReadTokens, costEur: sum.costEur + t.costEur };
  }, { tokens: 0, cacheReadTokens: 0, costEur: 0 });
}

export function buTotal(bu: BusinessUnit) {
  return bu.projekte.reduce((sum, p) => {
    const t = projektTotal(p);
    return { tokens: sum.tokens + t.tokens, cacheReadTokens: sum.cacheReadTokens + t.cacheReadTokens, costEur: sum.costEur + t.costEur };
  }, { tokens: 0, cacheReadTokens: 0, costEur: 0 });
}

export function roleTotal(bu: BusinessUnit, roleId: string) {
  let tokens = 0, cacheReadTokens = 0, costEur = 0;
  for (const p of bu.projekte) {
    for (const a of p.auftraege) {
      for (const b of a.buchungen) {
        if (b.roleId === roleId) { tokens += b.tokens; cacheReadTokens += b.cacheReadTokens; costEur += b.costEur; }
      }
    }
  }
  return { tokens, cacheReadTokens, costEur };
}

export function allRolesInBU(bu: BusinessUnit): string[] {
  const ids = new Set<string>();
  for (const p of bu.projekte)
    for (const a of p.auftraege)
      for (const b of a.buchungen)
        ids.add(b.roleId);
  return Array.from(ids);
}

// Load from JSON
export const essayFabrik: BusinessUnit = controllingData.businessUnit as unknown as BusinessUnit;
export const controllingMeta: ControllingMeta = controllingData.meta as unknown as ControllingMeta;
