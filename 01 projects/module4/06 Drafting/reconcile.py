import re, sys, ast
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RIS = r"C:\Users\tango\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4\04 Research\bibliography\Module 4B FULL.ris"

# ---- parse RIS into doi -> fields ----
txt = open(RIS, encoding="utf-8", errors="replace").read()
recs = re.split(r"\nER\s*-\s*", txt)
by_doi = {}
def g(rec, tag):
    m = re.search(r"\n%s\s+-\s*(.+)" % tag, rec)
    return m.group(1).strip() if m else ""
for rec in recs:
    doi = g(rec, "DO").lower().strip()
    if not doi:
        # some RIS put doi in L3 or M3
        m = re.search(r"\n(?:L3|M3)\s+-\s*(10\.\S+)", rec)
        doi = m.group(1).lower().strip() if m else ""
    if not doi:
        continue
    py = g(rec, "PY") or g(rec, "Y1")[:4]
    by_doi[doi] = {
        "py": py[:4], "vl": g(rec, "VL"), "is": g(rec, "IS"),
        "sp": g(rec, "SP"), "ep": g(rec, "EP"), "ti": g(rec, "TI")[:55],
    }

# ---- parse essay refs ----
src = open("make_essay.py", encoding="utf-8").read()
tree = ast.parse(src)
refs = []
for n in ast.walk(tree):
    if isinstance(n, ast.Assign):
        for t in n.targets:
            if isinstance(t, ast.Name) and t.id == "refs":
                refs = ast.literal_eval(n.value)

def clean(s):
    return (s.replace("&#8211;", "-").replace("&#8217;", "'").replace("&amp;", "&")
             .replace("&#241;", "n").replace("&#214;", "O"))

print(f"RIS records with DOI: {len(by_doi)} | essay refs: {len(refs)}\n")
miss, mismatch, ok = [], [], 0
for r in refs:
    r = clean(r)
    dm = re.search(r"DOI:\s*(10\.\S+)", r)
    if not dm:
        print("NO DOI in essay ref:", r[:60]); continue
    doi = dm.group(1).lower().strip().rstrip(".")
    yr = re.search(r"\((\d{4})\)", r)
    eyear = yr.group(1) if yr else "?"
    surname = re.match(r"([A-Za-z'-]+)", r).group(1)
    z = by_doi.get(doi)
    if not z:
        miss.append((surname, eyear, doi)); continue
    # compare year + (vol/pages if essay states them)
    notes = []
    if z["py"] and z["py"] != eyear:
        notes.append(f"YEAR essay {eyear} -> Zotero {z['py']}")
    evol = re.search(r"</i>,\s*(\d+)\s*(?:\((\d+)\))?", clean(r))  # vol(issue) after journal
    if evol and z["vl"]:
        if evol.group(1) != z["vl"]:
            notes.append(f"VOL essay {evol.group(1)} -> Zotero {z['vl']}")
    epg = re.search(r"pp?\.\s*(\d+)\s*-\s*(\d+)", r)
    if epg and z["sp"]:
        if epg.group(1) != z["sp"] or (z["ep"] and epg.group(2) != z["ep"]):
            notes.append(f"PAGES essay {epg.group(1)}-{epg.group(2)} -> Zotero {z['sp']}-{z['ep']}")
    if notes:
        mismatch.append((surname, eyear, notes))
    else:
        ok += 1

print(f"MATCHED OK: {ok}")
print(f"\nMISMATCHES ({len(mismatch)}):")
for s, y, ns in mismatch:
    print(f"  {s} ({y}): " + "; ".join(ns))
print(f"\nNOT FOUND IN ZOTERO ({len(miss)}):")
for s, y, d in miss:
    print(f"  {s} ({y}) doi={d}")
