<#
.SYNOPSIS
  Essay Fabrik — Workflow PDF Generator
.DESCRIPTION
  Converts a workflow result.md to a branded A4 PDF using Edge headless.
  Triggered automatically by Claude Code PostToolUse hook.
.PARAMETER MdPath
  Absolute path to the result.md file
#>
param([Parameter(Mandatory)][string]$MdPath)

Set-StrictMode -Off
$ErrorActionPreference = 'Stop'

# ─── Paths ────────────────────────────────────────────────────────────────────
$EDGE    = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$FONTS   = 'C:\Users\OnkelAle\OneDrive\10 Documents\15 Dev\EssayFabrik\Team_folder\Egbert\fonts'
$CAL_R   = 'C:\Windows\Fonts\calibri.ttf'
$CAL_B   = 'C:\Windows\Fonts\calibrib.ttf'
$CAL_I   = 'C:\Windows\Fonts\calibrii.ttf'

# ─── Workflow metadata ────────────────────────────────────────────────────────
$WF_META = @{
  'setup'              = @{ name = 'Project Setup';       sub = 'Brief Analysis & Scoping';              num = '01' }
  'brainstorming'      = @{ name = 'Brainstorming';       sub = 'Topic Selection & Narrative Direction'; num = '02' }
  'curriculum-mapping' = @{ name = 'Curriculum Mapping';  sub = 'Theory & Concept Alignment';            num = '03' }
  'research'           = @{ name = 'Research & Evidence'; sub = 'Literature Review & Source Database';   num = '04' }
  'outline'            = @{ name = 'Outline & Structure'; sub = 'Presentation Architecture';             num = '05' }
  'drafting'           = @{ name = 'Drafting';            sub = 'Content Creation';                      num = '06' }
  'quality-assessment' = @{ name = 'Quality Assessment';  sub = 'Rubric-Based Review';                   num = '07' }
  'finalisation'       = @{ name = 'Finalisation';        sub = 'Final Corrections & Submission Prep';   num = '08' }
}

$FOLDER_WF = @{
  '01 Setup'         = 'setup';        '01_scoping'      = 'setup'
  '02 Brainstorming' = 'brainstorming'; '03_brainstorming'= 'brainstorming'
  '03 Curriculum'    = 'curriculum-mapping'; '02_curriculum' = 'curriculum-mapping'
  '04 Research'      = 'research';     '06_research'     = 'research'
  '05 Outline'       = 'outline';      '04_thesis'       = 'outline'; '05_rough_design' = 'outline'
  '06 Drafting'      = 'drafting';     '07_writing'      = 'drafting'
  '07 QA'            = 'quality-assessment'; '08_fqa'    = 'quality-assessment'
  '08 Final'         = 'finalisation'
}

# ─── Helpers ──────────────────────────────────────────────────────────────────
function Get-B64Font([string]$path) {
  if (Test-Path $path) { return [Convert]::ToBase64String([IO.File]::ReadAllBytes($path)) }
  return $null
}

function Escape-Html([string]$t) {
  $t -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;'
}

function Apply-Inline([string]$t) {
  $s = Escape-Html $t
  $s = $s -replace '\*\*(.+?)\*\*', '<strong>$1</strong>'
  $s = $s -replace '(?<!\*)\*([^*\r\n]+)\*(?!\*)', '<em>$1</em>'
  $s = $s -replace '`([^`]+)`', '<code>$1</code>'
  return $s
}

