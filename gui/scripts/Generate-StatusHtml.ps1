<#
.SYNOPSIS
  Essay Fabrik — Live Status Dashboard Generator
.DESCRIPTION
  Renders a self-refreshing status.html for a project during an auto-orchestrator run.
  Reads project-state.json (budget), an orchestrator-written status.json (live loop fields),
  and optionally the Baerbel ledger for cumulative spend. Called by /fabrik-run each iteration.
.PARAMETER ProjectDir
  Absolute path to the project folder (contains project-state.json).
.NOTES
  Pure HTML/CSS, no PDF/Edge needed — meant to be opened live in a browser tab.
#>
param([Parameter(Mandatory)][string]$ProjectDir)

Set-StrictMode -Off
$ErrorActionPreference = 'Stop'

$ProjectDir = [IO.Path]::GetFullPath($ProjectDir)
if (-not (Test-Path $ProjectDir)) { Write-Error "Project folder not found: $ProjectDir"; exit 1 }

function Read-Json([string]$path) {
  if (Test-Path $path) { try { return (Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json) } catch { return $null } }
  return $null
}
function Esc([string]$t) { if ($null -eq $t) { return '' } ($t -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;') }
function Num($v, $d=0) { if ($null -eq $v -or "$v" -eq '') { return $d } return [double]$v }

# ─── Load data ────────────────────────────────────────────────────────────────
$state  = Read-Json (Join-Path $ProjectDir 'project-state.json')
$status = Read-Json (Join-Path $ProjectDir 'status.json')

$projName = if ($state.project.name) { $state.project.name } else { Split-Path $ProjectDir -Leaf }
$modName  = if ($state.project.module) { "$($state.project.module)" } else { '' }
$partName = if ($state.project.part) { "Part $($state.project.part)" } else { '' }
$projLine = (@($projName, $modName, $partName) | Where-Object { $_ }) -join '  ·  '

# Budget
$cap    = Num $state.project.budget.cap 15
$spent  = Num $state.project.budget.spent 0
$warnAt = Num $state.project.budget.warnAt 0.8
$curr   = if ($state.project.budget.currency) { $state.project.budget.currency } else { 'EUR' }
$spendPct = if ($cap -gt 0) { [math]::Min(100, [math]::Round(($spent / $cap) * 100)) } else { 0 }

# Live loop fields (from status.json; fall back to project-state)
$phase      = if ($status.phase)     { $status.phase }     elseif ($state.project.currentWorkflow) { $state.project.currentWorkflow } else { '—' }
$loopLabel  = if ($status.loop)      { $status.loop }      elseif ($state.project.currentVersion) { $state.project.currentVersion } else { '—' }
$iteration  = Num $status.iteration 0
$maxLoops   = if ($status.maxLoops) { Num $status.maxLoops 5 } else { Num $state.project.maxLoops 5 }
$metric     = if ($status.metric)   { $status.metric } else { 'score' }
$score      = Num $status.score 0
$threshold  = if ($status.threshold) { Num $status.threshold 0 } else { Num $state.project.passThreshold 0 }
$prevScore  = Num $status.prevScore 0
$runState   = if ($status.state)    { $status.state } else { 'idle' }
$lastAction = if ($status.lastAction) { $status.lastAction } else { 'No run yet — start with /fabrik-run.' }
$nextAction = if ($status.nextAction) { $status.nextAction } else { '—' }
$updatedAt  = if ($status.updatedAt) { $status.updatedAt } else { (Get-Date).ToString('yyyy-MM-dd HH:mm:ss') }
$scorePct   = if ($threshold -gt 0) { [math]::Min(100, [math]::Round(($score / $threshold) * 100)) } else { [math]::Min(100, $score) }

# ─── Colours ──────────────────────────────────────────────────────────────────
$scoreColor = if ($score -ge $threshold -and $threshold -gt 0) { '#2f8f4e' } else { '#284682' }
$spendColor = if ($spendPct -ge 100) { '#c0392b' } elseif (($spent / [math]::Max($cap,0.0001)) -ge $warnAt) { '#e6a012' } else { '#2f8f4e' }

$stateMap = @{
  'running'             = @{ c='#284682'; t='RUNNING' }
  'passed'              = @{ c='#2f8f4e'; t='PASSED — GATE MET' }
  'blocked-budget'      = @{ c='#c0392b'; t='BLOCKED — BUDGET CAP' }
  'stalled-no-progress' = @{ c='#e6a012'; t='STALLED — NO PROGRESS' }
  'awaiting-elicit'     = @{ c='#7c5cbf'; t='AWAITING ELICIT REPORT' }
  'escalated'           = @{ c='#c0392b'; t='ESCALATED — NEEDS YOU' }
  'idle'                = @{ c='#8090b0'; t='IDLE' }
}
$sb = if ($stateMap.ContainsKey($runState)) { $stateMap[$runState] } else { $stateMap['idle'] }

# Auto-refresh only while actively running
$refresh = if ($runState -eq 'running') { '<meta http-equiv="refresh" content="10">' } else { '' }

# ─── HTML ─────────────────────────────────────────────────────────────────────
$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
$refresh
<title>Status — $(Esc $projName)</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; color: #3c3c3c; padding: 28px; }
  .wrap { max-width: 760px; margin: 0 auto; }
  .head { background: #141e3c; border-radius: 8px 8px 0 0; padding: 20px 26px; position: relative; }
  .head .accent { position:absolute; left:0; top:0; bottom:0; width:6px; background:#e6b432; border-radius:8px 0 0 0; }
  .brand { color:#fff; font-size:22px; font-weight:700; letter-spacing:1px; }
  .proj  { color:#8090b0; font-size:12px; margin-top:3px; }
  .badge { position:absolute; right:26px; top:22px; background:$($sb.c); color:#fff; font-size:11px; font-weight:700; letter-spacing:.5px; padding:6px 12px; border-radius:14px; }
  .card { background:#fff; padding:22px 26px; border-bottom:1px solid #e6e8ee; }
  .card:last-child { border-radius:0 0 8px 8px; border-bottom:none; }
  .row { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
  .label { font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:#787878; font-weight:600; }
  .val { font-size:13px; color:#141e3c; font-weight:600; }
  .big { font-size:26px; font-weight:700; color:#141e3c; }
  .bar { height:14px; background:#e6e8ee; border-radius:7px; overflow:hidden; margin-top:6px; }
  .fill { height:100%; border-radius:7px; }
  .meta { display:flex; gap:26px; margin-top:4px; }
  .meta div { flex:1; }
  .action { font-size:13px; line-height:1.5; }
  .muted { color:#8090b0; font-size:11px; margin-top:14px; }
  .grid { display:flex; gap:26px; }
  .grid > div { flex:1; }
</style>
</head>
<body>
<div class="wrap">

  <div class="head">
    <div class="accent"></div>
    <div class="brand">ESSAY FABRIK · STATUS</div>
    <div class="proj">$(Esc $projLine)</div>
    <div class="badge">$($sb.t)</div>
  </div>

  <div class="card">
    <div class="grid">
      <div>
        <div class="label">Phase / Loop</div>
        <div class="big">$(Esc $phase)</div>
        <div class="val">$(Esc $loopLabel) · iteration $iteration / $maxLoops</div>
      </div>
      <div>
        <div class="label">Updated</div>
        <div class="val" style="font-size:13px;">$(Esc $updatedAt)</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="row"><span class="label">$(Esc $metric)</span><span class="val">$score / $threshold &nbsp; (prev $prevScore)</span></div>
    <div class="bar"><div class="fill" style="width:$scorePct%; background:$scoreColor;"></div></div>
  </div>

  <div class="card">
    <div class="row"><span class="label">Spend vs budget</span><span class="val">$curr $spent / $curr $cap &nbsp; ($spendPct%)</span></div>
    <div class="bar"><div class="fill" style="width:$spendPct%; background:$spendColor;"></div></div>
  </div>

  <div class="card">
    <div class="label">Last action</div>
    <div class="action">$(Esc $lastAction)</div>
    <div class="label" style="margin-top:14px;">Next action</div>
    <div class="action">$(Esc $nextAction)</div>
    <div class="muted">Auto-refreshes every 10s while running. Generated by Generate-StatusHtml.ps1.</div>
  </div>

</div>
<div style="margin-top:24px;border-top:1px solid #dde3ee;padding:9px 20px 7px;font-size:10.5px;color:#aaa;text-align:right;font-family:sans-serif;">Generated: $((Get-Date).ToString('yyyy-MM-dd HH:mm')) &middot; Essay Fabrik</div>
</body>
</html>
"@

$outFile = Join-Path $ProjectDir 'status.html'
[IO.File]::WriteAllText($outFile, $html, (New-Object Text.UTF8Encoding($false)))
Write-Host "[EssayFabrik Status] Saved: $outFile  (state=$runState, score=$score/$threshold, spend=$curr$spent/$cap)"
