import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runsDir = path.join(PROJECTS_DIR, id, "runs");
  if (!fs.existsSync(runsDir)) return NextResponse.json([]);

  const stateFile = path.join(PROJECTS_DIR, id, "project-state.json");
  const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf-8")) : {};
  const accepted = state.project?.acceptedVersion ?? state.acceptedVersion ?? null;

  const versions = fs.readdirSync(runsDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && /^v\d+$/.test(e.name))
    .map(e => {
      const vDir = path.join(runsDir, e.name);
      const files = fs.readdirSync(vDir);
      // FQA score
      let fqaScore: Record<string, unknown> | null = null;
      const scoreFile = path.join(vDir, "fqa-score.json");
      if (fs.existsSync(scoreFile)) {
        try { fqaScore = JSON.parse(fs.readFileSync(scoreFile, "utf-8")); } catch { /* ignore */ }
      }
      // Version lock summary (first line)
      let summary = "";
      const lockFile = path.join(vDir, "version-lock.md");
      if (fs.existsSync(lockFile)) {
        summary = fs.readFileSync(lockFile, "utf-8").split("\n").find(l => l.trim()) ?? "";
      }
      return {
        version: e.name,
        accepted: e.name === accepted,
        fqaScore,
        summary,
        files: files.filter(f => f.endsWith(".html") || f.endsWith(".md") || f.endsWith(".json")),
      };
    })
    .sort((a, b) => b.version.localeCompare(a.version));

  return NextResponse.json(versions);
}