function ConvertTo-BodyHtml([string]$md) {
  $lines   = $md -split "`r?\n"
  $out     = [System.Collections.Generic.List[string]]::new()
  $inUl    = $false
  $inOl    = $false
  $tableRows = [System.Collections.Generic.List[string[]]]::new()
  $inTable = $false
  $i = 0

  function FlushTable {
    if ($script:tableRows.Count -eq 0) { return }
    $out.Add('<table>')
    $out.Add('<thead><tr>')
    foreach ($cell in $script:tableRows[0]) { $out.Add("<th>$(Apply-Inline $cell)</th>") }
    $out.Add('</tr></thead>')
    if ($script:tableRows.Count -gt 1) {
      $out.Add('<tbody>')
      for ($r = 1; $r -lt $script:tableRows.Count; $r++) {
        $out.Add('<tr>')
        foreach ($cell in $script:tableRows[$r]) { $out.Add("<td>$(Apply-Inline $cell)</td>") }
        $out.Add('</tr>')
      }
      $out.Add('</tbody>')
    }
    $out.Add('</table>')
    $script:tableRows.Clear()
    $script:inTable = $false
  }

  while ($i -lt $lines.Count) {
    $raw = $lines[$i]
    $t   = $raw.Trim()

    # Detect what this line is
    $isTableRow = $t -match '^\|'
    $isBullet   = $t -match '^[-*] '
    $isOl       = $t -match '^\d+\. '

    # Close open table if leaving table block
    if ($inTable -and -not $isTableRow) { FlushTable }

    # Close open lists
    if ($inUl -and -not $isBullet) { $out.Add('</ul>'); $inUl = $false }
    if ($inOl -and -not $isOl)     { $out.Add('</ol>'); $inOl = $false }

    # Headings
    if ($t -match '^### (.+)') { $out.Add("<h3>$(Apply-Inline $Matches[1])</h3>"); $i++; continue }
    if ($t -match '^## (.+)')  { $out.Add("<h2>$(Apply-Inline $Matches[1])</h2>"); $i++; continue }
    if ($t -match '^# (.+)')   { $out.Add("<h1>$(Apply-Inline $Matches[1])</h1>"); $i++; continue }

    # HR
    if ($t -match '^---+$') { $out.Add('<hr>'); $i++; continue }

    # Table row
    if ($isTableRow) {
      $inTable = $true
      # Skip separator rows (only |, -, :, spaces)
      if ($t -notmatch '^[|\s\-:]+$') {
        $cells = ($t -split '\|' | Select-Object -Skip 1) | ForEach-Object { $_.Trim() }
        # Remove last empty cell from trailing |
        if ($cells[-1] -eq '') { $cells = $cells[0..($cells.Count-2)] }
        $tableRows.Add([string[]]$cells)
      }
      $i++; continue
    }

    # Bullet
    if ($isBullet) {
      if (-not $inUl) { $out.Add('<ul>'); $inUl = $true }
      $out.Add("<li>$(Apply-Inline ($t -replace '^[-*] ',''))</li>")
      $i++; continue
    }

    # Ordered list
    if ($isOl) {
      if (-not $inOl) { $out.Add('<ol>'); $inOl = $true }
      $out.Add("<li>$(Apply-Inline ($t -replace '^\d+\. ',''))</li>")
      $i++; continue
    }

    # Empty line → paragraph break
    if (-not $t) { $out.Add('<br>'); $i++; continue }

    # Paragraph
    $out.Add("<p>$(Apply-Inline $t)</p>")
    $i++
  }

  # Flush any open table/list
  if ($inTable) { FlushTable }
  if ($inUl) { $out.Add('</ul>') }
  if ($inOl) { $out.Add('</ol>') }

  return $out -join "`n"
}

# ─── Step indicator HTML ──────────────────────────────────────────────────────
function Get-StepBar([string]$activeWfId) {
  $steps = @(
    @{id='setup';n='Setup'},@{id='brainstorming';n='Brainstorm'},
    @{id='curriculum-mapping';n='Curriculum'},@{id='research';n='Research'},
    @{id='outline';n='Outline'},@{id='drafting';n='Drafting'},
    @{id='quality-assessment';n='QA'},@{id='finalisation';n='Final'}
  )
  $wfOrder = $steps.id
  $activeIdx = [array]::IndexOf(($steps | ForEach-Object {$_.id}), $activeWfId)

  $bars = foreach ($idx in 0..($steps.Count-1)) {
    $s = $steps[$idx]
    if ($idx -lt $activeIdx)   { $cls = 'step-done' }
    elseif ($idx -eq $activeIdx) { $cls = 'step-active' }
    else                        { $cls = 'step-future' }
    "<div class='step $cls'>$($s.n)</div>"
  }
  return "<div class='step-bar'>$($bars -join '')</div>"
}

# ─── Main ─────────────────────────────────────────────────────────────────────
$MdPath = [IO.Path]::GetFullPath($MdPath)
if (-not (Test-Path $MdPath)) { Write-Error "File not found: $MdPath"; exit 1 }

