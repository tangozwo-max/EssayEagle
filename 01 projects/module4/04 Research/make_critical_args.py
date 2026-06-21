from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT = r"C:\Users\tango\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4\06_research\critical_arguments.pdf"

# ── Colour palette ─────────────────────────────────────────────────────────
NAVY   = colors.HexColor("#1B2A4A")
TEAL   = colors.HexColor("#2E7D8C")
GOLD   = colors.HexColor("#C9A84C")
LIGHT  = colors.HexColor("#F0F4F8")
MID    = colors.HexColor("#D0DCE8")
WHITE  = colors.white
DARK   = colors.HexColor("#2C2C2C")
MUTED  = colors.HexColor("#5A6A7A")

# ── Styles ──────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def style(name, parent="Normal", **kw):
    s = ParagraphStyle(name, parent=base[parent], **kw)
    return s

S_COVER_TITLE = style("CoverTitle", "Title",
    fontSize=26, textColor=WHITE, leading=32, spaceAfter=6,
    fontName="Helvetica-Bold", alignment=TA_CENTER)

S_COVER_SUB = style("CoverSub",
    fontSize=11, textColor=colors.HexColor("#BDD4E0"), leading=16,
    fontName="Helvetica", alignment=TA_CENTER, spaceAfter=4)

S_COVER_THESIS_LABEL = style("CoverThesisLabel",
    fontSize=8, textColor=GOLD, fontName="Helvetica-Bold",
    alignment=TA_CENTER, spaceAfter=4, spaceBefore=24)

S_COVER_THESIS = style("CoverThesis",
    fontSize=10, textColor=WHITE, leading=15, fontName="Helvetica-Oblique",
    alignment=TA_CENTER, spaceAfter=8)

S_ARG_HEADER = style("ArgHeader",
    fontSize=13, textColor=WHITE, fontName="Helvetica-Bold",
    leading=17, spaceAfter=0)

S_ARG_NUM = style("ArgNum",
    fontSize=22, textColor=GOLD, fontName="Helvetica-Bold",
    leading=24, spaceAfter=0)

S_SECTION_LABEL = style("SectionLabel",
    fontSize=7.5, textColor=TEAL, fontName="Helvetica-Bold",
    spaceBefore=10, spaceAfter=3, leading=10)

S_STUDY_ITEM = style("StudyItem",
    fontSize=8.5, textColor=DARK, fontName="Helvetica",
    leading=12, leftIndent=10, spaceAfter=2)

S_BODY = style("Body",
    fontSize=9.5, textColor=DARK, fontName="Helvetica",
    leading=14, spaceAfter=5, alignment=TA_JUSTIFY)

S_STEP = style("Step",
    fontSize=9.5, textColor=NAVY, fontName="Helvetica-Bold",
    leading=13, spaceAfter=2, leftIndent=8)

S_STEP_BODY = style("StepBody",
    fontSize=9.5, textColor=DARK, fontName="Helvetica",
    leading=14, spaceAfter=6, leftIndent=8, alignment=TA_JUSTIFY)

S_IMPLICATION = style("Implication",
    fontSize=9, textColor=colors.HexColor("#1A5C45"), fontName="Helvetica-Oblique",
    leading=13, leftIndent=10, spaceAfter=4, alignment=TA_JUSTIFY)

S_IMPL_LABEL = style("ImplLabel",
    fontSize=8, textColor=colors.HexColor("#1A5C45"), fontName="Helvetica-Bold",
    spaceBefore=6, spaceAfter=2, leading=10)

S_TOC_ITEM = style("TocItem",
    fontSize=9.5, textColor=DARK, fontName="Helvetica", leading=13, spaceAfter=3)

S_TOC_TITLE = style("TocTitle",
    fontSize=14, textColor=NAVY, fontName="Helvetica-Bold",
    spaceBefore=0, spaceAfter=10)

S_TABLE_HEADER = style("TableHeader",
    fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
    alignment=TA_CENTER, leading=10)

S_TABLE_CELL = style("TableCell",
    fontSize=8, textColor=DARK, fontName="Helvetica",
    alignment=TA_LEFT, leading=11)

S_TABLE_CELL_C = style("TableCellC",
    fontSize=8, textColor=DARK, fontName="Helvetica",
    alignment=TA_CENTER, leading=11)

S_FOOTER_LABEL = style("FooterLabel",
    fontSize=7, textColor=MUTED, fontName="Helvetica",
    alignment=TA_CENTER)

S_SCENARIO_HEAD = style("ScenHead",
    fontSize=9.5, textColor=TEAL, fontName="Helvetica-Bold",
    leading=13, spaceAfter=1, leftIndent=8)

# ── Page template with header/footer ────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Top accent bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 18, A4[0], 18, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, A4[1] - 21, A4[0], 3, fill=1, stroke=0)
    if doc.page > 1:
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(cm, A4[1] - 13, "Critical Cross-Study Arguments — Anxiety in Children & Adolescents")
        canvas.drawRightString(A4[0] - cm, A4[1] - 13, f"EssayFabrik S7 | April 2026")
    # Footer
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, A4[0], 18, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, 18, A4[0], 2, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 7)
    canvas.drawCentredString(A4[0] / 2, 6, f"Page {doc.page}")
    canvas.restoreState()

# ── Helpers ──────────────────────────────────────────────────────────────────
def hr(color=MID, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)

