import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const PROJECTS_DIR = path.join(process.cwd(), "..", "01 projects");

interface RisEntry {
  type: string;
  title: string;
  authors: string[];
  year: string;
  hasPdf: boolean;
  doi: string;
  url: string;
  isbn: string;
}

const TYPE_LABELS: Record<string, string> = {
  JOUR: "Journal", BOOK: "Book", CHAP: "Book Chapter",
  RPRT: "Report", CONF: "Conference", THES: "Thesis",
  ELEC: "Website", GEN: "Generic", MGZN: "Magazine",
  NEWS: "News", PAMP: "Pamphlet", PAT: "Patent",
  SLIDE: "Slides", UNPB: "Unpublished", VIDEO: "Video",
};

function parseRis(content: string): RisEntry[] {
  const entries: RisEntry[] = [];
  const blocks = content.split(/\nER\s*-/).filter(b => b.trim());
  for (const block of blocks) {
    const lines = block.split("\n");
    const get = (tag: string) => {
      const found = lines.find(l => l.startsWith(tag + "  -"));
      return found ? found.slice(tag.length + 4).trim() : "";
    };
    const getAll = (tag: string) => lines.filter(l => l.startsWith(tag + "  -")).map(l => l.slice(tag.length + 4).trim());
    const ty = get("TY");
    if (!ty) continue;
    const title = get("TI") || get("T1") || "(untitled)";
    const year = get("PY") || get("DA").slice(0, 4) || "?";
    const authors = getAll("AU").concat(getAll("A1"));
    const doi = get("DO");
    const url = get("UR") || get("L2");
    const isbn = get("SN");
    entries.push({ type: ty, title, authors, year, hasPdf: false, doi, url, isbn });
  }
  return entries;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function entryMatchesPdf(entry: RisEntry, pdfNames: string[]): boolean {
  const firstAuthorLast = entry.authors[0]?.split(",")[0]?.split(" ").slice(-1)[0] ?? "";
  const year = entry.year.slice(0, 4);
  const titleWords = entry.title.split(/\s+/).slice(0, 4).map(w => normalize(w)).filter(w => w.length > 3);
  for (const pdf of pdfNames) {
    const p = normalize(pdf.replace(/^!/, ""));
    const matchesAuthor = firstAuthorLast.length > 2 && p.includes(normalize(firstAuthorLast));
    const matchesYear = year.length === 4 && p.includes(year);
    const matchesTitle = titleWords.some(w => p.includes(w));
    if (matchesAuthor && matchesYear) return true;
    if (matchesAuthor && matchesTitle) return true;
  }
  return false;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = path.join(PROJECTS_DIR, id, "04 Research", "bibliography");
  const researchDir = path.join(PROJECTS_DIR, id, "04 Research");
  const result: Record<string, unknown> = {};

  // Parse RIS
  let risEntries: RisEntry[] = [];
  try {
    const risFiles = fs.existsSync(base) ? fs.readdirSync(base).filter(f => f.endsWith(".ris")) : [];
    if (risFiles.length > 0) {
      const ris = fs.readFileSync(path.join(base, risFiles[0]), "utf-8");
      risEntries = parseRis(ris);
      result.zoteroCount = risEntries.length;
      result.risFile = risFiles[0];
    } else {
      result.zoteroCount = 0;
    }
  } catch { result.zoteroCount = null; }

  // Collect all PDF filenames
  let allPdfs: string[] = [];
  try {
    const pdfBase = path.join(base, "pdf");
    const partA = path.join(pdfBase, "partA");
    const partB = path.join(pdfBase, "partB");
    if (fs.existsSync(partA) && fs.existsSync(partB)) {
      allPdfs = [
        ...fs.readdirSync(partA).filter(f => f.endsWith(".pdf")),
        ...fs.readdirSync(partB).filter(f => f.endsWith(".pdf")),
      ];
      result.pdfPartA = fs.readdirSync(partA).filter(f => f.endsWith(".pdf")).length;
      result.pdfPartB = fs.readdirSync(partB).filter(f => f.endsWith(".pdf")).length;
    } else if (fs.existsSync(pdfBase)) {
      allPdfs = fs.readdirSync(pdfBase).filter(f => f.endsWith(".pdf"));
    }
    result.pdfTotal = allPdfs.length;
    result.pdfAccessible = allPdfs.filter(f => !f.startsWith("!")).length;
    result.pdfNoAccess = allPdfs.filter(f => f.startsWith("!")).length;
  } catch { result.pdfTotal = null; }

  // Match entries to PDFs — find which have no PDF
  if (risEntries.length > 0) {
    for (const entry of risEntries) {
      entry.hasPdf = entryMatchesPdf(entry, allPdfs);
    }
    result.missingPdf = risEntries
      .filter(e => !e.hasPdf)
      .map(e => ({
        type: TYPE_LABELS[e.type] ?? e.type,
        title: e.title,
        author: e.authors[0] ?? "",
        year: e.year,
        doi: e.doi,
        url: e.url,
        isbn: e.isbn,
      }));
  } else {
    result.missingPdf = [];
  }

  // Wiki count
  try {
    const wikiCandidates = [
      path.join(researchDir, "references_wiki", "glossary"),
      path.join(researchDir, "references_wiki"),
      path.join(base, "references_wiki", "glossary"),
      path.join(base, "references_wiki"),
    ];
    let wikiCount = 0;
    for (const dir of wikiCandidates) {
      if (fs.existsSync(dir)) {
        const countMd = (d: string): number =>
          fs.readdirSync(d, { withFileTypes: true }).reduce((acc, e) => {
            if (e.isDirectory()) return acc + countMd(path.join(d, e.name));
            if (e.name.endsWith(".md") && e.name !== "index.md") return acc + 1;
            return acc;
          }, 0);
        wikiCount = countMd(dir);
        break;
      }
    }
    result.wikiCount = wikiCount;
  } catch { result.wikiCount = null; }

  // Assessment file
  const assessmentSearchPaths = [
    path.join(researchDir, "bibliography-quality-assessment.html"),
    path.join(base, "bibliography-quality-assessment.html"),
    path.join(base, "status.html"),
  ];
  const foundAssessmentPath = assessmentSearchPaths.find(p => fs.existsSync(p));
  result.hasStatusHtml = !!foundAssessmentPath;
  result.assessmentFile = foundAssessmentPath ?? null;

  return NextResponse.json(result);
}