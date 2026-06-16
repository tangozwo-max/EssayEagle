import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PROJECTS_DIR = path.resolve(process.cwd(), "..", "01 projects");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await params;
  const decoded = decodeURIComponent(filename);

  // Search in both Input and Output folders
  const searchPaths = [
    path.join(PROJECTS_DIR, id, "01 Input", decoded),
    path.join(PROJECTS_DIR, id, "02 Output", decoded),
  ];

  for (const filePath of searchPaths) {
    try {
      const stat = await fs.stat(filePath);
      const ext = path.extname(decoded).toLowerCase();

      // For markdown files, return content
      if (ext === ".md") {
        const content = await fs.readFile(filePath, "utf-8");
        return NextResponse.json({
          filename: decoded,
          type: "md",
          size: stat.size,
          modified: stat.mtime.toISOString(),
          content,
        });
      }

      // For other files, return metadata only
      return NextResponse.json({
        filename: decoded,
        type: ext.replace(".", ""),
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}