def spacer(h=0.3):
    return Spacer(1, h * cm)

def section_label(text):
    return Paragraph(text.upper(), S_SECTION_LABEL)

def body(text):
    return Paragraph(text, S_BODY)

def impl(text):
    return [
        Paragraph("Essay Implication", S_IMPL_LABEL),
        Paragraph(text, S_IMPLICATION),
    ]

def arg_block(num, title, studies, analysis_paragraphs, implication_text):
    """Returns a list of flowables for one argument."""
    items = []

    # Header box
    header_data = [[
        Paragraph(f"{num:02d}", S_ARG_NUM),
        Paragraph(title, S_ARG_HEADER),
    ]]
    header_table = Table(header_data, colWidths=[1.4*cm, 14.6*cm])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING",  (0, 0), (0, 0), 10),
        ("LEFTPADDING",  (1, 0), (1, 0), 6),
        ("RIGHTPADDING", (1, 0), (1, 0), 10),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
    ]))
    items.append(KeepTogether([header_table, spacer(0.25)]))

    # Studies
    items.append(section_label("Studies involved"))
    for s in studies:
        items.append(Paragraph(f"&#8226;  {s}", S_STUDY_ITEM))
    items.append(spacer(0.2))

    # Analysis
    items.append(hr())
    items.append(section_label("Analysis"))
    for p in analysis_paragraphs:
        if isinstance(p, tuple) and p[0] == "step":
            items.append(Paragraph(p[1], S_STEP))
            items.append(Paragraph(p[2], S_STEP_BODY))
        elif isinstance(p, tuple) and p[0] == "scenario":
            items.append(Paragraph(p[1], S_SCENARIO_HEAD))
            items.append(Paragraph(p[2], S_STEP_BODY))
        else:
            items.append(body(p))

    # Implication
    items.append(hr(TEAL, 0.75))
    items += impl(implication_text)
    items.append(spacer(0.5))
    return items


