import fitz, glob, os, re, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
PDFDIR = r"C:\Users\tango\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4\04 Research\bibliography\pdf"

# label : (filename-prefix, [keywords])  -- chronological order of first appearance in v013
SRC = [
 ("01 Liu 2025",            "Liu_et_al_2025",        ["leading","disabilit","incidence","anxiety"]),
 ("02 Cybulski 2021",       "Cybulski_et_al_2021",   ["incidence rate ratio","3.51","anxiety"]),
 ("03 Bie 2024",            "Bie_et_al_2024",        ["increase","52","incidence","2021"]),
 ("04 Broeren 2012",        "Broeren_et_al_2013",    ["trajector","persistent","stable"]),
 ("05 Tseliou 2024",        "Tseliou_et_al_2024",    ["persistent","decreasing","depression","self-harm"]),
 ("06 Morales-Munoz 2023",  "Morales-Munoz_et_al",   ["comorbid","substance","odds"]),
 ("07 Woodward 2001",       "Woodward_et_al_2001",   ["anxiety","depression","outcomes"]),
 ("08 Casey 2015",          "Casey_et_al_2015",      ["prefrontal","amygdala","mature","adolescen"]),
 ("09 Sisk 2019",           "Sisk",                  ["sensitive","plasticity","adolescen","experience"]),
 ("10 Kim 2017",            "Kim_2017",              ["extinction","childhood","fear"]),
 ("11 Ladouceur 2024",      "Ladouceur_2024",        ["normaliz","prefrontal","fronto","CBT"]),
 ("12 Zhou 2019",           "Zhou_et_al_2019",       ["group CBT","waitlist","waiting list","active"]),
 ("13 Sigurvinsdottir 2020","Sigurvinsdottir",       ["follow-up","maintained","modaliti"]),
 ("14 Guo 2021",            "Guo_et_al_2021",        ["individual","adolescent","group"]),
 ("15 Lebowitz 2020",       "Lebowitz_et_al_2020",   ["noninferior","accommodation","parent"]),
 ("16 Jewell 2022",         "Jewell_et_al_2022",     ["parent-only","waitlist","waiting list","active"]),
 ("17 Wang 2017",           "Wang_et_al_2017",       ["combination","SSRI","sertraline","CBT"]),
 ("18 Strawn 2022",         "Strawn_et_al_2022",     ["12 weeks","combination","weeks"]),
 ("19 Karawekpanyawong 2026","Karawekpanyawong",     ["suicidal","ideation","tolerab"]),
 ("20 Wergeland 2021",      "Wergeland_et_al_2020",  ["remission","routine","benchmark","trial"]),
 ("21 Ghafari 2022",        "Ghafari",               ["unmet","54","prevalence"]),
 ("22 Ball 2022",           "Ball_et_al_2022",       ["rejected","referral","18","31"]),
 ("23 Abel 2025",           "Abel_et_al_2025_Enhancing_Referrals_to_CAMHS_EN-CAMHS_article", ["unsuccessful","quarter","referral"]),
 ("24 Radez 2022",          "Radez_et_al_2021",      ["barrier","self-refer","adult","shame","normali"]),
 ("25 Ginsburg 2018",       "Ginsburg",              ["remission","relapse","stable"]),
 ("26 Krause 2024",         "Krause_et_al_2024",     ["remission","follow-up","booster","maintain"]),
 ("27 Waite 2014",          "Waite_Creswell_2014",   ["social anxiety","comorbid","school refusal","adolescent"]),
 ("28 Baker 2021",          "Baker_et_al_2021",      ["remission","36","adolescent"]),
 ("29 Xiang 2024",          "Xiang_et_al_2024",      ["incidence","increase","31"]),
 ("30 Bang 2025",           "Bang_2025",             ["girls","incidence","increase"]),
 ("31 Khetawat-Steele 2023","Khetawat",              ["FOMO","approval","fear of missing","digital stress"]),
 ("32 Skinner 2022",        "Skinner_et_al_2022",    ["masked","incidence","prevalence","offset","access"]),
 ("33 Patton 2021",         "Patton_et_al_2021",     ["population","treatment","alcohol","risk factor"]),
 ("34 Nordh 2021",          "Nordh_et_al_2021",      ["guided","supportive","superior","internet"]),
 ("35 Kaajalaakso 2025",    "Kaajalaakso_et_al_2025",["dropout","alliance","predict"]),
 ("36 Creswell 2024",       "Creswell_et_al_2024",   ["non-inferior","usual care","cost","therapist"]),
 ("37 Dunn 2024",           "Dunn_et_al_2024",       ["anxious parent","prevent","child anxiety"]),
 ("38 Schleider 2025",      "Schleider",             ["single-session","anxiety","effect"]),
 ("39 Teesson 2024",        "Teesson_et_al_2024",    ["no","follow-up","72","difference"]),
 ("40 Grummitt 2025",       "Grummitt_et_al_2025",   ["anxiety","underpowered","months","3-month"]),
 ("41 Skinner 2023",        "Skinner_et_al_2023",    ["indicated","universal","prevention","prevalence"]),
 ("42 Hugh-Jones 2019",     "Hugh-Jones",            ["indicated","targeted","consistent","effect"]),
 ("43 Mei 2024",            "Mei_et_al_2024",        ["insomnia","SMD","sleep","improve"]),
 ("44 Park 2025",           "Park_et_al_2025",       ["acceptability","trial","chatbot","conversational"]),
 ("45 Baschab 2026",        "Baschab_et_al_2026",    ["active control","pre-post","large","VR"]),
 ("46 Sebastian 2021",      "Sebastian_et_al_2021",  ["active ingredient","mechanism"]),
]

def sentences(txt):
    txt = re.sub(r"\s+"," ", txt)
    return re.split(r"(?<=[.;])\s+(?=[A-Z(])", txt)

for label, pref, kws in SRC:
    matches = glob.glob(os.path.join(PDFDIR, pref + "*.pdf"))
    matches = [m for m in matches if not m.lower().endswith(".docx")]
    print("\n" + "="*70)
    if not matches:
        print(f"{label}: NO PDF (prefix {pref})"); continue
    pdf = matches[0]
    try:
        d = fitz.open(pdf); full = "".join(p.get_text() for p in d)
    except Exception as e:
        print(f"{label}: ERR {e}"); continue
    if len(full.strip()) < 80:
        print(f"{label}: IMAGE-ONLY / no text layer ({os.path.basename(pdf)})"); continue
    sents = sentences(full)
    scored = []
    for s in sents:
        sl = s.lower(); sc = sum(sl.count(k.lower()) for k in kws)
        if sc and 40 < len(s) < 320:
            if re.search(r"\d", s): sc += 0.5
            scored.append((sc, s.strip()))
    scored.sort(key=lambda x:-x[0])
    print(f"{label}  [{os.path.basename(pdf)}]")
    for sc, s in scored[:2]:
        print("   »", s)
    if not scored:
        print("   (no keyword hit — manual review)")
