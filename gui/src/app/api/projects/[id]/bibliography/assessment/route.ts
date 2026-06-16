import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const researchDir = path.join(PROJECTS_DIR, id, "04 Research");
  const bibDir = path.join(researchDir, "bibliography");
  const candidates = [
    path.join(researchDir, "bibliography-quality-assessment.html"),
    path.join(bibDir, "bibliography-quality-assessment.html"),
    path.join(bibDir, "status.html"),
  ];
  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      const html = fs.readFileSync(fp, "utf-8");
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
  }
  return new Response("<p style=\"font-family:sans-serif;padding:2rem;color:#999\">No assessment found.</p>", {
    headers: { "Content-Type": "text/html" },
  });
}