# ── Content ──────────────────────────────────────────────────────────────────
ARGUMENTS = [
    dict(
        num=1,
        title="The SPACE Paradox — Revolutionary Evidence from a Single Research Group",
        studies=[
            "SPACE-1: Lebowitz et al. (2019). Parent-Based Treatment as Efficacious as CBT for Childhood Anxiety. JAACAP. Yale / NIH-funded. n=124.",
            "SPACE-2: Shimshoni, Etkin & Lebowitz (2024). Parent-Only Treatment for Child Anxiety [Review]. Child & Adolescent Psychiatric Clinics.",
            "SPACE-3: Lebowitz et al. (2021). Moderators of Response in SPACE vs. CBT — Machine Learning Analysis. JCCP.",
            "SPACE-4: Khanna & Kendall (2009). Parental Training in CBT for Childhood Anxiety. RCT, n=53.",
            "SPACE-5: Dekel et al. (2020). Feasibility of Group SPACE. Pilot, n=25, no control arm.",
            "FA-1: Brennan et al. (2025). Family Accommodation in Autistic Youth. SR, 17 studies.",
            "FA-2: Fox & Fleming (2025). Parental Cognitions and Child Anxiety. SR, 31 studies, PRISMA.",
        ],
        analysis=[
            "SPACE-1 is the most cited argument for family-systemic intervention in child anxiety: a non-inferiority RCT demonstrating that parent-only treatment (SPACE — Supportive Parenting for Anxious Childhood Emotions) is statistically equivalent to gold-standard individual CBT across all primary anxiety outcomes, with significantly greater reduction in family accommodation (FA). The clinical implication is remarkable: effective anxiety treatment may not require any direct therapeutic contact with the anxious child.",
            "However, a critical reading of the evidence base reveals a significant methodological concern: the vast majority of high-quality family accommodation research (FA-1, FA-2, SPACE-1 through SPACE-5) originates from or is closely associated with Lebowitz's own research group at Yale. Independent replications of the SPACE non-inferiority finding are virtually absent from the literature. SPACE-5 (group format, n=25, no control arm) and SPACE-4 (n=53, different mechanism target) do not constitute independent validation.",
            "This creates a paradox: the most transformative finding in child anxiety treatment — that one can bypass the child entirely — rests on the narrowest independent evidence base. Individual CBT (CBT-1, CBT-2), by contrast, draws on meta-analyses of 81 and 115 RCTs respectively, from diverse research groups internationally.",
            "This does not invalidate SPACE. The non-inferiority design is methodologically sound, the RCT was NIH-funded and manualized, and the theoretical rationale (reducing family accommodation reduces anxiety maintenance) is mechanistically coherent. It does, however, explain why SPACE has not yet been adopted as a primary recommendation in most national clinical guidelines despite a decade of promising data.",
        ],
        implication="When arguing for systemic family-based treatment, acknowledge this evidence asymmetry explicitly. It demonstrates critical thinking and strengthens rather than weakens the argument — showing that you understand why the field has been slow to adopt what the data suggest. A critical essay that defends SPACE while naming its replication gap is more persuasive than one that presents it as settled consensus.",
    ),
    dict(
        num=2,
        title="The Three-Step Causal Chain of Parental Anxiety Transmission",
        studies=[
            "PT-1: Ahmadzadeh, Schoeler, Han et al. (2021). SR & Meta-Analysis of Genetically Informed Research. JAACAP. n&gt;12,700. Quasi-experimental design.",
            "PT-2: Zecchinato, Ahmadzadeh, Kreppner & Lawrence (2024). Paternal Anxiety and Offspring Outcomes. SR/Meta. JAACAP. 98 studies, n~55,000.",
            "PT-3: Bennett, McClure et al. (2025). Parental Factors in Parents With/Without Depression or Anxiety. SR/Meta. JAD. 52 studies, n&gt;41,000.",
            "PT-4: Yap, Pilkington, Ryan & Jorm (2014). Parental Factors Associated with Youth Anxiety & Depression. SR/Meta. JAD. 181 studies.",
            "FA-2: Fox & Fleming (2025). Parental Cognitions and Accommodation. SR, 31 studies.",
        ],
        analysis=[
            "The literature on parental anxiety transmission has matured to the point where a three-step causal chain can be assembled from separately validated links, each using different methodological approaches:",
            ("step", "Step 1 — Causal transmission exists (PT-1)",
             "Ahmadzadeh et al. (2021) use quasi-experimental designs — adoption studies, sibling comparisons, and children-of-twins methodology — to control for shared genetic variance. Postnatal parental anxiety shows a significant association with offspring internalizing problems even after genetic confounding is removed (r=.13). Critically, prenatal anxiety shows no significant effect after genetic control, suggesting the mechanism is environmental and behavioral, not intrauterine. This is as close to causal evidence as non-experimental human research achieves."),
            ("step", "Step 2 — Mechanism operates through parenting behavior (PT-3)",
             "Bennett et al. (2025) demonstrate with 52 studies and n&gt;41,000 that parents with anxiety disorders show significantly elevated parenting stress, reduced warmth, and less effective discipline compared to non-anxious parents. These are the behavioral intermediaries through which parental anxiety reaches the child — not through emotional contagion alone, but through systematic changes in the quality of the caregiving environment."),
            ("step", "Step 3 — Parenting behaviors drive accommodation (FA-2)",
             "Fox & Fleming (2025) close the chain by showing that negative parental cognitions about child anxiety (beliefs that the child cannot cope, catastrophic interpretations) mediate between parental mental state and accommodation behaviors. Anxious parents think differently about their child's distress, and this cognitive difference translates into protective-but-maintaining behaviors."),
            "The full chain: Parental anxiety &#8594; impaired parenting behavior &#8594; negative cognitions about child distress &#8594; family accommodation &#8594; child anxiety maintenance. Each link is empirically supported by large-scale meta-analyses. Notably, PT-2 (Zecchinato 2024, n=55,000) extends this to fathers, who show comparable transmission effect sizes (r=.13–.15) but remain dramatically underrepresented in both research and clinical practice.",
        ],
        implication="This is the strongest mechanistic argument in the essay and should anchor Section 2. Naming PT-1's quasi-experimental design explicitly elevates the argument beyond correlation to near-causality — unusual in this field, and worth signalling to the marker. The father data (PT-2) adds a dimension that most essays overlook.",
    ),
    dict(
        num=3,
        title="Social Media — The Distinction That Changes Everything",
        studies=[
            "SM-1: Ahmed, Walsh, Dawel et al. (2024). Social Media, Mental Health and Sleep. SR/Meta. JAD. ANU. 182 studies, n&gt;1,100,000.",
            "SM-2: Fassi, Thomas, Parry et al. (2024). Social Media and Internalizing Symptoms. SR/Meta. JAMA Pediatrics. Cambridge. 143 studies, n&gt;1,090,000.",
            "SM-3: Shannon, Bush, Villeneuve et al. (2022). Problematic Social Media Use in Adolescents. SR/Meta. JMIR Mental Health. n=9,269.",
            "ST-1: Odgers & Jensen (2020). Adolescent Mental Health in the Digital Age. JCPP Annual Review. 2014–2019 synthesis.",
            "ST-3: Plackett, Sheringham & Dykxhoorn (2023). Longitudinal Impact of Social Media on UK Adolescents. JMIR. UKHLS Panel, n=3,228.",
            "DS-1: Khetawat & Steele (2023). Digital Stress Components and Psychological Wellbeing. Meta-Analysis. Clinical Child and Family Psychology Review.",
        ],
        analysis=[
            "The relationship between social media and adolescent anxiety is one of the most contested areas in contemporary developmental psychology. A careful reading of the evidence reveals that the public debate — and much clinical guidance — conflates two empirically distinct phenomena.",
            "<b>General social media use:</b> SM-1 (n&gt;1.1M) and SM-2 (n&gt;1.09M, JAMA Pediatrics) both find small but statistically significant positive associations between social media use and anxiety/depression (r=0.08–0.12). These are real but clinically modest effects. Crucially, longitudinal studies (ST-1, ST-3) reveal that when confounders are adequately controlled — prior mental health, SES, family environment — longitudinal effects often shrink substantially or become non-significant. Odgers & Jensen (2020), in the most comprehensive critical review of the field, argue that preregistered large-scale studies show 'little evidence' of clinically meaningful effects.",
            "<b>Problematic social media use:</b> SM-3 (Shannon 2022) operationalises 'problematic' use as meeting behavioral addiction-like criteria (salience, mood modification, withdrawal, conflict). The meta-analytic correlation with anxiety rises to r=.348 — nearly four times the effect size of general use. DS-1 (Khetawat 2023) further differentiates: among five digital stress components, Approval Anxiety (fear of negative social evaluation online) and FOMO (fear of missing out) show the strongest associations with psychological distress (r=.34 and r=.31 respectively).",
            "The synthesis: social media use per se is probably not the clinically relevant variable. What matters is whether use is driven by underlying anxiety-related needs (social approval seeking, avoidance of social isolation) and whether it activates social comparison processes. Screen time limits — the most common clinical and parental recommendation — target the wrong variable. The evidence points toward addressing the psychological function of social media use, not its frequency.",
        ],
        implication="This argument demonstrates nuanced engagement with a polarised literature. Rather than joining the 'social media is dangerous' camp or dismissing concerns entirely, it identifies the precise mechanism (problematic use driven by approval anxiety and FOMO) that is clinically actionable. The r=.348 vs. r=.08–.12 contrast is striking and quotable.",
    ),
    dict(
        num=4,
        title="The SES Confounder — A Stronger Predictor Than Screen Time",
        studies=[
            "ST-4: Paulich, Ross, Lessem & Hewitt (2021). Screen Time and Early Adolescent Mental Health (ABCD Study). PLoS One. NIH-funded. n=11,875.",
            "COVID-1: Madigan, Racine, Vaillancourt et al. (2023). Depression and Anxiety Before and During COVID-19. SR/Meta. JAMA Pediatrics. 53 longitudinal cohorts, n=40,807.",
            "COVID-3: Samji, Wu, Ladak et al. (2022). Mental Health Impacts of COVID-19 on Children and Youth. SR. 116 studies, n=127,923.",
        ],
        analysis=[
            "Paulich et al. (2021), using the large-scale ABCD (Adolescent Brain Cognitive Development) study dataset (n=11,875), find that while screen time shows modest associations with adverse mental health outcomes, socioeconomic status (SES) emerges as a consistently stronger predictor. Families with lower SES show worse mental health outcomes independent of screen time, while the residual screen time effect after SES adjustment is markedly reduced.",
            "This finding carries significant methodological implications: many social media and screen time studies do not adequately control for SES, potentially attributing to technology what is in fact a function of socioeconomic disadvantage (less access to structured activities, fewer alternative coping resources, higher baseline stress). The 'screen time causes anxiety' narrative may, in part, reflect a failure to account for SES as a shared causal factor.",
            "The COVID-19 evidence adds an interesting wrinkle. COVID-1 (Madigan 2023) finds that higher-income adolescents showed stronger increases in anxiety during the pandemic — the opposite of the usual SES-protection pattern. COVID-3 (Samji 2022) similarly identifies older adolescents and those with neurodivergence as risk groups, with family protective factors cutting across SES lines. A plausible interpretation: COVID disrupted the mechanisms through which SES normally confers resilience (peer connection, structured activity, school routines), while higher-income families paradoxically had greater access to social media, academic pressure, and pandemic-related information.",
        ],
        implication="Most appropriate for Section 4 (Integration / Evidence Gaps). It shows awareness that the evidence base has structural limitations, and that effective intervention cannot be technology-focused without addressing underlying socioeconomic context. The COVID reversal of SES effect is a sophisticated observation that few essays would include.",
    ),
    dict(
        num=5,
        title="COVID as a Natural Experiment — and a Counterintuitive Result",
        studies=[
            "COVID-1: Madigan et al. (2023). JAMA Pediatrics. 53 longitudinal cohorts, n=40,807. SMD anxiety: 0.10; SMD depression: 0.26.",
            "COVID-2: Loades, Chatburn, Higson-Sweeney et al. (2020). Social Isolation and Loneliness on Mental Health in COVID-19 Context. JAACAP. 83 studies.",
            "COVID-4: Panchal, Salazar de Pablo et al. (2021). Impact of COVID-19 Lockdown on Child Mental Health. SR. European Child & Adolescent Psychiatry. 61 studies, n=54,999.",
            "SPACE-1/SPACE-2: Lebowitz et al. — family accommodation as anxiety maintenance mechanism.",
        ],
        analysis=[
            "The COVID-19 pandemic constitutes a uniquely informative natural experiment for testing the essay's thesis. It simultaneously imposed: (1) maximal disruption to family systems (confinement, parental stress, blurred boundaries), and (2) unprecedented escalation of digital exposure (school online, social life online, continuous news consumption). If the thesis is correct — that family dynamics and digital environment are the two primary systemic drivers of adolescent anxiety — COVID should have produced a dramatic anxiety spike.",
            "The data are more nuanced than expected. COVID-1 (Madigan 2023, 53 cohorts, n&gt;40,000) documents a statistically significant but smaller-than-expected increase in anxiety (SMD=0.10) compared to depression (SMD=0.26). This asymmetry is counterintuitive.",
            "A systemic interpretation resolves the paradox: anxiety — unlike depression — is specifically maintained by avoidance and accommodation. Family confinement during COVID paradoxically increased parental availability to accommodate anxious children, providing the short-term relief that sustains rather than extinguishes anxiety. COVID-4 identifies 'parent-child communication' as a protective factor and 'excessive media exposure' as a risk factor — consistent with the two-system model. COVID-2 shows that social isolation drives emotional distress primarily through loneliness mechanisms, more relevant to depression than anxiety per se.",
            "The implication is not that COVID failed to worsen anxiety — it did, for specific subgroups (girls, older adolescents, those with pre-existing conditions). The relative magnitudes suggest, however, that family proximity, even stress-laden, may buffer anxiety in ways that it does not buffer depression. This is compatible with the accommodation literature: families that accommodate anxiety provide short-term relief, which maintains anxiety but prevents acute escalation.",
        ],
        implication="Rather than citing COVID only as evidence that anxiety is at crisis levels, use the anxiety-depression asymmetry to make a subtle argument about family accommodation as a modulating (not merely amplifying) force. This shows you can read inconvenient data and extract mechanistic insight from it.",
    ),
    dict(
        num=6,
        title="Gaming vs. Social Media — The Ignored Distinction",
        studies=[
            "ST-2: Boers, Afzali & Conrod (2020). Temporal Associations of Screen Time and Anxiety Symptoms. Canadian Journal of Psychiatry. 4-year longitudinal panel.",
            "SM-3: Shannon et al. (2022). Problematic Social Media Use — approval anxiety correlation r=.348.",
            "DS-1: Khetawat & Steele (2023). Digital Stress Components — Approval Anxiety, FOMO, Online Vigilance. r=.26–.34.",
            "ST-1: Odgers & Jensen (2020). Adolescent Mental Health in the Digital Age. JCPP Annual Review.",
        ],
        analysis=[
            "Boers et al. (2020) is one of very few longitudinal studies establishing temporal direction — social media &#8594; anxiety, rather than anxiety &#8594; social media. The 4-year panel design allows examination of within-person changes over time. The key finding: social media use and television viewing predict longitudinal increases in anxiety symptoms. Video gaming does not.",
            "This distinction is systematically ignored in public discourse, where 'screen time' is treated as a uniform category. Gaming is as heavily consumed as social media among adolescent males and has been subject to comparable moral panic. Yet the longitudinal data fail to support gaming as an anxiety driver.",
            "The theoretically coherent explanation: social media and television share social comparison as a core process. Social media presents curated peer lives and invites active comparison of social standing, appearance, and social desirability. Television (particularly reality TV and influencer content) similarly presents aspirational social content. Gaming, by contrast, primarily engages achievement motivation and flow states, with social comparison operating differently — skill-based rankings, cooperative play — and less directly tied to appearance or social approval.",
            "This connects directly to DS-1's finding (Khetawat 2023) that Approval Anxiety and FOMO show the strongest associations with distress among digital stress components (r=.31–.34). The common mechanism across anxiety-driving digital activities is social comparison and approval-seeking — not screen time per se.",
        ],
        implication="The gaming/social media distinction is a powerful analytical move. It demonstrates that you have read beyond the headlines, identified a specific mechanism (social comparison), and can argue for precision in intervention design. Citing a 4-year longitudinal study (ST-2) for the temporal direction is methodologically important and distinguishes this argument from cross-sectional claims.",
    ),
    dict(
        num=7,
        title="The Digital Channel as Both Problem and Solution",
        studies=[
            "ICBT-1: Nordh, Wahlund, Jolstedt et al. (2021). Therapist-Guided Internet-CBT vs. Internet-Supportive Therapy for Social Anxiety. RCT. JAMA Psychiatry. Karolinska. n=103. d=0.67.",
            "ICBT-2: Vigerland, Serlachius, Thulin et al. (2017). Long-term Outcomes of Internet-CBT for Childhood Anxiety. 12-month follow-up. d=0.63–2.35.",
            "ICBT-3: Morgan, Rapee, Salim & Bayer (2018). Internet-Delivered Parenting Program (Cool Little Kids Online). RCT, n=433.",
            "DI-1: Ridout & Campbell (2019). Social Networking Sites in Mental Health Interventions for Young People. SR. JMIR. 9 articles, 5 interventions.",
            "TT-1: Jain, Velez et al. (2025). Problematic TikTok Use and Mental Health. SR. 26 studies, n=11,462.",
        ],
        analysis=[
            "A fundamental tension exists within the essay's argument: if digital environments amplify anxiety through social comparison, approval-seeking, and FOMO, how should clinicians respond? The instinctive answer — reduce or restrict digital engagement — is not well supported as a sufficient intervention strategy.",
            "ICBT-1 (Nordh 2021, JAMA Psychiatry) provides the counterpoint: therapist-guided internet-delivered CBT is significantly more effective than internet-delivered supportive therapy for adolescent social anxiety (d=0.67 at 3-month follow-up). The internet is not an obstacle to treatment — it is a viable delivery mechanism that extends reach, reduces cost, and eliminates barriers of geography and stigma. ICBT-2 confirms these effects are stable over 12 months (d=0.63–2.35).",
            "ICBT-3 extends this to parents: internet-delivered parenting programs for early childhood anxiety (Cool Little Kids Online) are feasible and effective, with skill practice frequency — not module completion rate — as the primary predictor of benefit. This connects to the stepped care argument: parents can be the first point of internet-delivered intervention, before specialist services are engaged.",
            "DI-1 and TT-1 point toward an emerging integration: not only is the internet a treatment delivery vehicle, but social networking platforms themselves can host mental health interventions that adolescents engage with positively. The critical caveat from DI-1 is that clinician moderation appears to be a key component of effective SNS-based intervention — unmoderated peer support alone is insufficient.",
            "The synthesis: the digital environment is not a cause to be eliminated but a medium to be shaped. The same neurobiological vulnerabilities that make adolescents susceptible to social comparison on TikTok also make them responsive to therapist-guided engagement on digital platforms.",
        ],
        implication="Ideal for the Integration section (Section 4). It resolves an apparent contradiction in the essay's thesis and articulates a sophisticated position: neither technophobia nor naive techno-optimism, but evidence-based digital intervention design. JAMA Psychiatry (ICBT-1) is high-status evidence — cite it as your anchor.",
    ),
    dict(
        num=8,
        title="Precision Medicine — Oxytocin and the Family System Predict Treatment Response",
        studies=[
            "SPACE-3: Lebowitz, Zilcha-Mano, Orbach et al. (2021). Moderators of Response to Child-Based and Parent-Based Anxiety Treatment: Machine Learning Analysis. JCCP.",
            "PT-1: Ahmadzadeh et al. (2021). Non-genetic transmission, r=.13. Quasi-experimental design.",
            "NB-1: Casey, Glatt & Lee (2015). Treating the Developing vs. Developed Brain. Neuron. Weill Cornell. Translational neuroscience.",
            "CBT-2: Wang, Whiteside et al. (2017). CBT and Pharmacotherapy for Childhood Anxiety. JAMA Pediatrics. 115 studies, n=7,719.",
        ],
        analysis=[
            "SPACE-3 (Lebowitz 2021) applies machine learning to RCT data to identify moderators that differentially predict response to SPACE (parent-based) versus CBT (child-based). Two moderators emerge as particularly significant: (1) parental negativity — the degree of critical, hostile, or dismissive parenting behavior; and (2) child oxytocin levels at baseline — a neuropeptide associated with social bonding and trust.",
            "Children with higher baseline oxytocin levels responded better to SPACE, potentially because oxytocin facilitates the use of parental reassurance and co-regulation as a therapeutic mechanism. Children with lower oxytocin may be less able to leverage parental proximity therapeutically and may respond better to individual CBT with a trained therapist.",
            "This finding connects the neurobiological (NB-1: Casey 2015 on adolescent fear-learning circuitry and sensitive windows for intervention) with the systemic (SPACE-1: family accommodation as treatment target) and the pharmacological (CBT-2: SSRI augmentation improving CBT outcomes). It points toward a precision medicine framework: not 'which treatment works?' but 'which treatment works for which child, given their biological profile and family environment?'",
            "The implication for stepped care is significant: if oxytocin and parental negativity are measurable at intake assessment, they could inform treatment allocation at first presentation — directing high-family-accommodation cases with oxytocin-responsive children toward SPACE, and cases with low parental warmth or low oxytocin toward individual CBT with parental involvement as a secondary component.",
        ],
        implication="This is the most sophisticated argument in the set and should be used selectively — perhaps as a forward-looking point in Section 4 about precision medicine as the field's natural trajectory. It demonstrates genuine engagement with the cutting edge of the literature, and connects neuroscience to clinical decision-making in a way that is unusual in student essays.",
    ),
    dict(
        num=9,
        title="The Clinical Population Gap — Knowing the Wrong People",
        studies=[
            "SM-2: Fassi, Thomas, Parry et al. (2024). Social Media and Internalizing in Clinical vs. Community Samples. JAMA Pediatrics. 143 studies, n&gt;1,090,000. Finding: only 11% used clinical populations.",
            "CBT-1: Sigurvinsdóttir et al. (2019). CBT for Child and Adolescent Anxiety Disorders. SR/Meta. 81 RCTs, n&gt;5,900.",
            "SPACE-1: Lebowitz et al. (2019). RCT, n=124. Clinical anxiety disorder diagnosis required.",
        ],
        analysis=[
            "Fassi et al. (2024) contain a finding that is rarely foregrounded in citations of this study: despite the dataset comprising over 1.09 million participants across 143 studies, only approximately 11% of included studies used clinical populations — children and adolescents with diagnosed anxiety disorders. The remaining 89% studied community samples with subclinical or undiagnosed anxiety.",
            "This is a profound methodological limitation for clinical practice. The adolescents most likely to be severely affected by social media — those already experiencing clinically significant anxiety — are precisely the population for whom we have the least evidence. We know with considerable confidence what modest effects social media has on healthy young people's anxiety. We know almost nothing about whether those effects are amplified, attenuated, or qualitatively different in treatment-seeking populations.",
            "For clinical guidelines and school-based interventions — which target identified anxious young people — this gap means evidence is being extrapolated from populations that may not be representative. An anxious adolescent who uses social media compulsively for reassurance-seeking is a fundamentally different case from a non-anxious peer who uses social media recreationally.",
            "This gap also interacts with the SPACE and CBT evidence: virtually all high-quality clinical treatment trials (CBT-1, SPACE-1) study children with diagnosed anxiety disorders but measure social media use as an outcome or moderator only incidentally, if at all. The two literatures — social media effects and clinical anxiety treatment — remain largely siloed, creating a structural blind spot in the evidence base.",
        ],
        implication="Ideal for Section 4's evidence gaps discussion. It is specific, grounded in a high-status source (JAMA Pediatrics), and makes an argument genuinely useful for clinicians — without requiring you to resolve the gap, only to identify it with precision. The 11% figure is striking and memorable.",
    ),
    dict(
        num=10,
        title="The Unstudied Interaction — The Core Gap in the Evidence for Integration",
        studies=[
            "All family system studies: FA-1, FA-2, PT-1 through PT-4, SPACE-1 through SPACE-5.",
            "All digital environment studies: SM-1 through SM-4, ST-1 through ST-4, CB-1, DS-1, TT-1.",
            "Evidence Gap #7 (research_index.md): no study found that systematically examines how family accommodation and digital environment interact.",
        ],
        analysis=[
            "The essay's central thesis requires both a family systems argument and a digital environment argument. Section 4 must integrate these. Yet the research base offers almost no direct evidence on how these two systems interact — a gap that is itself analytically significant.",
            "Consider the following interaction scenarios, none of which have been systematically studied:",
            ("scenario", "1. Digital accommodation",
             "Anxious children who refuse school are kept at home where they spend the day on social media. Parents accommodate the avoidance (consistent with FA literature) while the digital environment provides social connection that partially substitutes for peer contact — preventing the anxiety extinction that would occur with in-vivo exposure. Family accommodation and digital medium jointly maintain anxiety in ways that neither alone would sustain."),
            ("scenario", "2. Parental surveillance as digital accommodation",
             "Parents of anxious children message them repeatedly during school hours to check in (analogous to SM-3's Availability Stress component, r=.31). This constitutes accommodation — parental behavior that relieves the child's anxiety temporarily while preventing habituation. The digital channel enables a form of accommodation that was structurally impossible before mobile phones."),
            ("scenario", "3. Social media access as accommodation",
             "An anxious adolescent's FOMO and social comparison distress (DS-1) is accommodated by parents who provide unlimited social media access to prevent social exclusion. The parent's accommodation rationale ('I don't want them to feel left out') directly enables the maintaining factor (approval anxiety online)."),
            ("scenario", "4. COVID intersection",
             "COVID-4 (Panchal 2021) finds that 'excessive media exposure' during lockdown predicted anxiety, while 'parent-child communication' protected against it. This is precisely the interaction: families who communicated protectively probably also regulated media exposure; families who accommodated digitally produced worse outcomes."),
            "The absence of research on these interactions is not a minor gap — it is the central gap for anyone arguing that anxiety is systemically maintained. If the family system and the digital environment co-maintain anxiety through interacting mechanisms, treating either system in isolation is insufficient by design. The interaction is the intervention target, and the field has not yet systematically described it, let alone intervened on it.",
        ],
        implication="This should be the culminating argument of Section 4. It transforms the evidence gap from an academic caveat into the positive argument for integrated, systemic intervention. The gap's existence validates the essay's thesis: individual and single-system interventions are inadequate not just in principle, but because the evidence base itself has not yet caught up with the systemic reality that practitioners observe daily.",
    ),
]

