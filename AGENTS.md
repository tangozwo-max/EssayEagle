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

- **Canonical ids** come from `workflow-map.json`, not from memory and not from any single
  source file. The three code locations (`gui/src/lib/types.ts`, `gui/src/lib/team.ts`,
  `gui/src/app/api/projects/[id]/phase-result/route.ts`) currently disagree — the map reconciles them.
- **Each workflow writes `<folder>/result.md`.** That is its handover into the next workflow.
- **At a phase boundary**, write `_handover/<n>-<phase>.md` from
  `structure/handover-template.md`, then advance `currentPhase`/`currentWorkflow` and the
  workflow statuses in `project-state.json`.
- **Going back a phase is allowed.** Re-open the earlier phase, lock later phases, keep old
  outputs, record the reason under *Revisions* in the handover file.
- Keep handover files short and link to documents rather than pasting them — they are read
  online on GitHub.

## The app (`gui/`)

It is a Next.js app. `gui/AGENTS.md` has framework-specific rules (this Next.js version differs
from training data — read `node_modules/next/dist/docs/` before writing app code). The active
source tree is `gui/src/`; `gui/src_v1/` is an old snapshot.
