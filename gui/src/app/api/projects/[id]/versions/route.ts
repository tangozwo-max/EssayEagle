import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

interface FilePayload {
  name: string;
  data: string; // base64
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectDir = path.join(PROJECTS_DIR, id);
  const runsDir = path.join(projectDir, "runs");

  try {
    // Determine next version number
    fs.mkdirSync(runsDir, { recursive: true });
    const existing = fs.readdirSync(runsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && /^v\d+$/.test(e.name))
      .map(e => parseInt(e.name.slice(1)));
    const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    const versionId = `v${String(nextNum).padStart(3, "0")}`;
    const versionDir = path.join(runsDir, versionId);
    fs.mkdirSync(versionDir, { recursive: true });

    // Accept JSON array of { name, data: base64 }
    const body = await req.json() as { files: FilePayload[] };
    const savedFiles: string[] = [];

    for (const f of body.files ?? []) {
      const buffer = Buffer.from(f.data, "base64");
      fs.writeFileSync(path.join(versionDir, f.name), buffer);
      savedFiles.push(f.name);
    }

    // Write version-lock.md
    const now = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(
      path.join(versionDir, "version-lock.md"),
      `# ${versionId} — Manual snapshot (${now})\n\nFiles: ${savedFiles.join(", ")}\n\nCreated via Mission Control drag-and-drop.\n`
    );

    // Update project-state.json currentVersion
    const stateFile = path.join(projectDir, "project-state.json");
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
      if (state.project) state.project.currentVersion = versionId;
      else state.currentVersion = versionId;
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }

    return NextResponse.json({ versionId, savedFiles });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}