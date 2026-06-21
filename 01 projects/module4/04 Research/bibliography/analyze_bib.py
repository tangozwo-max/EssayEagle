import re, os, glob, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = r"C:\Users\tango\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4\04 Research"
RIS = os.path.join(BASE, "bibliography", "Module 4B FULL.ris")
GLOS = os.path.join(BASE, "references_wiki", "glossary")
PDFDIR = os.path.join(BASE, "bibliography", "pdf")

# ---- RIS ----
txt = open(RIS, encoding="utf-8", errors="replace").read()
recs = [r for r in re.split(r"\nER\s*-\s*", txt) if "TY  -" in r]
def f(rec, tag):
    m = re.search(r"\n%s\s+-\s*(.+)" % tag, rec); return m.group(1).strip() if m else ""
ris = []
for r in recs:
    au = re.search(r"\nAU\s+-\s*([^,\n]+)", r)
    ris.append({
        "sur": (au.group(1).strip() if au else "?"),
        "py": (f(r,"PY") or f(r,"Y1"))[:4],
        "doi": f(r,"DO").lower().rstrip("."),
        "ti": f(r,"TI"),
        "ty": f(r,"TY"),
        "vl": f(r,"VL"), "sp": f(r,"SP"),
    })

# ---- wiki cards ----
cards = glob.glob(os.path.join(GLOS, "*.md"))
card_doi = {}
for c in cards:
    t = open(c, encoding="utf-8", errors="replace").read()
    m = re.search(r"\*\*DOI:\*\*\s*(\S+)", t)
    d = (m.group(1).lower().rstrip(".") if m else "")
    card_doi[os.path.basename(c)[:-3]] = d if d.startswith("10.") else ""

# ---- PDFs ----
pdfs = [os.path.basename(p) for p in glob.glob(os.path.join(PDFDIR, "*.pdf"))]
pdf_sur = {}
for p in pdfs:
    s = re.match(r"!?([A-Za-z-]+)", p)
    pdf_sur.setdefault(s.group(1).lower() if s else "?", []).append(p)
abstract_pdfs = [p for p in pdfs if "ABSTRACT" in p.upper() or "IMAGE" in p.upper()]

# ---- metrics ----
dois = [x["doi"] for x in ris if x["doi"]]
uniq = set(dois)
dups = sorted({d for d in dois if dois.count(d) > 1})
card_dois = {d for d in card_doi.values() if d}

ris_no_wiki = [x for x in ris if x["doi"] and x["doi"] not in card_dois]
wiki_no_ris = [k for k,d in card_doi.items() if d and d not in uniq]
def has_pdf(x):
    return x["sur"].lower() in pdf_sur
ris_no_pdf = [x for x in ris if not has_pdf(x)]
missing_volpp = [x for x in ris if x["ty"]=="JOUR" and (not x["vl"] or not x["sp"])]
old = [x for x in ris if x["py"].isdigit() and int(x["py"]) < 2015]

def tier(x):
    t = (x["ti"] or "").lower()
    if x["ty"] in ("BOOK","CHAP"): return "Theory/Book"
    if "meta-analysis" in t or "systematic review" in t or "network meta" in t or "umbrella" in t: return "SR/Meta"
    if "randomi" in t or "randomised" in t or "trial" in t or "noninferiority" in t: return "RCT/Experimental"
    if "cohort" in t or "longitudinal" in t or "trajector" in t or "incidence" in t or "registry" in t or "birth cohort" in t: return "Observational/Longitudinal"
    if "qualitative" in t: return "Qualitative"
    return "Other/Review"
from collections import Counter
tiers = Counter(tier(x) for x in ris)

print("=== COUNTS ===")
print("RIS records:", len(ris), "| unique DOIs:", len(uniq), "| no-DOI records:", sum(1 for x in ris if not x['doi']))
print("Wiki cards:", len(cards), "| with DOI:", len(card_dois))
print("PDFs:", len(pdfs), "| abstract/image-only:", len(abstract_pdfs))
print()
print("=== COVERAGE ===")
print("RIS unique with a wiki card (by DOI):", len(uniq & card_dois), "/", len(uniq), "= %.0f%%" % (100*len(uniq&card_dois)/len(uniq)))
print("RIS records with a PDF (by surname):", sum(1 for x in ris if has_pdf(x)), "/", len(ris), "= %.0f%%" % (100*sum(1 for x in ris if has_pdf(x))/len(ris)))
print()
print("DUPLICATE DOIs in RIS:", len(dups))
for d in dups: print("   ", d)
print("MISSING VOL/PP (JOUR):", len(missing_volpp))
print("PRE-2015 sources:", len(old))
print()
print("=== TIER DISTRIBUTION ===")
for k,v in tiers.most_common(): print(f"   {k}: {v}")
print()
print("=== RIS records with NO matching PDF (missing PDFs) ===", len(ris_no_pdf))
for x in sorted(ris_no_pdf, key=lambda z:z['sur']):
    print(f"   {x['sur']} {x['py']} | {x['ti'][:60]} | doi={x['doi'] or 'none'}")
print()
print("=== RIS records with NO wiki card (by DOI) ===", len(ris_no_wiki))
for x in sorted(ris_no_wiki, key=lambda z:z['sur']):
    print(f"   {x['sur']} {x['py']} | {x['ti'][:55]}")
print()
print("=== Wiki cards whose DOI is NOT in RIS ===", len(wiki_no_ris))
for k in sorted(wiki_no_ris): print("   ", k, "->", card_doi[k])
