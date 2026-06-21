# Project Folder Convention

Copy this `_template` folder to start a new project: `01 projects/<project-id>/`.

```
<project-id>/
├── 00 Input/                     ← ALL user-provided raw material (you fill this)
│   ├── assignment_brief.pdf
│   ├── grading_rubric.pdf
│   ├── referencing_style_guide.pdf
│   ├── additional/               ← vignettes, case studies, extra briefs, datasets
│   └── previous_assignments/     ← your last ~5 assignments, any format (Alex/Pascal match tone & style)
│
├── 01 Setup/                     ← decoded assessment summary (result.md / result.pdf)
├── 02 Brainstorming/
├── 03 Curriculum/
├── 04 Research/
│   ├── bibliography/             ← YOUR sources (you provide)
│   │   ├── current.rdf           ← Zotero RDF export (canonical reference metadata)
│   │   └── PDF/                  ← source PDFs (Jackie verifies paraphrases against these)
│   ├── references_wiki/          ← Jackie compresses bibliography/PDF → here
│   │   ├── index.md              ← one row per source (id · citation · tier · DOI · link)
│   │   └── glossary/             ← one <source-id>.md per source (so FQA never re-reads PDFs)
│   └── elicit/                   ← deep-research round-trip (human-in-the-loop)
│       ├── elicit-prompt.md      ← generated query — you run it in Elicit
│       ├── report/               ← you drop the Elicit export here
│       └── elicit-findings.md    ← Jackie's extraction → folded into references_wiki
├── 05 Outline/
├── 06 Drafting/                  ← working draft area (flat; latest working copy)
├── 07 QA/                        ← working FQA area (flat; latest working copy)
│
├── runs/                         ← VERSION CONTROL (git-style snapshots, one per FQA loop)
│   ├── CHANGELOG.md              ← rolling history, one row per version (newest first)
│   ├── v001/                     ← draft + fqa-report + fqa-score.json + version-lock.md + discussion-delta
│   │     └── version-lock.md     ← WHAT CHANGED vs the previous version (the version lock)
│   ├── v002/
│   └── v003/
│
├── 08 Final/                     ← the ACCEPTED run, polished + submission-ready
│   └── submission.docx
│
├── discussion.md                 ← cross-version decision log (Egbert's binding calls)
├── status.html                   ← live auto-loop dashboard (self-refreshing; written each iteration)
├── status.json                   ← data behind status.html (orchestrator-written)
├── cost-report.html              ← Baerbel cost report (/fabrik-cost)
└── project-state.json            ← status + passThreshold + currentVersion + budget {cap, warnAt, spent}
```

## Auto-orchestrator & budget

Run loops with **`/fabrik-run <project>`** (one iteration; `--auto` for the bounded loop). Every project
has a `budget` block in `project-state.json` (default **€15 cap, warn 80%**). The orchestrator logs cost
per iteration into the Baerbel ledger and **stops** on: gate passed · budget cap · maxLoops · no-progress.
`status.html` shows it live. See the repo CLAUDE.md "Operating Manual" and
`framework/templates/essay-fabrik/LOOPS.md`.

## Rules

- **Inputs are read-only-ish.** Raw material lives in `00 Input/` and is never overwritten by agents.
- **Phase folders (`01`–`08`) hold the *latest working copy*** of that phase's output as `result.md`
  (a PostToolUse hook auto-generates `result.pdf`).
- **`runs/vNNN/` is the version history.** Every FQA-loop iteration is snapshotted here as a complete,
  immutable bundle: the draft, its `fqa-report`, `fqa-score.json` (weighted score + per-criterion
  breakdown + loopCount), a **`version-lock.md`** (what changed vs the parent version + score delta),
  and that loop's `discussion-delta.md`. Think of each `vNNN/` as a commit, with `version-lock.md` as
  its commit message. `runs/CHANGELOG.md` is the rolling `git log`.
- **`08 Final/` is the accepted version**, copied from the winning `runs/vNNN/` and polished for
  submission. It is the "merged to main" of the project.
- **`discussion.md`** accumulates Egbert's trade-off decisions across all loops (the project's
  decision log). Each entry references the `vNNN` it belongs to.

## Versioning = how it works

1. Drafting/QA produce a working draft in `06 Drafting/` and `07 QA/`.
2. When the FQA loop runs, praktikant snapshots the draft + reports into the next `runs/vNNN/`, and the
   coordinator writes `version-lock.md` (what changed vs the parent) + prepends a `CHANGELOG.md` row.
3. Christoph writes `fqa-score.json`; if `fqaScore >= passThreshold` → polish into `08 Final/`.
   Otherwise Egbert logs the trade-offs (discussion.md), the team revises, and a new `vNNN/` is cut.
4. `project-state.json.project.currentVersion` always points at the latest run.
