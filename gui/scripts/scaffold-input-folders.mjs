// Ensure every project has the canonical 00 Input/<type>/ folders so the user can
// drop source files in by hand. Idempotent: only creates what is missing.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, "..", "..", "01 projects");

// Canonical input-type folders + the README that explains what to drop in each.
const FOLDERS = [
  { dir: "assignment_brief", title: "Assignment Brief", note: "the assignment brief / task description" },
  { dir: "grading_rubric", title: "Grading Rubric", note: "the grading rubric / marking criteria" },
  { dir: "referencing_guide", title: "Referencing Guide", note: "the referencing style guide (e.g. Warwick Harvard)" },
  { dir: "previous_assignments", title: "Previous Assignments", note: "the student's previous works (style reference for Alex)" },
  { dir: "curriculum", title: "Curriculum", note: "the module curriculum materials (use current/ and wiki/ subfolders)" },
];

function readme(title, note) {
  return `# ${title}

Drop ${note} here — **PDF, .docx, .md, or .txt**.

Then open this project's **Setup** workflow in the app and click **Convert** to generate the
markdown summary. Originals stay local (binaries are gitignored); the generated markdown is
committed and visible online.
`;
}

const targets = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

let created = 0;
for (const project of targets) {
  const inputDir = path.join(PROJECTS_DIR, project, "00 Input");
  for (const f of FOLDERS) {
    const dir = path.join(inputDir, f.dir);
    fs.mkdirSync(dir, { recursive: true });
    const rmPath = path.join(dir, "README.md");
    if (!fs.existsSync(rmPath)) {
      fs.writeFileSync(rmPath, readme(f.title, f.note), "utf-8");
      created++;
    }
  }
}
console.log(`Scaffolded input folders across ${targets.length} project(s); wrote ${created} README(s).`);
