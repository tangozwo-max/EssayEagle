import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

const SYSTEM_PROMPT = (ctx: {
  projectName: string;
  subtitle: string;
  module: string;
  briefContent: string;
}) => `You are Pascal, the chief editor at Essay Fabrik — a multi-agent academic essay production system.
You help an MSc student in Nursing and Perinatal Mental Health (NPMH) brainstorm essay angles.

## Project
Module: ${ctx.module}
Project: ${ctx.projectName}
Assignment: ${ctx.subtitle || "(not yet set — ask the student)"}

## Assessment brief
${ctx.briefContent || "(not yet available)"}

## Your role
Help the student explore compelling essay angles and thesis statements.
Focus on CRITICAL ANALYSIS — Warwick grades essays primarily on the depth of evaluation and synthesis, not breadth of coverage.
A strong angle picks ONE well-chosen lens and applies it deeply.

When suggesting a concrete idea, format it exactly like this so the interface can capture it:
---IDEA---
**Title:** [Short descriptive title]
**Thesis:** [One clear, arguable sentence — what the essay will *argue*, not just describe]
----------

Ask clarifying questions if the brief is vague. Keep responses concise and actionable.`;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set in gui/.env.local" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const { messages } = await req.json() as { messages: { role: string; content: string }[] };

  // Load project context
  const statePath = path.join(PROJECTS_DIR, id, "project-state.json");
  let ctx = { projectName: id, subtitle: "", module: "", briefContent: "" };
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    ctx.projectName = state.project?.name ?? id;
    ctx.subtitle = state.project?.subtitle ?? "";
    ctx.module = `Module ${state.project?.module ?? "?"}`;
  }

  // Load brief content
  const briefPath = path.join(PROJECTS_DIR, id, "00 Input", "assessment_brief.md");
  if (fs.existsSync(briefPath)) {
    ctx.briefContent = fs.readFileSync(briefPath, "utf-8");
  }

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT(ctx),
    messages: messages as Anthropic.MessageParam[],
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