$wfFolder  = Split-Path (Split-Path $MdPath -Parent) -Leaf
$projDir   = Split-Path (Split-Path $MdPath -Parent) -Parent
$wfId      = if ($FOLDER_WF.ContainsKey($wfFolder)) { $FOLDER_WF[$wfFolder] } else { 'setup' }
$wfMeta    = if ($WF_META.ContainsKey($wfId))        { $WF_META[$wfId]       } else { @{name=$wfFolder;sub='';num='??'} }
$dateStr   = (Get-Date).ToString('yyyy-MM-dd')
$content   = [IO.File]::ReadAllText($MdPath, [Text.Encoding]::UTF8)
$bodyHtml  = ConvertTo-BodyHtml $content

# Load project metadata
$projName = 'Essay Fabrik'; $modName = ''; $partName = ''
$stateFile = Join-Path $projDir 'project-state.json'
if (Test-Path $stateFile) {
  try {
    $state    = Get-Content $stateFile | ConvertFrom-Json
    $projName = if ($state.project.name)   { $state.project.name   } else { 'Essay Fabrik' }
    $modName  = if ($state.project.module) { $state.project.module } else { '' }
    $partName = if ($state.project.part)   { $state.project.part   } else { '' }
  } catch {}
}

$projLine  = (@($projName, $modName, $(if($partName){"Part $partName"}else{''})) | Where-Object {$_}) -join '  ·  '
$stepBar   = Get-StepBar $wfId
$outPdf    = Join-Path (Split-Path $MdPath -Parent) 'result.pdf'
$tmpHtml   = [IO.Path]::ChangeExtension([IO.Path]::GetTempFileName(), '.html')

# ─── Embed fonts as base64 ────────────────────────────────────────────────────
$rajBold = Get-B64Font (Join-Path $FONTS 'Rajdhani-Bold.ttf')
$rajSemi = Get-B64Font (Join-Path $FONTS 'Rajdhani-SemiBold.ttf')
$rajReg  = Get-B64Font (Join-Path $FONTS 'Rajdhani-Regular.ttf')
$calR    = Get-B64Font $CAL_R
$calB    = Get-B64Font $CAL_B
$calI    = Get-B64Font $CAL_I

$fontCss = ''
if ($rajBold) { $fontCss += "@font-face{font-family:'Rajdhani';font-weight:700;src:url('data:font/truetype;base64,$rajBold')format('truetype');}`n" }
if ($rajSemi) { $fontCss += "@font-face{font-family:'Rajdhani';font-weight:600;src:url('data:font/truetype;base64,$rajSemi')format('truetype');}`n" }
if ($rajReg)  { $fontCss += "@font-face{font-family:'Rajdhani';font-weight:400;src:url('data:font/truetype;base64,$rajReg')format('truetype');}`n" }
if ($calR)    { $fontCss += "@font-face{font-family:'Calibri';font-weight:400;font-style:normal;src:url('data:font/truetype;base64,$calR')format('truetype');}`n" }
if ($calB)    { $fontCss += "@font-face{font-family:'Calibri';font-weight:700;font-style:normal;src:url('data:font/truetype;base64,$calB')format('truetype');}`n" }
if ($calI)    { $fontCss += "@font-face{font-family:'Calibri';font-weight:400;font-style:italic;src:url('data:font/truetype;base64,$calI')format('truetype');}`n" }

$bodyFont = if ($calR) { "'Calibri', 'Segoe UI', sans-serif" } else { "'Segoe UI', sans-serif" }
$headFont = if ($rajBold) { "'Rajdhani', 'Segoe UI', sans-serif" } else { "'Segoe UI', sans-serif" }

# ─── Build HTML ───────────────────────────────────────────────────────────────
$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
$fontCss

