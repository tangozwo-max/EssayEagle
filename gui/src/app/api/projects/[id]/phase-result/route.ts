import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

const PHASE_FILES: Record<string, string[]> = {
  brainstorming: ["02 Brainstorming/result.md", "02 Brainstorming/brainstorming_result.md"],
  outline: ["05 Outline/result.md", "05 Outline/thesis-result.md"],
  setup: ["01 Setup/result.md"],
  curriculum: ["03 Curriculum/result.md"],
  research: ["04 Research/result.md"],
  drafting: ["06 Drafting/result.md"],
  qa: ["07 QA/result.md"],
  final: ["08 Final/result.md"],
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const phase = url.searchParams.get("phase") ?? "brainstorming";
  const candidates = PHASE_FILES[phase] ?? [];
  const base = path.join(PROJECTS_DIR, id);
  for (const rel of candidates) {
    const fp = path.join(base, rel);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, "utf-8");
      return NextResponse.json({ phase, file: rel, content });
    }
  }
  return NextResponse.json({ phase, file: null, content: null });
}