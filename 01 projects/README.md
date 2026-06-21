# 01 projects — your assignments

One folder per university assignment (a "module"). Each folder is a self-contained project
that moves through the 3-phase pipeline. Full rules: [`/STRUCTURE.md`](../STRUCTURE.md).

## Start a new project (position a module)
1. Copy `_template/` → `<your-module-id>/` (e.g. `module6partb`).
2. Put the assignment files into `00 Input/` (see `00 Input/README.md`).
3. Edit `project-state.json`: `name`, `module`, `part`. It starts at phase `preparation`,
   workflow `setup`.
4. Open `PROJECT.md` — that's your live dashboard.

## Resume a project
Open `project-state.json` → `currentPhase` + `currentWorkflow`, then read that workflow's
input (the previous workflow's `result.md`). `PROJECT.md` is the readable summary.

## Each project folder
```
<module>/
├── PROJECT.md            dashboard / where we left off
├── project-state.json    machine status + resume pointer
├── 00 Input/             assignment brief, rubric, style, curriculum, previous work
├── 01 Setup/ … 08 Final/ one folder per workflow, each ends in result.md
└── _handover/            1-preparation.md · 2-creation.md · 3-finalisation.md
```

## Existing projects
`module4`, `module4parta`, `module5parta`, `module5partb` predate this structure — they
currently hold only `04 Research/references_wiki/`. To bring one up to standard, copy the
missing scaffold folders and add a `project-state.json` + `PROJECT.md` from `_template/`.
