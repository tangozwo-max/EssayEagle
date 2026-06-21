# runs/ — version control (git-style)

Each `vNNN/` is one FQA-loop iteration, snapshotted as an immutable bundle. Think of it as a commit.

```
runs/
  CHANGELOG.md              ← rolling history, one line per version, newest first
  v001/
    draft.docx              ← the draft as it was this loop
    fqa-report.md / .html   ← the full FQA report for this loop
    fqa-score.json          ← weighted fqaScore (0-100) + per-criterion breakdown + loopCount
    version-lock.md         ← WHAT CHANGED vs the previous version (the version lock)
    discussion-delta.md     ← the trade-off decisions made for THIS loop (also appended to ../discussion.md)
  v002/
  v003/
```

## Conventions

- **Folder name:** zero-padded, `v001`, `v002`, … (never `v1`, `V16`, `draft5_1` — those caused the mess).
- **Immutable:** once a `vNNN/` is written, don't edit it. The next iteration is a new folder.
- **The accepted run** (first `fqaScore >= passThreshold`, or the best at `maxLoops`) is copied and
  polished into `../08 Final/`. Record which `vNNN` was accepted in `project-state.json.currentVersion`.
- **fqa-score.json shape:**
  ```json
  { "version": "v003", "fqaScore": 83, "passThreshold": 83, "loopCount": 3,
    "criteria": { "KU": 78, "AE": 85, "CR": 80 }, "accepted": true }
  ```

## Version lock (`version-lock.md`) — what changed vs the previous version

Every `vNNN/` is locked with a `version-lock.md`: a concrete record of **what changed relative to the
parent version, and why**. This is the changelog/commit-message of the version. Authored by the
coordinator (Pascal/Egbert) when the version is cut, from the actual changes the agents made that loop.

```markdown
# Version Lock — v003

- **Cut:** 2026-06-04
- **Parent:** v002
- **Phase / loop:** fqa
- **Score:** fqaScore 80 → 83  (Δ +3, target 83)
- **Status:** accepted | iterating | blocked-budget | escalated
- **Cost:** this version €X.XX · cumulative €Y.YY / €15

## Changed vs v002
| # | Change | Where | Addresses |
|---|--------|-------|-----------|
| 1 | Rebuilt reference slides so bibliography == in-text citations | slides 14–16 | FQA P1 (ref mismatch) |
| 2 | Added counter-argument on inflammatory pathway | Ch.3 | criticality gap (A&E) |

## Carried over unchanged
- Intro, methods (no change since v002)

## Still open
- (none) / list remaining P1/P2
```

## `CHANGELOG.md` (rolling, newest first)

```markdown
# Version History

| Version | Date | Score | Δ vs prev | Status | Headline change |
|---------|------|-------|-----------|--------|-----------------|
| v003 | 2026-06-04 | 83 | +3 | accepted | reference slides rebuilt; Ch.3 counter-argument |
| v002 | 2026-06-03 | 80 | +2 | iterating | tightened thesis; added 2 sources |
| v001 | 2026-06-01 | 78 | —  | baseline | first complete draft |
```

The orchestrator (`/fabrik-run`) writes `version-lock.md` and prepends the `CHANGELOG.md` row every
iteration, so the diff between any two versions is always one glance away.
