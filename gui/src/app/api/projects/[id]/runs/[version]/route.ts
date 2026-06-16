import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

const TYPE_PATTERNS: Record<string, string[]> = {
  "fqa-report": ["fqa-report.html", "fqa-report.md"],
  // "Paraphrase Audit" = applied reference & paraphrase verification (essay claim <-> source text, per reference)
  "paraphrase-audit": ["paraphrase-audit.html", "paraphrase-audit.md", "paraphrase_audit.html"],
  // "BQA" = bibliography quality audit (file is historically named reference-check.html)
  "bqa": ["reference-check.html", "reference-check.md", "reference_check.html", "reference_check.md", "bqa.html", "bqa.md"],
  "change-tasks": ["change-tasks.html", "change-tasks.md", "detailed_change_tasks.html"],
  "version-lock": ["version-lock.md"],
  // legacy alias: older links used ?type=reference-check for the paraphrase audit
  "reference-check": ["paraphrase-audit.html", "paraphrase-audit.md", "paraphrase_audit.html"],
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string; version: string }> }) {
  const { id, version } = await params;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "fqa-report";
  const format = url.searchParams.get("format");
  const vDir = path.join(PROJECTS_DIR, id, "runs", version);
  if (!fs.existsSync(vDir)) {
    if (format === "raw") return new Response("Not found", { status: 404 });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patterns = TYPE_PATTERNS[type] ?? [];
  for (const pat of patterns) {
    const fp = path.join(vDir, pat);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, "utf-8");
      const isHtml = fp.endsWith(".html");
      if (format === "raw" && isHtml) {
        return new Response(content, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      return NextResponse.json({ type, file: pat, content: isHtml ? null : content, isHtml });
    }
  }
  if (format === "raw") return new Response("Not found", { status: 404 });
  const files = fs.readdirSync(vDir);
  return NextResponse.json({ type, file: null, content: null, isHtml: false, available: files });
}