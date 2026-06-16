import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const currDir = path.join(PROJECTS_DIR, id, "00 Input", "curriculum");
  const filename = decodeURIComponent(slug) + ".md";
  const filePath = path.join(currDir, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return NextResponse.json({ filename, content });
}