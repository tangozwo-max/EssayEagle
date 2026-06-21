import re, sys, ast
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

src = open("make_essay.py", encoding="utf-8").read()
tree = ast.parse(src)

# Collect body text (P + BODY paragraphs) and the refs list
body = []
refs = []
for n in ast.walk(tree):
    if isinstance(n, ast.Call) and isinstance(n.func, ast.Name):
        if n.func.id == "P" and n.args:
            try: body.append(ast.literal_eval(n.args[0]))
            except: pass
    if isinstance(n, ast.Assign):
        for t in n.targets:
            if isinstance(t, ast.Name) and t.id == "refs":
                try: refs = ast.literal_eval(n.value)
                except: pass

bodytext = " ".join(body)
bodytext = re.sub(r"<[^>]+>", "", bodytext)
bodytext = bodytext.replace("&#241;", "n").replace("&#8211;", "-").replace("&#8217;", "'").replace("&#8212;", "-").replace("&amp;", "&")

# in-text citations: Surname et al., 2020 / Surname and Surname, 2020 / Surname, 2020
cites = set()
for m in re.finditer(r"([A-Z][A-Za-z'-]+)(?:\s+(?:et al\.|and\s+[A-Z][A-Za-z'-]+|and Steele|and Romeo|and Fergusson|and Creswell)?)?,\s*(\d{4})", bodytext):
    cites.add((m.group(1), m.group(2)))

# ref surnames + year
refkeys = set()
for r in re.sub(r"<[^>]+>", "", " || ".join(refs)).replace("&#241;","n").split("||"):
    r = r.strip()
    mm = re.match(r"([A-Za-z'-]+)", r)
    yy = re.search(r"\((\d{4})\)", r)
    if mm and yy:
        refkeys.add((mm.group(1), yy.group(1)))

ref_surnames = {s for s,_ in refkeys}
cited_surnames = {s for s,_ in cites}

print("REF COUNT:", len(refs))
print("distinct in-text citation surnames:", len(cited_surnames))
print()
ghosts = sorted(s for s in cited_surnames if s not in ref_surnames)
orphans = sorted(s for s in ref_surnames if s not in cited_surnames)
print("GHOSTS (cited, no ref):", ghosts if ghosts else "none")
print("ORPHANS (ref, not cited):", orphans if orphans else "none")
