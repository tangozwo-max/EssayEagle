# EssayEagle — Structure & Workflow Guide

This is the **front door** for the whole project. Read this first — whether you are a
human (online on GitHub or offline in the app) or an AI assistant starting a new chat.

The goal of this document: you never start from scratch again. The pipeline, the folders,
the handovers, and "where we left off" are all defined here and in one machine-readable file.

---

## The big idea

Your university assignment moves through **3 phases** grouping **12 workflows**. Each workflow
produces an **output document** that becomes the **input** of the next workflow. At the **end of
each phase**, a **handover document** bundles the documents passed to the next phase, and the
project's **status advances** to that next phase. You can always **go back a phase and redo** it.

```
PREPARATION           CREATION                    FINALISATION
1 setup           →   4 research        ⇄     →   9  quality-assessment  ⇄
2 curriculum      →   5 outline         ⇄     →   10 finalisation
3 brainstorming   →   6 drafting        ⇄     →   11 submission-prep
                      7 revision        ⇄         12 retrospective
                      8 illustration (opt)
   │ handover            │ handover                    │ handover
   └─→ _handover/1-preparation.md ─→ _handover/2-creation.md ─→ _handover/3-finalisation.md
```

Numbers are **pipeline order**, not folder numbers. **Preparation runs setup → curriculum →
brainstorming** (map the module first, then brainstorm a topic within it), so the folders
`02 Brainstorming` / `03 Curriculum` are visited in reverse. `⇄` marks the quality-gated loops
(research, outline, drafting, and the quality-assessment ↔ revision FQA loop).

The **single source of truth** for this pipeline is
[`structure/workflow-map.json`](structure/workflow-map.json). The app GUI and any AI chat
should follow it. (Today the app code uses a few inconsistent ids — see *Known gaps* below.)

---

## Where everything lives

```
EssayEagle/
├── STRUCTURE.md                 ← you are here (the front door)
├── AGENTS.md                    ← instructions for AI chats (read the map, then resume)
├── structure/
│   ├── workflow-map.json        ← SINGLE SOURCE OF TRUTH: phases, workflows, ids, layout
│   ├── handover-template.md     ← copy this to write a phase/workflow handover
│   └── project-state.template.json
├── 01 projects/
│   ├── README.md                ← how to position & resume a project
│   ├── _template/               ← copy this to start a new module
│   └── <moduleX>/               ← one folder per assignment (see layout below)
└── gui/                         ← the Next.js app (offline + online)
```

### A single project (one assignment)

```
01 projects/<moduleX>/
├── PROJECT.md            ← human dashboard: where we are, what's next
├── project-state.json    ← machine status + resume pointer (currentPhase / currentWorkflow)
├── 00 Input/             ← assignment_brief, grading_rubric, referencing style, curriculum, previous_assignments
├── 01 Setup/             → result.md   (Assessment Summary)        [prep 1]
├── 03 Curriculum/        → result.md   (theory map)                [prep 2]
├── 02 Brainstorming/     → result.md   (topic + thesis)            [prep 3]
├── 04 Research/          → result.md   (source database + references_wiki/)
├── 05 Outline/           → result.md   (detailed outline)
├── 06 Drafting/          → result.md   (draft)
│   ├── revision/         → result.md   (revised draft; snapshots → runs/vNNN)
│   └── illustrations/    → result.md   (figures, optional)
├── 07 QA/                → result.md   (FQA report)
├── 08 Final/             → result.md   (final document)
│   ├── submission/       → result.md   (cover sheet, authenticity, filename)
│   └── retrospective/    → result.md   (cost analysis + lessons)
├── runs/                 ← immutable vNNN snapshots of each FQA-loop iteration
└── _handover/
    ├── 1-preparation.md   (setup · curriculum · brainstorming)
    ├── 2-creation.md      (research · outline · drafting · revision · illustration)
    └── 3-finalisation.md  (quality-assessment · finalisation · submission-prep · retrospective)
```

**Convention:** every workflow writes its deliverable to `<folder>/result.md`. That file is the
handover into the *next workflow*. The `_handover/` files are the heavier **phase-level**
packages — read them online to see exactly what was passed forward.

---

## Status model

