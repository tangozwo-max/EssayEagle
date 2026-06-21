# 04 Research / bibliography — your sources (Zotero + PDFs)

This is where **you** provide the source material for the project.

```
04 Research/bibliography/
  current.rdf      ← your reference-manager export (Zotero RDF / RIS / BibTeX). Name it "current".
  PDF/             ← the source PDFs (one per reference)
```

| Item | Who | What |
|---|---|---|
| `current.*` (`.rdf`, `.ris`, or `.bib`) | **you** | Zotero/Mendeley export. The canonical bibliography — authors, titles, journals, years, DOIs. If several are present, the one named `current.*` (or the newest) is authoritative. |
| `PDF/` | **you** | the full-text PDFs of the sources you want used/verified |

## What the team does with it
- **Jackie** reads the `.rdf` as the bibliography of record (correct Harvard-WMS metadata comes from here,
  not from guesses), and reads the PDFs in `PDF/` to build the token-efficient `references_wiki/` and to
  **verify each paraphrase against the actual text**.
- Until a source's PDF is present here, the reference check marks it **"not full-text verified"** — Jackie
  will not pretend a paraphrase fits a paper she cannot read.

Drop more PDFs into `PDF/` at any time and re-run the reference check; the verification status updates.
