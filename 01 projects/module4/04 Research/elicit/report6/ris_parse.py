import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

txt = open("Elicit - Sources.ris", encoding="utf-8", errors="replace").read()
# split records on ER
records = re.split(r'\nER\s*-\s*', txt)
out = []
for rec in records:
    au = re.findall(r'\nAU\s*-\s*(.+)', rec)
    a1 = re.search(r'(?:^|\n)AU\s*-\s*(.+)', rec)
    ti = re.search(r'\nTI\s*-\s*(.+)', rec)
    py = re.search(r'\n(?:PY|Y1)\s*-\s*(\d{4})', rec)
    do = re.search(r'\nDO\s*-\s*(.+)', rec)
    t2 = re.search(r'\n(?:T2|JO|JF)\s*-\s*(.+)', rec)
    if not ti: continue
    first = au[0].split(',')[0].strip() if au else "?"
    out.append({
        "first": first,
        "year": py.group(1) if py else "----",
        "doi": do.group(1).strip() if do else "NO-DOI",
        "jrnl": (t2.group(1).strip()[:38] if t2 else ""),
        "title": ti.group(1).strip()[:70],
    })
# sort by first author
out.sort(key=lambda r:(r["first"].lower(), r["year"]))
print(f"TOTAL RECORDS: {len(out)}\n")
for r in out:
    print(f'{r["first"]:<16} {r["year"]}  {r["doi"]:<34}  {r["jrnl"]:<38}  {r["title"]}')
