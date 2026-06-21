# 04 Research / elicit — deep research round-trip (human-in-the-loop)

Elicit (elicit.com) does AI-assisted systematic literature search. The system can't call Elicit, so it's
a **round-trip with you**:

```
Jackie writes  →  elicit-prompt.md      (a ready-to-paste query, from the chapter-questions/gaps)
        ↓
   YOU run it in Elicit, export the report (PDF/CSV/MD)  →  drop it in  report/
        ↓
Jackie ingests →  elicit-findings.md     (structured extraction) + references_wiki (tagged source: elicit)
        ↓
   Drafting cites from references_wiki + elicit-findings.md
```

## Files
| File | Who | What |
|---|---|---|
| `elicit-prompt.md` | generated (Jackie) | the query to paste into Elicit — one research question per chapter-gap, with filters + columns |
| `report/` | **you** | drop the Elicit export here (any format) |
| `elicit-findings.md` | generated (Jackie) | per-source extraction (citation, tier, key finding, which chapter-question it answers) |

## How it runs
During the **research loop**, once the skeleton's chapter-questions exist, the orchestrator writes
`elicit-prompt.md` and **pauses** (`/fabrik-run` status `awaiting-elicit`). Run the query, drop the
report in `report/`, then continue — Jackie folds the findings into the references_wiki and drafting
uses them. Every Elicit source is still critically appraised (tier/quality) like any other.