SUMMARY_DATA = [
    ["#", "Argument", "Primary Studies", "Section", "Strength"],
    ["1", "SPACE paradox — single research group", "SPACE-1, FA-1, FA-2", "Section 2", "High"],
    ["2", "Three-step causal chain of parental transmission", "PT-1, PT-2, PT-3, FA-2", "Section 2 (anchor)", "Very High"],
    ["3", "Problematic vs. general SM use", "SM-1–3, ST-1, ST-3", "Section 3", "Very High"],
    ["4", "SES as stronger predictor than screen time", "ST-4, COVID-1, COVID-3", "Section 4", "Medium-High"],
    ["5", "COVID natural experiment — anxiety < depression", "COVID-1, COVID-2, COVID-4", "Section 3/4", "High"],
    ["6", "Gaming vs. SM — social comparison mechanism", "ST-2, SM-3, DS-1", "Section 3", "High"],
    ["7", "Digital as problem AND solution", "ICBT-1, ICBT-2, DI-1, TT-1", "Section 4", "High"],
    ["8", "Precision medicine — oxytocin moderates treatment", "SPACE-3, NB-1", "Section 4", "High"],
    ["9", "Clinical population gap (11% clinical studies)", "SM-2", "Section 4", "High"],
    ["10", "The unstudied interaction — core integration gap", "All family + digital", "Section 4 (culminating)", "Very High"],
]