/* ── Page setup ── */
@page { size: A4; margin: 28mm 18mm 20mm 18mm; }
@page cover { size: A4; margin: 0; }
@page :not(.cover) {
  @bottom-left   { content: 'Essay Fabrik  —  $($wfMeta.name)'; font-family: $bodyFont; font-size: 7pt; color: #b4b4b4; }
  @bottom-right  { content: 'Page ' counter(page); font-family: $bodyFont; font-size: 7pt; color: #b4b4b4; }
  @top-right     { content: '$projLine  ·  $dateStr'; font-family: $bodyFont; font-size: 7pt; color: #b4b4b4; }
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* ── Variables ── */
:root {
  --dark:   #141e3c;
  --mid:    #284682;
  --light:  #6488c8;
  --accent: #e6b432;
  --white:  #ffffff;
  --text:   #3c3c3c;
  --gray-l: #f0f2f5;
  --gray-m: #b4b4b4;
}

/* ─────────────────────────── COVER PAGE ─────────────────────────── */
.cover {
  page: cover;
  break-after: page;
  width: 210mm;
  height: 297mm;
  background: white;
  font-family: $headFont;
  overflow: hidden;
  position: relative;
}

.cover-header {
  background: var(--dark);
  height: 88mm;
  position: relative;
  padding: 0;
}

.cover-accent-left {
  position: absolute;
  left: 0; top: 0;
  width: 7mm; height: 88mm;
  background: var(--accent);
}

.cover-brand {
  position: absolute;
  left: 14mm; top: 16mm;
  color: white;
  font-size: 34pt;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1;
}

.cover-session {
  position: absolute;
  right: 14mm; top: 18mm;
  color: var(--gray-m);
  font-family: $bodyFont;
  font-size: 8pt;
}

.cover-divider {
  position: absolute;
  left: 14mm; top: 56mm;
  width: 90mm; height: 1px;
  background: var(--accent);
  opacity: 0.7;
}

.cover-wf-name {
  position: absolute;
  left: 14mm; top: 59mm;
  color: var(--accent);
  font-size: 23pt;
  font-weight: 600;
  line-height: 1.1;
}

.cover-wf-sub {
  position: absolute;
  left: 14mm; top: 72mm;
  color: var(--light);
  font-size: 12pt;
  font-weight: 400;
}

.cover-gold-bar {
  width: 100%;
  height: 5mm;
  background: var(--accent);
}

.cover-proj-line {
  padding: 5mm 14mm 0 14mm;
  color: #8090b0;
  font-family: $bodyFont;
  font-size: 10pt;
  letter-spacing: 0.5px;
}

.cover-number {
  position: absolute;
  right: 14mm; top: 93mm;
  width: 12mm; height: 12mm;
  border-radius: 50%;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  color: var(--dark);
  font-size: 13pt;
  font-weight: 700;
}

.cover-info-box {
  margin: 5mm 14mm 0 14mm;
  background: var(--gray-l);
  border-radius: 3px;
  padding: 4mm 6mm;
}

.cover-info-row {
  display: flex;
  font-family: $bodyFont;
  font-size: 9pt;
  line-height: 1.8;
}

.cover-info-label {
  width: 26mm;
  font-weight: 700;
  color: var(--mid);
  flex-shrink: 0;
}

.cover-info-value {
  color: var(--text);
}

/* Step bar */
.step-bar {
  display: flex;
  margin: 6mm 14mm 0 14mm;
  gap: 1.5px;
  border-radius: 3px;
  overflow: hidden;
}

.step {
  flex: 1;
  text-align: center;
  font-family: $headFont;
  font-size: 7.5pt;
  font-weight: 600;
  padding: 2.5mm 0;
  letter-spacing: 0.3px;
}

.step-done   { background: var(--dark); color: var(--gray-m); }
.step-active { background: var(--mid);  color: white; }
.step-future { background: var(--gray-l); color: var(--gray-m); }

/* ─────────────────────────── CONTENT PAGES ─────────────────────────── */
.content {
  font-family: $bodyFont;
  font-size: 10pt;
  color: var(--text);
  line-height: 1.55;
}

h1 {
  font-family: $headFont;
  font-size: 20pt;
  font-weight: 700;
  color: var(--dark);
  margin: 6mm 0 1mm 0;
  padding-bottom: 1.5mm;
  border-bottom: 1px solid var(--light);
  break-after: avoid;
}

h2 {
  font-family: $headFont;
  font-size: 14pt;
  font-weight: 600;
  color: var(--mid);
  margin: 5mm 0 1.5mm 0;
  break-after: avoid;
}

h3 {
  font-family: $headFont;
  font-size: 10.5pt;
  font-weight: 600;
  color: #787878;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 4mm 0 1mm 0;
  break-after: avoid;
}

p {
  margin: 0 0 2mm 0;
  orphans: 3; widows: 3;
}

br { display: block; margin: 1mm 0; content: ''; }

strong { font-weight: 700; color: var(--dark); }
em { font-style: italic; }

code {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 8.5pt;
  background: var(--gray-l);
  padding: 1px 4px;
  border-radius: 2px;
}

hr {
  border: none;
  border-top: 0.5px solid var(--gray-m);
  margin: 3mm 0;
}

/* Lists */
ul, ol {
  margin: 0 0 2mm 5mm;
  padding-left: 4mm;
}

li {
  margin-bottom: 1mm;
  padding-left: 1mm;
}

ul li::marker { color: var(--mid); font-size: 8pt; }
ol li::marker { color: var(--mid); font-weight: 700; font-size: 9pt; }

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 3mm 0;
  font-size: 8.5pt;
  break-inside: avoid;
}

thead tr {
  background: var(--dark) !important;
}

thead th {
  color: white;
  font-family: $headFont;
  font-weight: 700;
  font-size: 9pt;
  padding: 2.5mm 3mm;
  text-align: left;
  border: none;
}

tbody tr:nth-child(even) { background: var(--gray-l); }
tbody tr:nth-child(odd)  { background: white; }

tbody td {
  padding: 2mm 3mm;
  border-bottom: 0.5px solid #e0e0e8;
  vertical-align: top;
  line-height: 1.45;
}
</style>
</head>
<body>

<!-- ═══════ COVER PAGE ═══════ -->
<div class="cover">
  <div class="cover-header">
    <div class="cover-accent-left"></div>
    <div class="cover-brand">ESSAY FABRIK</div>
    <div class="cover-session">$dateStr</div>
    <div class="cover-divider"></div>
    <div class="cover-wf-name">$($wfMeta.name)</div>
    <div class="cover-wf-sub">$($wfMeta.sub)</div>
  </div>
  <div class="cover-gold-bar"></div>
  <div class="cover-number">$($wfMeta.num)</div>
  <div class="cover-proj-line">$projLine</div>
  <div class="cover-info-box">
    <div class="cover-info-row"><span class="cover-info-label">Project</span><span class="cover-info-value">$projName</span></div>
    <div class="cover-info-row"><span class="cover-info-label">Module</span><span class="cover-info-value">$(if($modName){$modName}else{'—'})</span></div>
    <div class="cover-info-row"><span class="cover-info-label">Part</span><span class="cover-info-value">$(if($partName){$partName}else{'—'})</span></div>
    <div class="cover-info-row"><span class="cover-info-label">Workflow</span><span class="cover-info-value">$($wfMeta.name)</span></div>
    <div class="cover-info-row"><span class="cover-info-label">Generated</span><span class="cover-info-value">$dateStr</span></div>
  </div>
  $stepBar
</div>

<!-- ═══════ CONTENT ═══════ -->
<div class="content">
$bodyHtml
</div>

</body>
</html>
"@

# ─── Write temp HTML & convert ───────────────────────────────────────────────
[IO.File]::WriteAllText($tmpHtml, $html, [Text.Encoding]::UTF8)

$edgeArgs = @(
  '--headless',
  '--disable-gpu',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=5000',
  "--print-to-pdf=`"$outPdf`"",
  '--print-to-pdf-no-header',
  '--no-sandbox',
  '--disable-extensions',
  "file:///$($tmpHtml -replace '\\','/')"
)

try {
  $proc = Start-Process -FilePath $EDGE -ArgumentList $edgeArgs -Wait -PassThru -WindowStyle Hidden
  if ($proc.ExitCode -eq 0 -and (Test-Path $outPdf)) {
    Write-Host "[EssayFabrik PDF] Saved: $outPdf"
  } else {
    Write-Warning "[EssayFabrik PDF] Edge exited $($proc.ExitCode). PDF may be incomplete."
  }
} finally {
  Remove-Item $tmpHtml -ErrorAction SilentlyContinue
}
