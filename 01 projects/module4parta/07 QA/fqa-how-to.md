# FQA How-To — Module 4 Part A

How to run the Full Quality Assessment (FQA) for this project. Follow this every time a new tommy version arrives.

---

## Step 1 — Read the PDF

Use the Read tool on the PDF file in `06 Drafting/tommy<n>.pdf`. The PDF contains all slide content including footnotes. It does NOT contain speaker notes.

```
Read: C:\Users\OnkelAle\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4parta\06 Drafting\tommy<n>.pdf
```

Read all pages. Key pages:
- p.1 = Cover sheet
- p.2 = Title slide
- p.3–7 = Content slides S1–S5
- p.8 onward = Reference slides + End slide (order may vary)

---

## Step 2 — Extract speaker notes from PPTX

A PPTX is a zip file. Notes are in `ppt/notesSlides/notesSlide*.xml`. Use PowerShell to extract and parse:

```powershell
$pptxPath = "C:\Users\OnkelAle\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4parta\06 Drafting\Student 5779906 – Module 4 Part Av0.X CLAUDE.pptx"
$extractPath = "C:\Users\OnkelAle\AppData\Local\Temp\pptx_tommy<n>"
if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($pptxPath, $extractPath)
Get-ChildItem "$extractPath\ppt\notesSlides" | Sort-Object Name | ForEach-Object {
    $name = $_.Name
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $text = [System.Text.RegularExpressions.Regex]::Replace($content, '<[^>]+>', ' ')
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, '\s+', ' ').Trim()
    Write-Output "=== $name ==="; Write-Output $text; Write-Output ""
}
```

Note: `_rels` subfolder will throw an access error on `ReadAllText` — ignore it, the note content files still extract correctly.

Slide-to-notesSlide mapping (standard order):
- notesSlide1 = Cover sheet
- notesSlide2 = Title slide
- notesSlide3 = S1
- notesSlide4 = S2
- notesSlide5 = S3
- notesSlide6 = S4
- notesSlide7 = S5
- notesSlide8/9 = Refs / End (usually empty)

---

## Step 3 — Read the previous FQA archive for context

Open the most recent FQA report and change tasks from `07 QA/archive/` to understand what issues were outstanding. The memory file (`memory/project_module4parta.md`) summarises the last state.

---

## Step 4 — Run the analysis

Compare tommy-new against tommy-previous on these axes:

### Christoph (Format / Rubric)
- Slide count (max 5 content slides)
- Title slide: student number, lecturer name
- Reference slides: typed Harvard, not empty
- Visual aids present
- Closing synthesis on S5
- Spelling errors

### Jackie (Evidence Audit)
- Every footnoted claim: does the cited source actually support it?
- Are any P1 citation errors from the previous FQA still present?
- Any new sources introduced — are they legitimate? PubMed-verifiable?
- Duplicate entries in reference list?
- Citations present on slides but missing from reference slides (invisible refs)?

### Peter (Curriculum Coverage)
Check against the M4 curriculum map in `03 Curriculum/curriculum-summary-m4.md`:
- ACEs definition + dose-response (M4 W1)
- Biological/neurological impacts (M4 W2)
- Cognitive impacts (M4 W2)
- Attachment / social-emotional (M4 W3)
- Mentalizing / Fonagy (M4 W4)
- 5P framework (M4 W4)
- Bronfenbrenner (M4 W1)
- Protective factors / resilience (M4 W5)
- FASD / neurodevelopmental (M4 W3)
- Diagnostic overshadowing (M4 W4)
- Continuum of Need / GIRFEC (M4 W3 p.35)
- Individual / family / community levels (assignment brief)

### Steven (Narrative + Script)
- Through-line: is it stated on S1 and resolved on S5?
- Slide bridges: S1→S2, S2→S3, S3→S4, S4→S5
- Notes: do they contain wrong content? Old QA guidance? Are they delivery-length (~150 words per slide)?
- Timing: at 150 wpm, estimate per-slide. Total should be ≤10:00. Flag if over.
- Density: flag slides with >10 bullet-points or >12 footnotes.

---

## Step 5 — Write the three HTML deliverables

All go in `07 QA/`. Use the CSS from previous versions (consistent visual design).

### 1. `fqa-report-m4pa-tommy<n>.html`
Sections: Header badge → Nav → Slide map (with notes column) → Dashboard (4 role scores + overall) → Christoph card → Jackie card (slide-by-slide) → Peter card (table) → Steven card (notes issues + timing + trim) → Egbert card (synthesis + V3 tasks + Go/No-Go)

Dashboard scores: average the 4 role scores for overall. Include delta vs previous tommy.

### 2. `detailed_change_tasks_v<n>.html`
One chapter per location (refs, notes, each slide that has changes). Each chapter has: header with gradient colour → summary block with "Possible points gained" pill → task cards with BEFORE/AFTER diff blocks.

Task ID format: `V<n>-<LOCATION>-T<n>` e.g. `V3-Notes-T1`, `V3-R-T1`, `V3-S4-T1`.

Priorities: P1 Critical (must fix before recording) → P2 High (same session) → P3 Medium (upside) → Optional/Trim.

### 3. `reference_check_tommy<n>.html`
One slide section per content slide + bibliography section. Each claim row: claim text | footnote | status pill | Harvard entry + in-text format.

Status pills: VERIFIED (green) | UNVERIFIED (orange) | WRONG/RISK (red) | UNCITED (blue) | SYNTHESIS (purple) | INVISIBLE (yellow — cited on slide but not in any visible ref slide).

Bibliography section: full Harvard entry for all 28+ slide-cited sources. Mark each as Verified / Unverified / Invisible.

---

## Step 6 — Update memory

Update `memory/project_module4parta.md` with:
- New tommy version number
- New FQA scores
- Remaining P1 tasks
- Go/No-Go verdict

---

## Key sources already verified (do not re-verify)

| Source | PMID / Confirmed via |
|--------|---------------------|
| Achenbach & Rescorla (2001) | NCTSN + academic databases |
| Blakemore & Choudhury (2006) | PMID 16492261 |
| Bongers et al. (2004) | PMID 15369529 |
| Felitti et al. (1998) | PMID 9635069 |
| Fonagy et al. (2002) | PEP-Web / Routledge |
| Main & Hesse (1990) | Semantic Scholar |
| Masten (2001) | ERIC EJ627466 |
| McCrory & Viding (2015) | PMID 25997767 |
| McCrory, Gerin & Viding (2017) | PMID 28295339 |
| SIGN 156 (2019) | sign.ac.uk |
| Tangney et al. (1992) | PMID 1583590 |
| Teicher et al. (2003) | PMID 12732221 |
| van der Kolk (2014) | Publisher / standard ref |
| Weerasekera (1996) | Publisher |
| Arpino et al. (2010) | In ref list p.8 |
| Berg et al. (2018) | In ref list p.8 |
| Dinkler et al. (2017) | In ref list p.8 |
| Gajwani & Minnis (2023) | In ref list p.8 |
| Garner & Yogman (2021) | Pediatrics 148(2) |
| Glover (2015) | Springer book chapter, URL in deck |
| McLaughlin et al. (2019) | Ann Rev Dev Psych 1:277 |

**Still unverified:** Dodge (2006) — not PubMed-searchable. Fallback: Crick & Dodge (1994).
