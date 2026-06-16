import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currDir = path.join(PROJECTS_DIR, id, "00 Input", "curriculum");
  if (!fs.existsSync(currDir)) {
    return NextResponse.json({ available: false, weeks: [] });
  }
  const files = fs.readdirSync(currDir).filter(f => f.endsWith(".md"));
  // Parse: "M4 W1 P06 – Title.md"
  const pattern = /M\d+\s+W(\d+)\s+P(\d+)\s+[–-]\s+(.+)\.md$/i;
  const pages: { week: number; page: number; title: string; slug: string }[] = [];
  for (const f of files) {
    const m = f.match(pattern);
    if (m) {
      pages.push({ week: parseInt(m[1]), page: parseInt(m[2]), title: m[3].trim(), slug: encodeURIComponent(f.replace(/\.md$/, "")) });
    }
  }
  pages.sort((a, b) => a.week - b.week || a.page - b.page);
  // Group by week
  const weekMap: Record<number, typeof pages> = {};
  for (const p of pages) {
    if (!weekMap[p.week]) weekMap[p.week] = [];
    weekMap[p.week].push(p);
  }
  const weeks = Object.entries(weekMap).map(([w, ps]) => ({ week: parseInt(w), pages: ps }));
  return NextResponse.json({ available: true, weeks });
}