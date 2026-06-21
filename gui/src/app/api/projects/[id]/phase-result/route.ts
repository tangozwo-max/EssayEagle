import { NextResponse } from "next/server";
import { canonicalId } from "@/lib/workflow-map";
import { readProjectFile } from "@/lib/projects-store";

// Keyed by canonical workflow id (see lib/workflow-map.ts). Extra legacy filenames
// kept as fallbacks. Incoming phase params are resolved through canonicalId() so old
// aliases (qa, final, curriculum-mapping) still work.
const PHASE_FILES: Record<string, string[]> = {
  setup: ["01 Setup/result.md"],
  brainstorming: ["02 Brainstorming/result.md", "02 Brainstorming/brainstorming_result.md"],
  curriculum: ["03 Curriculum/result.md"],
  research: ["04 Research/result.md"],
  outline: ["05 Outline/result.md", "05 Outline/thesis-result.md"],
  drafting: ["06 Drafting/result.md"],
  illustration: ["06 Drafting/illustrations/result.md"],
  "quality-assessment": ["07 QA/result.md"],
  finalisation: ["08 Final/result.md"],
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const phase = canonicalId(url.searchParams.get("phase") ?? "brainstorming");
  const candidates = PHASE_FILES[phase] ?? [];
  // Live filesystem first, bundled snapshot online (see projects-store).
  const found = readProjectFile(id, candidates);
  if (found) return NextResponse.json({ phase, file: found.rel, content: found.content });
  return NextResponse.json({ phase, file: null, content: null });
}
