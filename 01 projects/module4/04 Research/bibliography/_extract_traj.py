# -*- coding: utf-8 -*-
import fitz, re, sys

def text(path):
    d=fitz.open(path)
    return "\n".join(p.get_text("text") for p in d)

def show(label, t, patterns, ctx=90, limit=40):
    print("\n=========", label, "=========")
    seen=set(); n=0
    for pat in patterns:
        for m in re.finditer(pat, t, re.I):
            a=max(0,m.start()-ctx); b=min(len(t),m.end()+ctx)
            snip=re.sub(r"\s+"," ",t[a:b]).strip()
            if snip in seen: continue
            seen.add(snip); n+=1
            if n>limit: return
            print(" …",snip)

TS="pdf/Tseliou_et_al_2024_Trajectories_of_Emotional_Problems_Childhood_to_Adolescence.pdf"
BR="pdf/Broeren_et_al_2013_Course_of_Childhood_Anxiety_Symptoms_Developmental_Trajectories.pdf"

t=text(TS)
print("TSELIOU chars:", len(t))
show("TSELIOU — class sizes (% of sample)", t,
     [r"\b\d{1,2}(?:\.\d+)?\s*%", r"class\w*.{0,40}\d", r"trajector\w*.{0,60}\d", r"n\s*=\s*\d[\d,]+\s*\(\d"], ctx=80, limit=45)
show("TSELIOU — effect sizes (OR / CI)", t,
     [r"(?:aOR|OR|odds ratio|RR|HR)\s*[=:]?\s*\d", r"\d\.\d+\s*\(95\s*%?\s*CI", r"self-?harm.{0,80}\d", r"depress\w+.{0,80}\d", r"educ\w+.{0,80}\d|NEET"], ctx=90, limit=55)

print("\n\n##########################################")
b=text(BR)
print("BROEREN chars:", len(b))
show("BROEREN — trajectory classes & proportions", b,
     [r"\b\d{1,2}(?:\.\d+)?\s*%", r"class\w*.{0,40}\d", r"trajector\w*.{0,60}\d", r"n\s*=\s*\d", r"(high|persistent|stable|increas|decreas|low)\w*.{0,40}\d"], ctx=80, limit=50)