- **Project:** `setup` → `active` → `submitted` → `archived`
- **Phase:** `not-started` → `in-progress` → `completed`
- **Workflow:** `locked` (upstream not done) → `ready` (inputs available) → `in-progress` → `completed`

The project's `currentPhase` + `currentWorkflow` (in `project-state.json`) is the pointer to
**where you left off**.

---

## How to... (the three things you asked for)

### Position a new project (a new module)
1. Copy `01 projects/_template/` to `01 projects/<your-module-id>/`.
2. Drop the assignment files into `00 Input/`.
3. Edit `project-state.json` (name, module, part) — `currentWorkflow` starts at `setup`.
That's it. The project now shows up and has its full phase skeleton.

### Resume where we left off
1. Open `project-state.json` → read `currentPhase` + `currentWorkflow`.
2. Read that workflow's **input** = the previous workflow's `result.md`.
3. Read the latest file in `_handover/` for the phase context.
`PROJECT.md` is the human-readable mirror of all this — start there if you're online.

### Go back a phase and redo
1. Set `currentPhase` to the earlier phase and its workflows back to `ready`/`in-progress`.
2. Set later phases' workflows to `locked`.
3. Keep the old outputs; write new `result.md` files to supersede them.
4. Note the reason under **Revisions** in that phase's `_handover/` file.

---

## Hand off between phases / workflows

- **Workflow → workflow (same phase):** the upstream `result.md` *is* the handover.
- **Phase → phase:** write `_handover/<n>-<phase>.md` from
  [`structure/handover-template.md`](structure/handover-template.md). It lists the document
  set passed forward, decisions to respect, open questions, and "do not redo". Then advance
  the status. These markdown files are readable on GitHub when you're online.

---

## Workspace menu — the app's 4 phases

The live app workspace (`/projects/[id]`) groups its menu items into **4 phases**, defined
centrally in [`gui/src/config/menu.json`](gui/src/config/menu.json). Edit that file to rename
phases or move menu items between them — **no code changes** needed for reassigning existing
items. Only adding a brand-new item needs a renderer entry in `gui/src/lib/menu.tsx`. It's
plain config bundled at build, so it works online with **no database**.

```
01 Startup      → Startup
02 Brainstorming → Brainstorming & Outline · Curriculum
03 Creation     → Bibliography
04 Finalization → Finalisation
```

(Note: this is the **app's navigation**. The document/handover pipeline in
`structure/workflow-map.json` — folders `01 Setup … 08 Final`, `result.md`, `_handover/` — is
a separate, file-level concern used for driving project content and the read-only dashboard.)

---

## Online use

Two ways to work online:

1. **Claude Code with repo access (primary).** Edit the project markdown directly to drive the
   assignment forward, review, and leave feedback. See the runbook in
   [`AGENTS.md`](AGENTS.md) → *Driving a project online*. The repo is the source of truth.
2. **The Vercel app (read-only dashboard).** Lists projects, statuses, and handover/result
   docs. It reads a build-time snapshot (`gui/src/data/projects-snapshot.json`), so after
   changing project markdown run `cd gui && pnpm snapshot` and commit it. Creating/editing in
   the deployed app is disabled (`501`) — all editing happens in the repo.

## Status of this work

- ✅ Structure layer: this guide, the canonical map, templates, project scaffold.
- ✅ **12 workflows grouped into 3 phases** (preparation / creation / finalisation), with the
  full local pipeline (`revision`, `submission-prep`, `retrospective`) folded back in.
- ✅ App aligned to the single source of truth (`gui/src/lib/workflow-map.ts`); the old
  conflicting ids (`curriculum-mapping`, `fqa`, `final`) resolve via `aliases`.
- ✅ Every `project-state.json` migrated to the canonical 12-workflow schema with all progress
  preserved (`currentVersion`, `openP1`, budget, …); per-workflow statuses derived from
  `currentWorkflow` position (**provisional — verify per project**).
- ✅ Read-only online dashboard via the snapshot fallback.

Remaining clean-ups (optional): unify the two mirrored maps
(`structure/workflow-map.json` ↔ `gui/src/lib/workflow-map.ts`) via a generator; fill in the
per-project `_handover/` docs from real phase content.