# ── Build document ────────────────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2.2*cm,
        bottomMargin=1.8*cm,
        title="Critical Cross-Study Arguments — Anxiety in Children & Adolescents",
        author="EssayFabrik S7",
    )

    story = []

    # ── COVER PAGE ─────────────────────────────────────────────────────────
    cover = Table([[""]], colWidths=[17*cm], rowHeights=[26*cm])
    cover.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))

    cover_inner = []
    cover_inner.append(Spacer(1, 3*cm))
    cover_inner.append(Paragraph("Critical Cross-Study Arguments", S_COVER_TITLE))
    cover_inner.append(Paragraph("Anxiety in Children &amp; Adolescents", S_COVER_TITLE))
    cover_inner.append(Spacer(1, 0.3*cm))
    cover_inner.append(HRFlowable(width="60%", thickness=1.5, color=GOLD,
                                   hAlign="CENTER", spaceAfter=12, spaceBefore=4))
    cover_inner.append(Paragraph("Evidence Analysis for Module 4 Essay", S_COVER_SUB))
    cover_inner.append(Paragraph("EssayFabrik S7 &nbsp;|&nbsp; NPMH &nbsp;|&nbsp; April 2026", S_COVER_SUB))
    cover_inner.append(Spacer(1, 1.2*cm))
    cover_inner.append(Paragraph("ESSAY THESIS", S_COVER_THESIS_LABEL))
    cover_inner.append(Paragraph(
        "&#8220;Anxiety in children and adolescents is not an individual disorder but a systemic one: "
        "sustained by family dynamics that accommodate and transmit anxiety, and amplified by a digital and "
        "societal environment that exploits adolescent neurobiological vulnerability. Effective, evidence-based "
        "intervention must therefore move beyond the individual child.&#8221;",
        S_COVER_THESIS))
    cover_inner.append(Spacer(1, 1.5*cm))
    cover_inner.append(Paragraph("27 studies indexed &nbsp;&#8226;&nbsp; 10 cross-study arguments &nbsp;&#8226;&nbsp; Master's level", S_COVER_SUB))

    cover_frame = Table([[cover_inner]], colWidths=[17*cm])
    cover_frame.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 30),
        ("RIGHTPADDING", (0, 0), (-1, -1), 30),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))

    story.append(cover_frame)
    story.append(PageBreak())

    # ── TABLE OF CONTENTS ─────────────────────────────────────────────────
    story.append(spacer(0.3))
    story.append(Paragraph("Table of Contents", S_TOC_TITLE))
    story.append(hr(NAVY, 1.5))
    story.append(spacer(0.2))
    for a in ARGUMENTS:
        story.append(Paragraph(
            f"<b>Argument {a['num']:02d}</b> &nbsp;—&nbsp; {a['title']}",
            S_TOC_ITEM))
    story.append(spacer(0.3))
    story.append(Paragraph("<b>Summary Table</b> &nbsp;—&nbsp; All 10 Arguments at a Glance", S_TOC_ITEM))
    story.append(spacer(0.5))

    # Context box
    ctx = [
        Paragraph("Essay Structure (for reference)", S_SECTION_LABEL),
        Paragraph("Section 1: Introduction (~200w) &nbsp;|&nbsp; Section 2: Family System (~550w) &nbsp;|&nbsp; "
                  "Section 3: Digital &amp; Societal (~550w) &nbsp;|&nbsp; Section 4: Integration (~300w) &nbsp;|&nbsp; "
                  "Section 5: Conclusion (~200w)", S_STUDY_ITEM),
    ]
    ctx_table = Table([[ctx]], colWidths=[17*cm])
    ctx_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, MID),
    ]))
    story.append(ctx_table)
    story.append(PageBreak())

    # ── ARGUMENTS ─────────────────────────────────────────────────────────
    for a in ARGUMENTS:
        story += arg_block(
            a["num"], a["title"], a["studies"], a["analysis"], a["implication"]
        )
        if a["num"] < 10:
            story.append(PageBreak())

    # ── SUMMARY TABLE ─────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(spacer(0.3))
    story.append(Paragraph("Summary Table — All 10 Arguments", S_TOC_TITLE))
    story.append(hr(NAVY, 1.5))
    story.append(spacer(0.3))

    col_w = [0.7*cm, 5.5*cm, 4*cm, 3.2*cm, 2.6*cm]
    table_rows = []
    for i, row in enumerate(SUMMARY_DATA):
        if i == 0:
            styled = [Paragraph(cell, S_TABLE_HEADER) for cell in row]
        else:
            styled = [
                Paragraph(row[0], S_TABLE_CELL_C),
                Paragraph(row[1], S_TABLE_CELL),
                Paragraph(row[2], S_TABLE_CELL),
                Paragraph(row[3], S_TABLE_CELL_C),
                Paragraph(row[4], S_TABLE_CELL_C),
            ]
        table_rows.append(styled)

    sum_table = Table(table_rows, colWidths=col_w, repeatRows=1)
    sum_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BACKGROUND", (0, 1), (-1, 1), LIGHT),
        ("BACKGROUND", (0, 2), (-1, 2), WHITE),
        ("BACKGROUND", (0, 3), (-1, 3), LIGHT),
        ("BACKGROUND", (0, 4), (-1, 4), WHITE),
        ("BACKGROUND", (0, 5), (-1, 5), LIGHT),
        ("BACKGROUND", (0, 6), (-1, 6), WHITE),
        ("BACKGROUND", (0, 7), (-1, 7), LIGHT),
        ("BACKGROUND", (0, 8), (-1, 8), WHITE),
        ("BACKGROUND", (0, 9), (-1, 9), LIGHT),
        ("BACKGROUND", (0, 10), (-1, 10), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.3, MID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        # Highlight Very High
        ("TEXTCOLOR", (4, 2), (4, 2), colors.HexColor("#1A5C45")),
        ("TEXTCOLOR", (4, 3), (4, 3), colors.HexColor("#1A5C45")),
        ("TEXTCOLOR", (4, 10), (4, 10), colors.HexColor("#1A5C45")),
    ]))
    story.append(sum_table)

    story.append(spacer(0.6))
    story.append(Paragraph(
        "<b>Recommended focus for 2,000-word essay:</b> Arguments 2, 3, and 10 — "
        "the causal transmission chain, the problematic-use distinction, and the unstudied interaction.",
        S_IMPLICATION))

    story.append(spacer(0.5))
    story.append(hr(MUTED))
    story.append(Paragraph(
        "Generated by EssayFabrik S7 &nbsp;|&nbsp; Session: 02 University / NPMH / module4 &nbsp;|&nbsp; April 2026",
        S_FOOTER_LABEL))

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF saved: {OUTPUT}")

build()
