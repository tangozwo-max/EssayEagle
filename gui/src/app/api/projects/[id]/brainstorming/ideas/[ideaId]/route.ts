import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

function ideaPath(projectId: string, ideaId: string) {
  return path.join(PROJECTS_DIR, projectId, "02 Brainstorming", "ideas", `idea-${ideaId}.json`);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; ideaId: string }> }
) {
  const { id, ideaId } = await params;
  const p = ideaPath(id, ideaId);
  if (!fs.existsSync(p)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates = await req.json();
  const idea = JSON.parse(fs.readFileSync(p, "utf-8"));
  const merged = { ...idea, ...updates, scores: { ...idea.scores, ...(updates.scores ?? {}) } };
  fs.writeFileSync(p, JSON.stringify(merged, null, 2));
  return NextResponse.json(merged);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; ideaId: string }> }
) {
  const { id, ideaId } = await params;
  const p = ideaPath(id, ideaId);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  return NextResponse.json({ ok: true });
}

// POST /evaluate — runs Jackie, Steven, Peter evaluations
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; ideaId: string }> }
) {
  const { id, ideaId } = await params;
  const body = await req.json() as { action?: string };
  if (body.action !== "evaluate") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const p = ideaPath(id, ideaId);
  if (!fs.existsSync(p)) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const idea = JSON.parse(fs.readFileSync(p, "utf-8"));

  const briefPath = path.join(PROJECTS_DIR, id, "00 Input", "assessment_brief.md");
  const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf-8") : "";

  const client = new Anthropic({ apiKey });

  const evaluate = async (agent: string, criterion: string, prompt: string) => {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{
        role: "user",
        content: `You are ${agent} from Essay Fabrik.

Evaluate this essay idea on the criterion: **${criterion}**.

**Idea title:** ${idea.title}
**Thesis:** ${idea.thesis}

${brief ? `**Assignment context:**\n${brief}\n` : ""}
${prompt}

Reply with ONLY a JSON object like:
{"score": <1-10>, "rationale": "<one concise sentence>"}`,
      }],
    });
    const text = (msg.content[0] as { text: string }).text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { score: null, rationale: "Parse error" };
    return JSON.parse(match[0]) as { score: number; rationale: string };
  };

  const [jackie, steven, peter] = await Promise.all([
    evaluate(
      "Jackie (Evidence Research Agent)",
      "Evidence base (1–10)",
      "Score how well-supported this thesis is by available peer-reviewed academic literature. 10 = rich body of high-quality evidence directly supporting this angle."
    ),
    evaluate(
      "Steven (Narrative & Critical Analysis Agent)",
      "Actuality & Interest (1–10)",
      "Score how contemporary, compelling, and intellectually interesting this angle is. Consider current debates in mental health and nursing practice. 10 = cutting-edge, genuinely interesting to Warwick examiners."
    ),
    evaluate(
      "Peter (Curriculum & Theory Agent)",
      "Curriculum fit (1–10)",
      "Score how well this angle engages with NPMH MSc Module content at depth (not breadth). 10 = maps directly to core theoretical frameworks and curriculum learning outcomes."
    ),
  ]);

  const scores = {
    evidenceBase: jackie.score,
    actuality: steven.score,
    curriculumFit: peter.score,
  };
  const evaluation = {
    evidenceRationale: jackie.rationale,
    actualityRationale: steven.rationale,
    curriculumRationale: peter.rationale,
  };

  const updated = { ...idea, scores, evaluation };
  fs.writeFileSync(p, JSON.stringify(updated, null, 2));

  return NextResponse.json(updated);
}
