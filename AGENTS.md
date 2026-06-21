# Instructions for AI assistants (new chats start here)

You are working in **EssayEagle**, a tool that guides a university assignment from brief to
submission through **3 phases of workflows**. The point of this file: **do not start from
scratch.** The structure is already defined — load it, find where the user left off, continue.

## Do this first, every session

1. Read [`STRUCTURE.md`](STRUCTURE.md) — the human guide to phases, workflows, handovers, resume.
2. Read [`structure/workflow-map.json`](structure/workflow-map.json) — the **single source of
   truth** for phase/workflow ids, order, folders, and the status model. Follow it. When the
   app code uses a different id, map it via each workflow's `aliases`.
3. If working on a specific project, read its `project-state.json` (`currentPhase` +
   `currentWorkflow`) and its `PROJECT.md` to resume exactly where work stopped.

## Core rules

- **Canonical ids** come from `workflow-map.json` (mirrored in `gui/src/lib/workflow-map.ts`),
  not from memory. The app's `types.ts`, `team.ts`, and the `phase-result` route all derive
  from it; older ids (`curriculum-mapping`, `fqa`, `final`) still resolve via `aliases`.
- **Each workflow writes `<folder>/result.md`.** That is its handover into the next workflow.
- **At a phase boundary**, write `_handover/<n>-<phase>.md` from
  `structure/handover-template.md`, then advance `currentPhase`/`currentWorkflow` and the
  workflow statuses in `project-state.json`.
- **Going back a phase is allowed.** Re-open the earlier phase, lock later phases, keep old
  outputs, record the reason under *Revisions* in the handover file.
- Keep handover files short and link to documents rather than pasting them — they are read
  online on GitHub.

## Driving a project online (Claude Code with repo access)

This is the primary online workflow: you edit the project markdown directly to move the
assignment forward, review work, and leave feedback. A typical loop:

1. **Resume.** Read `01 projects/<module>/project-state.json` → `currentWorkflow`, and that
   workflow's input (the previous workflow's `result.md`). `PROJECT.md` is the quick summary.
2. **Do the work** for the current workflow (research, outline, draft, review, …). Write the
   deliverable to the workflow's `<folder>/result.md`. For review/feedback, write a
   `<folder>/feedback.md` next to it.
3. **Advance.** When a workflow is done, set its status to `completed` and the next to `ready`
   in `project-state.json`; update the `PROJECT.md` table. At a phase boundary also write the
   `_handover/<n>-<phase>.md` and move `currentPhase`/`currentWorkflow` forward.
4. **Refresh the online viewer.** If you changed any project markdown or state, run
   `cd gui && pnpm snapshot` (regenerates `gui/src/data/projects-snapshot.json`) so the
   read-only Vercel dashboard reflects the change.
5. **Commit & push.** The repo is the source of truth — commit the project files (and the
   refreshed snapshot) so the next online session resumes cleanly.

The Vercel app is a **read-only dashboard** of this data (list, status, handover/result docs).
Creating or editing projects in the deployed app is intentionally disabled (`501`) — all
editing happens here in the repo.

## The app (`gui/`)

It is a Next.js app. `gui/AGENTS.md` has framework-specific rules (this Next.js version differs
from training data — read `node_modules/next/dist/docs/` before writing app code). The active
source tree is `gui/src/`; `gui/src_v1/` is an old snapshot.
