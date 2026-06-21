"""
EssayFabrik — Module 4B Essay PDF — v009 (intervention-centred rebuild, clean submission)
Output: ../06 Drafting/essay_draft.pdf
No annotation boxes: cover + prose + reference list only.
"""
from reportlab import rl_config
rl_config.pageCompression = 0
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)

OUTPUT = r"C:\Users\tango\OneDrive\10 Documents\15 Dev\EssayFabrik\01 projects\module4\06 Drafting\essay_draft.pdf"

NAVY  = colors.HexColor("#1B2A4A")
GOLD  = colors.HexColor("#C9A84C")
DARK  = colors.HexColor("#1A1A1A")
MUTED = colors.HexColor("#5A6A7A")
WHITE = colors.white
MID   = colors.HexColor("#D0DCE8")
W = 17 * cm

def S(name, **kw): return ParagraphStyle(name, **kw)

C_TITLE = S("CT", fontName="Helvetica-Bold", fontSize=23, textColor=WHITE, leading=29, alignment=TA_CENTER)
C_SUB   = S("CS", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#B0C8D8"), leading=14, alignment=TA_CENTER)
C_GOLD  = S("CG", fontName="Helvetica-Bold", fontSize=7.5, textColor=GOLD, leading=10, alignment=TA_CENTER, spaceBefore=18, spaceAfter=4)
C_THES  = S("CTH", fontName="Helvetica-Oblique", fontSize=9.5, textColor=WHITE, leading=14, alignment=TA_CENTER)
C_META  = S("CM", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#8AAFC0"), leading=12, alignment=TA_CENTER, spaceBefore=6)

H1   = S("H1", fontName="Helvetica-Bold", fontSize=14, textColor=NAVY, spaceBefore=16, spaceAfter=6, leading=18)
H2   = S("H2", fontName="Helvetica-Bold", fontSize=11, textColor=colors.HexColor("#2E7D8C"), spaceBefore=11, spaceAfter=4, leading=14)
BODY = S("BD", fontName="Helvetica", fontSize=10.5, textColor=DARK, leading=16, spaceAfter=8, alignment=TA_JUSTIFY)
REF_HEAD = S("RH", fontName="Helvetica-Bold", fontSize=13, textColor=NAVY, spaceBefore=14, spaceAfter=6)
REF_ITEM = S("RI", fontName="Helvetica", fontSize=8.7, textColor=DARK, leading=12.5, spaceAfter=5, leftIndent=16, firstLineIndent=-16)
FOOT = S("FT", fontName="Helvetica", fontSize=7, textColor=MUTED, alignment=TA_CENTER)

def sp(h=0.3): return Spacer(1, h*cm)

def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY); canvas.rect(0, A4[1]-18, A4[0], 18, fill=1, stroke=0)
    canvas.setFillColor(GOLD); canvas.rect(0, A4[1]-21, A4[0], 3, fill=1, stroke=0)
    if doc.page > 1:
        canvas.setFillColor(WHITE); canvas.setFont("Helvetica", 7)
        canvas.drawString(cm, A4[1]-13, "Anxiety in Children & Young People: Have Our Interventions Kept Pace?")
        canvas.drawRightString(A4[0]-cm, A4[1]-13, "MSc NPMH | Module 4 Assessment B")
    canvas.setFillColor(NAVY); canvas.rect(0, 0, A4[0], 18, fill=1, stroke=0)
    canvas.setFillColor(GOLD); canvas.rect(0, 18, A4[0], 2, fill=1, stroke=0)
    canvas.setFillColor(WHITE); canvas.setFont("Helvetica", 7)
    canvas.drawCentredString(A4[0]/2, 6, f"Page {doc.page}")
    canvas.restoreState()

def P(t): return Paragraph(t, BODY)

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.4*cm, bottomMargin=1.8*cm,
        title="Anxiety in Children and Young People - Have Our Interventions Kept Pace",
        author="MSc NPMH Student - Module 4 Assessment B")
    s = []

    # ── COVER (plain academic title page) ──
    TT = S("TT", fontName="Helvetica-Bold", fontSize=20, textColor=NAVY, leading=26, alignment=TA_CENTER)
    TS = S("TS", fontName="Helvetica-Oblique", fontSize=11.5, textColor=MUTED, leading=16, alignment=TA_CENTER)
    TM = S("TM", fontName="Helvetica", fontSize=10.5, textColor=DARK, leading=17, alignment=TA_CENTER)
    s.append(sp(3.4))
    s.append(Paragraph("Anxiety in Children and Young People:", TT))
    s.append(Paragraph("Have Our Interventions Kept Pace?", TT))
    s.append(sp(0.25))
    s.append(HRFlowable(width="42%", thickness=1.2, color=GOLD, hAlign="CENTER", spaceAfter=12, spaceBefore=6))
    s.append(Paragraph("Evaluating evidence-based and emerging treatments for a digital generation", TS))
    s.append(sp(2.4))
    s.append(Paragraph("MSc Neuroscience and Psychology of Mental Health", TM))
    s.append(Paragraph("Module 4 &#8212; Child and Adolescent Mental Health", TM))
    s.append(Paragraph("Assignment Part B", TM))
    s.append(sp(0.5))
    s.append(Paragraph("Student number: 5779906", TM))
    s.append(Paragraph("Word count: 2,090 (excluding references)", TM))
    s.append(Paragraph("Harvard (WMS) referencing &nbsp;&#8226;&nbsp; June 2026", TM))
    s.append(PageBreak())

    # ── 1. INTRODUCTION — THE PARADOX (the need) ──
    s.append(Paragraph("Introduction", H1))
    s.append(P(
        "Few areas of child mental health can claim as strong an evidence base as the treatment of anxiety, and few "
        "look so much like a system failing. Anxiety is the most common psychiatric condition of childhood, and no "
        "longer a minor one: by 2021 anxiety disorders had become the leading contributor to non-fatal disability "
        "among people aged five to twenty-four worldwide (Liu et al., 2025). The trend is steep. UK primary-care "
        "records show the diagnosed incidence in children and young people roughly tripling in the fifteen years to "
        "2018 (Cybulski et al., 2021), and global analyses describe a sharp post-2019 acceleration (Bie et al., 2024). "
        "The paradox at the centre of this essay is that this rise has coincided not with therapeutic stagnation but "
        "with steadily improving, better-evidenced treatment. If the tools are getting better, why is the problem "
        "getting worse &#8212; and has intervention, in any meaningful sense, kept pace?"))
    s.append(P(
        "The question matters most in the young because childhood anxiety rarely stays where it starts. Even in "
        "community samples, symptoms sort early into distinct trajectories, some transient and some stubbornly "
        "persistent (Broeren et al., 2012); children on the persistent path carry substantially higher risks of adult "
        "depression, self-harm and educational failure, while those whose symptoms remit fare little worse than their "
        "peers (Tseliou et al., 2024). The heaviest burden falls on the minority in whom anxiety and depression become "
        "comorbid &#8212; a trajectory that uniquely predicts substance misuse and lasting functional impairment "
        "(Morales-Mu&#241;oz et al., 2023; Woodward and Fergusson, 2001). What makes the young distinctive, though, is "
        "the brain in which this unfolds. The prefrontal circuitry that regulates an earlier-maturing amygdala keeps "
        "developing into the mid-twenties (Casey et al., 2015), and adolescence is a sensitive window in which "
        "experience, including therapy, shapes circuits not yet fixed (Sisk and Romeo, 2019). Crucially the plasticity "
        "is therapeutic: the extinction learning that exposure-based treatment relies on is unusually efficient in "
        "childhood (Kim, 2017), and cognitive behavioural therapy can normalise the very networks implicated in "
        "paediatric anxiety (Ladouceur, 2024). Delay is therefore costly in a precise neurobiological sense, which "
        "makes a failure to intervene early all the more consequential. The essay asks what we have, how well it "
        "works, why it is not reaching enough children, and what could."))

    # ── 2. WHAT WORKS, AND HOW WELL (the status quo) ──
    s.append(Paragraph("What We Have, and How Well It Works", H1))
    s.append(P(
        "Anxiety becomes a disorder when developmentally ordinary fear turns persistent, excessive and impairing, and "
        "it takes age-specific forms &#8212; separation anxiety and selective mutism in younger children, and, "
        "increasingly since the pandemic, emotionally-based school avoidance in adolescents, where distress rather than "
        "defiance keeps a young person from attending. Against this range, cognitive behavioural therapy remains the "
        "first-line, best-evidenced treatment. The largest network meta-analysis of psychotherapies for childhood "
        "anxiety found that most active treatments outperformed waiting-list control, with group CBT alone also "
        "surpassing other active therapies (Zhou et al., 2019); broader syntheses confirm that individual, group and "
        "family-based formats are efficacious, with gains generally maintained to six- and twelve-month follow-up "
        "(Sigurvinsdottir et al., 2020). Format interacts with development &#8212; individual and group delivery are "
        "broadly equivalent for children, but individual CBT appears more effective for adolescents (Guo et al., 2021). "
        "Effect sizes are large and clinically meaningful, yet remission is far from universal: a sizeable minority "
        "retain residual symptoms that predict later relapse. CBT therefore remains the most robust first-line "
        "option, but it is a strong treatment whose real-world value, as the next sections show, depends entirely on "
        "whether a child can reach it."))
    s.append(P(
        "Because parental responses help maintain childhood anxiety, engaging the family has become central rather than "
        "supplementary. The most striking evidence comes from parent-only treatment: Supportive Parenting for Anxious "
        "Childhood Emotions, delivered solely through the parent, proved non-inferior to individual CBT while reducing "
        "family accommodation more substantially (Lebowitz et al., 2020) &#8212; though meta-analysis tempers this to "
        "reliable benefit over waiting-list and broad equivalence to, rather than superiority over, child-focused "
        "therapy (Jewell et al., 2022). The value of the family route is thus less that it outperforms individual "
        "therapy than that it engages a maintaining mechanism directly while extending reach where therapist time "
        "is scarce. Medication has a narrower, defined place: selective serotonin reuptake inhibitors raise "
        "response over placebo, CBT generally matches or exceeds them, and their combination outperforms either alone "
        "(Wang et al., 2017), albeit with an advantage that accrues only after some weeks (Strawn et al., 2022). "
        "A meta-analytic signal of elevated suicidal ideation, however, confines them to moderate-to-severe or "
        "treatment-refractory presentations under careful monitoring (Karawekpanyawong et al., 2026)."))
    s.append(P(
        "The decisive point for what follows is not any single effect size but a question of external validity: do "
        "these treatments work outside the trial? They do. A systematic review of fifty-eight studies in routine "
        "clinical care found large effects and remission rates between roughly half and three-quarters, with the "
        "similarities between everyday practice and efficacy trials outweighing the differences (Wergeland et al., "
        "2021). This matters enormously, because it means that whatever explains the rising burden, it is not that our "
        "treatments fail when they leave the laboratory. The weak link must lie somewhere other than the therapy "
        "itself &#8212; and the obvious place to look is outside the consulting room."))

    # ── 3. WHY IT IS NOT ENOUGH (the gap) ──
    s.append(Paragraph("Why It Is Not Enough", H1))
    s.append(P(
        "If effective treatment exists yet the burden still climbs, the explanation must be that the treatment is not "
        "reaching those who need it &#8212; and the evidence for that access gap is stark. Roughly half of adolescents "
        "with a mental-health need worldwide receive no care, rising to fifty-eight per cent among those with a "
        "diagnosed disorder (Ghafari et al., 2022). In the UK the bottleneck is the front door of specialist services: "
        "as referrals to child and adolescent mental health services rose, the proportion rejected climbed from "
        "eighteen to thirty-one per cent, so the number of children actually reaching care stayed flat while demand grew "
        "(Ball et al., 2022). Almost a quarter of referrals end unsuccessfully, often after long waits and without "
        "redirection to any alternative (Abel et al., 2025). Nor is the gap merely one of capacity: adolescents "
        "typically cannot refer themselves but depend on adults to notice and act, and are held back by normalised "
        "distress, shame and fear of being a burden (Radez et al., 2022) &#8212; so even where services exist, the "
        "route in is fragile. Of the candidate explanations for the rising burden, this is the best-evidenced and the "
        "most actionable: on the available evidence, the dominant constraint appears to be reach rather than the "
        "remedy itself."))
    s.append(P(
        "Two further leaks compound the problem. First, treatment gains are not always durable: long-term follow-up of "
        "the landmark multimodal cohort found only about a fifth in stable remission and nearly half relapsing across "
        "six years (Ginsburg et al., 2018), though well-delivered routine care with booster sessions can maintain "
        "gains far better (Krause et al., 2024) &#8212; making this a problem of continuity rather than of the "
        "treatment itself. Second, the protocols fit imperfectly at the older end: adolescents, who present with more "
        "social anxiety and comorbid depression than younger children (Waite and Creswell, 2014), show remission rates "
        "nearer a third than the half seen in mixed samples (Baker et al., 2021). Both are real, but both are modifiers "
        "&#8212; they explain why some who reach treatment do not fully recover, not why most never reach it at all."))
    s.append(P(
        "The deepest problem is the one least amenable to better services. The rise in anxiety appears to be, at least "
        "partly, a genuine increase in incidence rather than mere detection. Clinically recorded diagnoses rose by "
        "nearly a third in a large US cohort (Xiang et al., 2024), and national registries show parallel increases, "
        "concentrated in adolescent girls and largely predating the pandemic (Bang, 2025). A plausible driver is an "
        "intensifying social-media-era risk environment of comparison, cybervictimisation and lost sleep (Bie et al., "
        "2024; Khetawat and Steele, 2023). Here individual treatment meets a structural limit. Dynamic modelling of "
        "population data shows that expanding access genuinely does reduce prevalence &#8212; but the benefit is "
        "masked, and more than offset, by rising incidence (Skinner et al., 2022). One cannot treat one&#8217;s way "
        "out of a problem whose upstream causes keep generating new cases (Patton et al., 2021). Keeping pace, then, "
        "demands two things the prevailing model lacks: far wider reach, and a genuine move upstream. Does the "
        "evidence show that either can be done?"))

    # ── 4. WHAT COULD CLOSE THE GAP (the solution — funnel to two) ──
    s.append(Paragraph("What Could Close the Gap", H1))

    # ── Figure 1 — intervention landscape (the survey) ──
    fhead = S("FH", fontName="Helvetica-Bold", fontSize=8.5, textColor=WHITE, leading=11)
    fcell = S("FC", fontName="Helvetica", fontSize=8.5, textColor=DARK, leading=11)
    fcap = S("FCAP", fontName="Helvetica-Oblique", fontSize=8.5, textColor=MUTED, leading=11, spaceBefore=4, spaceAfter=6)
    def frow(a, b, c): return [Paragraph(a, fcell), Paragraph(b, fcell), Paragraph(c, fcell)]
    fdata = [[Paragraph("Approach", fhead), Paragraph("Representative interventions", fhead), Paragraph("What it addresses / verdict", fhead)],
        frow("Scale reach", "Parent-led / parent-only CBT (SPACE); guided &amp; digitally-augmented CBT", "Closes the access gap; non-inferior to usual care; engagement is the limit"),
        frow("Lower intensity", "Single-session interventions; unguided online parent programmes", "Wider reach for less efficacy/durability &#8212; a trade, not equivalence"),
        frow("Move upstream", "Indicated (subthreshold) prevention; sleep CBT-I; school programmes", "Universal underdelivers for anxiety; indicated and sleep more promising"),
        frow("The frontier", "Conversational-agent chatbots; virtual-reality exposure", "Promise ahead of proof; no rigorous anxiety-outcome trial yet")]
    ft = Table(fdata, colWidths=[3*cm, 7.2*cm, 6.8*cm])
    ft.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,colors.HexColor("#EFF3F8")]),
        ("GRID",(0,0),(-1,-1),0.3,MID),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
    s.append(sp(0.1)); s.append(ft)
    s.append(Paragraph("Figure 1. Matching intervention strategies to the two gaps &#8212; reach and rising incidence.", fcap))

    s.append(P(
        "Closing a reach gap calls for interventions that multiply access, and two strategies have the evidence to do "
        "so. The first works through parents. Parent-led and parent-only programmes such as SPACE not only match "
        "individual CBT (Lebowitz et al., 2020) but dissolve the very bottleneck the access data expose: they need no "
        "child appointment slot, and they turn the adult gatekeeper &#8212; whose involvement is the precondition of a "
        "young person reaching care &#8212; into the therapeutic agent. For the youngest children, in whom standard "
        "cognitive techniques fit poorly, parent-mediated delivery is not a compromise but the developmentally "
        "appropriate route. Its value is greatest, then, in precisely the circumstances the access data describe: "
        "where a child is too young or too reluctant to engage directly, where parental accommodation is sustaining "
        "the anxiety, or where appointments with a child therapist are simply unavailable."))
    s.append(P(
        "The second strategy re-houses established CBT in scalable digital form, but conditionally. Internet-delivered "
        "CBT is efficacious for young people only when therapist guidance is present, with guided programmes "
        "outperforming unguided support (Nordh et al., 2021). Its binding constraint is not efficacy but engagement: "
        "even guided programmes lose a minority to dropout, so the decisive question for routine services is no longer "
        "whether the treatment works but whether young people can be kept engaged long enough to benefit &#8212; a "
        "problem of adherence and implementation, not of efficacy (Kaajalaakso et al., 2025). The most consequential "
        "trial combines both strands: digitally-augmented, therapist-supported, parent-led CBT proved non-inferior to "
        "usual care in routine NHS services while substantially reducing therapist time and cost (Creswell et al., "
        "2024), and an unguided online programme for anxious parents can even prevent anxiety in their children (Dunn "
        "et al., 2024). A still leaner option, the single-session intervention, shows its largest effects for anxiety "
        "specifically and reaches young people who would never enter a clinic, though its gains shrink against active "
        "controls and may not hold beyond a few months (Schleider et al., 2025). These approaches trade a measure of "
        "efficacy and durability for reach &#8212; a defensible exchange given the size of the gap, but one that "
        "should not be mistaken for equivalence to full-dose care."))
    s.append(P(
        "Reach alone, though, cannot answer rising incidence; that needs prevention, and here honesty is essential. "
        "Universal prevention underdelivers for anxiety specifically: the largest school-based programme showed no "
        "lasting effect at six years (Teesson et al., 2024), and even well-designed trials are frequently underpowered "
        "(Grummitt et al., 2025). The better-evidenced bet is indicated prevention &#8212; targeting young people "
        "already showing subthreshold symptoms &#8212; which modelling suggests reduces population prevalence more "
        "efficiently than universal approaches (Skinner et al., 2023; Hugh-Jones et al., 2019), with sleep-focused CBT "
        "the most mature mechanism-specific component (Mei et al., 2024). The genuinely novel frontier, by contrast "
        "&#8212; conversational-agent chatbots and virtual-reality exposure &#8212; remains promise ahead of proof, "
        "strong on acceptability but largely untested against active controls (Park et al., 2025; Baschab et al., "
        "2026), and cannot yet be counted as part of the answer."))

    # ── 5. CONCLUSION ──
    s.append(Paragraph("Conclusion", H1))
    s.append(P(
        "Has intervention kept pace with childhood anxiety? The answer is layered, and the layering is the point. The "
        "therapies themselves have largely kept pace: cognitive behavioural therapy, family- and parent-led treatment "
        "and judiciously used medication remain effective, broadly durable, and &#8212; on the best available "
        "evidence &#8212; robust enough to work in ordinary clinics, not merely in trials (Wergeland et al., 2021). "
        "What has not kept pace is the system that should deliver them and the strategy that should prevent the "
        "disorder. Most anxious children never reach the care that would help them, and even flawless access would run "
        "up against an incidence that individual treatment cannot, by itself, reduce. The most credible response is "
        "therefore not to invent new therapy for a digital generation but to scale the therapy we have &#8212; through "
        "parent-mediated and guided-digital delivery that widens reach &#8212; while investing upstream in indicated "
        "prevention that blunts the rising tide. The decisive evidence is still missing: no trial has tested a "
        "scalable, access-oriented model head-to-head against usual care at population scale, and no analysis has yet "
        "matched UK youth-anxiety incidence against the capacity meant to absorb it (Sebastian et al., 2021). Until it "
        "does, the field will keep refining a treatment that too few children ever receive &#8212; naming the right "
        "question without quite answering it."))

    s.append(PageBreak())

    # ── REFERENCES ──
    s.append(Paragraph("Reference List", REF_HEAD))
    s.append(HRFlowable(width="100%", thickness=1.5, color=NAVY, spaceAfter=4, spaceBefore=2))
    s.append(sp(0.15))
    refs = [
        "Abel, K.M. et al. (2025) Enhancing referrals to Child and Adolescent Mental Health Services: the EN-CAMHS mixed-methods study. <i>Health and Social Care Delivery Research</i>, 13(21). DOI: 10.3310/GYDW4507",
        "Baker, H.J. et al. (2021) The effectiveness of psychological therapies for anxiety disorders in adolescents: a meta-analysis. <i>Clinical Child and Family Psychology Review</i>, 24(4), pp. 765&#8211;782. DOI: 10.1007/s10567-021-00364-2",
        "Ball, W. et al. (2022) Inequalities in children&#8217;s mental health prescribing and referrals for specialist mental health services. <i>International Journal of Population Data Science</i>, 7(3), 205. DOI: 10.23889/ijpds.v7i3.1980",
        "Bang, L. (2025) Rising incidence of mental disorders in Norwegian youth (2010&#8211;2022): national registry data. <i>European Journal of Public Health</i>, 35(Suppl. 3), ckaf161.1923. DOI: 10.1093/eurpub/ckaf161.1923",
        "Baschab, J.F. et al. (2026) Facing fears in virtual worlds: a systematic review and meta-analysis on immersive VR therapy for children and adolescents with social anxiety and related disorders. <i>European Child &amp; Adolescent Psychiatry</i>, 35, pp. 1079&#8211;1092. DOI: 10.1007/s00787-025-02945-w",
        "Bie, F. et al. (2024) Rising global burden of anxiety disorders among adolescents and young adults: trends, risk factors, and the impact of socioeconomic disparities and COVID-19 from 1990 to 2021. <i>Frontiers in Psychiatry</i>, 15, 1489427. DOI: 10.3389/fpsyt.2024.1489427",
        "Broeren, S., Muris, P., Diamantopoulou, S. and Baker, J.R. (2012) The course of childhood anxiety symptoms: developmental trajectories and child-related factors in normal children. <i>Journal of Abnormal Child Psychology</i>, 41(1), pp. 81&#8211;95. DOI: 10.1007/s10802-012-9669-9",
        "Casey, B.J., Glatt, C.E. and Lee, F.S. (2015) Treating the developing versus developed brain: translating preclinical mouse and human studies. <i>Neuron</i>, 86(6), pp. 1358&#8211;1368. DOI: 10.1016/j.neuron.2015.05.020",
        "Creswell, C. et al. (2024) Digitally augmented, parent-led CBT versus treatment as usual for child anxiety problems in child mental health services in England and Northern Ireland: a pragmatic, non-inferiority, clinical and cost-effectiveness randomised controlled trial. <i>The Lancet Psychiatry</i>, 11(3), pp. 193&#8211;209. DOI: 10.1016/S2215-0366(23)00429-7",
        "Cybulski, L. et al. (2021) Temporal trends in annual incidence rates for psychiatric disorders and self-harm among children and adolescents in the UK, 2003&#8211;2018. <i>BMC Psychiatry</i>, 21, 229. DOI: 10.1186/s12888-021-03235-w",
        "Dunn, A. et al. (2024) Effectiveness of an unguided modular online intervention for highly anxious parents in preventing anxiety in their children: a parallel group randomised controlled trial. <i>The Lancet Regional Health &#8211; Europe</i>, 45, 101038. DOI: 10.1016/j.lanepe.2024.101038",
        "Ghafari, M. et al. (2022) Global prevalence of unmet need for mental health care among adolescents: a systematic review and meta-analysis. <i>Archives of Psychiatric Nursing</i>, 36. DOI: 10.1016/j.apnu.2021.10.008",
        "Ginsburg, G.S. et al. (2018) Results from the Child/Adolescent Anxiety Multimodal Extended Long-Term Study (CAMELS): primary anxiety outcomes. <i>Journal of the American Academy of Child &amp; Adolescent Psychiatry</i>, 57(7), pp. 471&#8211;480. DOI: 10.1016/j.jaac.2018.03.017",
        "Grummitt, L. et al. (2025) Efficacy of a school-based, universal prevention programme for depression and anxiety. <i>EClinicalMedicine</i>. DOI: 10.1016/j.eclinm.2025.103672",
        "Guo, T. et al. (2021) Individual vs. group cognitive behavior therapy for anxiety disorder in children and adolescents: a meta-analysis of randomized controlled trials. <i>Frontiers in Psychiatry</i>, 12, 674267. DOI: 10.3389/fpsyt.2021.674267",
        "Hugh-Jones, S. et al. (2019) Indicated preventive interventions for anxiety in children and adolescents: a review and meta-analysis of school-based programs. <i>PsyArXiv</i> [preprint]. DOI: 10.31234/osf.io/jadxq",
        "Jewell, C., Wittkowski, A. and Pratt, D. (2022) The impact of parent-only interventions on child anxiety: a systematic review and meta-analysis. <i>Journal of Affective Disorders</i>, 309, pp. 324&#8211;349. DOI: 10.1016/j.jad.2022.04.082",
        "Kaajalaakso, K. et al. (2025) Predictors of dropout, time spent on the program and client satisfaction in an internet-based, telephone-assisted CBT anxiety program among elementary school children. <i>European Child &amp; Adolescent Psychiatry</i>, 34, pp. 249&#8211;258. DOI: 10.1007/s00787-024-02486-8",
        "Karawekpanyawong, N. et al. (2026) Efficacy, suicidality, tolerability, and acceptability of selective serotonin reuptake inhibitors and serotonin-norepinephrine reuptake inhibitors for children and adolescents with anxiety disorders: a systematic review and meta-analysis. <i>International Clinical Psychopharmacology</i>, 41(2), pp. 96&#8211;108. DOI: 10.1097/YIC.0000000000000599",
        "Khetawat, D. and Steele, R.G. (2023) Examining the association between digital stress components and psychological wellbeing: a meta-analysis. <i>Clinical Child and Family Psychology Review</i>, 26(4), pp. 957&#8211;974. DOI: 10.1007/s10567-023-00440-9",
        "Kim, J.H. (2017) Reducing fear during childhood to prevent anxiety disorders later: insights from developmental psychobiology. <i>Policy Insights from the Behavioral and Brain Sciences</i>, 4(2), pp. 131&#8211;138. DOI: 10.1177/2372732217719544",
        "Krause, K., Zhang, X.C. and Schneider, S. (2024) Long-term effectiveness of cognitive behavioral therapy in routine outpatient care for youth with anxiety disorders. <i>Psychotherapy and Psychosomatics</i>, 93(3), pp. 181&#8211;190. DOI: 10.1159/000537932",
        "Ladouceur, C.D. (2024) Can cognitive-behavioral therapy normalize neural function in youths with pediatric anxiety disorders? A developmental neuroscience perspective. <i>American Journal of Psychiatry</i>, 181. DOI: 10.1176/appi.ajp.20240024",
        "Lebowitz, E.R., Marin, C., Martino, A. et al. (2020) Parent-based treatment as efficacious as cognitive behavioral therapy for childhood anxiety: a randomized noninferiority study of SPACE. <i>Journal of the American Academy of Child &amp; Adolescent Psychiatry</i>, 59(3), pp. 362&#8211;372. DOI: 10.1016/j.jaac.2019.02.014",
        "Liu, Y. et al. (2025) Global burden of mental disorders in children and adolescents before and during the COVID-19 pandemic: evidence from the Global Burden of Disease Study 2021. <i>Psychological Medicine</i>. DOI: 10.1017/S0033291725000649",
        "Mei, Z. et al. (2024) The efficacy of cognitive behavioral therapy for insomnia in adolescents: a systematic review and meta-analysis. <i>Frontiers in Public Health</i>, 12, 1413694. DOI: 10.3389/fpubh.2024.1413694",
        "Morales-Mu&#241;oz, I. et al. (2023) Impact of anxiety and depression across childhood and adolescence on adverse outcomes in young adulthood: a UK birth cohort study. <i>British Journal of Psychiatry</i>, 222(5), pp. 212&#8211;220. DOI: 10.1192/bjp.2023.23",
        "Nordh, M., Wahlund, T., Jolstedt, M. et al. (2021) Therapist-guided internet-delivered cognitive behavioral therapy vs internet-delivered supportive therapy for children and adolescents with social anxiety disorder: a randomized clinical trial. <i>JAMA Psychiatry</i>, 78(7), pp. 705&#8211;713. DOI: 10.1001/jamapsychiatry.2021.0469",
        "Park, J.K. et al. (2025) Current landscape and future directions for mental health conversational agents for youth: scoping review. <i>JMIR Medical Informatics</i>, 13, e62758. DOI: 10.2196/62758",
        "Patton, G.C., Raniti, M. and Reavley, N. (2021) Rediscovering the mental health of populations. <i>World Psychiatry</i>, 20(2), pp. 151&#8211;152. DOI: 10.1002/wps.20842",
        "Radez, J. et al. (2022) Adolescents&#8217; perceived barriers and facilitators to seeking and accessing professional help for anxiety and depressive disorders: a qualitative interview study. <i>European Child &amp; Adolescent Psychiatry</i>, 31(6), pp. 891&#8211;907. DOI: 10.1007/s00787-020-01707-0",
        "Schleider, J.L. et al. (2025) Single-session interventions for mental health problems and service engagement: umbrella review of systematic reviews and meta-analyses. <i>Annual Review of Clinical Psychology</i>, 21. DOI: 10.1146/annurev-clinpsy-081423-025033",
        "Sebastian, C.L., Pote, I. and Wolpert, M. (2021) Searching for active ingredients to combat youth anxiety and depression. <i>Nature Human Behaviour</i>, 5(10), pp. 1266&#8211;1268. DOI: 10.1038/s41562-021-01195-5",
        "Sigurvinsdottir, A.L., Jensinudottir, K.B., Baldvinsdottir, K.D. et al. (2020) Effectiveness of cognitive behavioral therapy for child and adolescent anxiety disorders across different CBT modalities and comparisons: a systematic review and meta-analysis. <i>Nordic Journal of Psychiatry</i>, 74(3), pp. 168&#8211;180. DOI: 10.1080/08039488.2019.1686653",
        "Sisk, C.L. and Romeo, R.D. (2019) Stress and the adolescent brain, in <i>Coming of Age: Adolescent Stress and the Developing Brain</i>. New York: Oxford University Press, ch. 7. DOI: 10.1093/oso/9780195314373.003.0007",
        "Skinner, A. et al. (2022) Population mental health improves with increasing access to treatment: evidence from a dynamic modelling analysis. <i>BMC Psychiatry</i>, 22, 692. DOI: 10.1186/s12888-022-04352-w",
        "Skinner, A. et al. (2023) Population-level effectiveness of alternative approaches to preventing mental disorders in adolescents and young adults. <i>Scientific Reports</i>, 13, 19982. DOI: 10.1038/s41598-023-47322-2",
        "Strawn, J.R. et al. (2022) Combining selective serotonin reuptake inhibitors and cognitive behavioral therapy in youth with depression and anxiety. <i>Journal of Affective Disorders</i>, 298, pp. 292&#8211;300. DOI: 10.1016/j.jad.2021.10.047",
        "Teesson, M. et al. (2024) Effectiveness of a universal, school-based, online programme for the prevention of anxiety, depression and substance misuse among adolescents: 72-month follow-up. <i>The Lancet Digital Health</i>, 6(5), pp. e334&#8211;e344. DOI: 10.1016/S2589-7500(24)00046-3",
        "Tseliou, F. et al. (2024) Childhood correlates and young adult outcomes of trajectories of emotional problems from childhood to adolescence. <i>Psychological Medicine</i>, 54(11), pp. 2504&#8211;2514. DOI: 10.1017/S0033291724000631",
        "Waite, P. and Creswell, C. (2014) Children and adolescents referred for treatment of anxiety disorders: differences in clinical characteristics. <i>Journal of Affective Disorders</i>, 167, pp. 326&#8211;332. DOI: 10.1016/j.jad.2014.06.028",
        "Wang, Z., Whiteside, S.P.H., Sim, L. et al. (2017) Comparative effectiveness and safety of cognitive behavioral therapy and pharmacotherapy for childhood anxiety disorders: a systematic review and meta-analysis. <i>JAMA Pediatrics</i>, 171(11), pp. 1049&#8211;1056. DOI: 10.1001/jamapediatrics.2017.3036",
        "Wergeland, G.J.H., Riise, E.N. and &#214;st, L.-G. (2021) Cognitive behavior therapy for internalizing disorders in children and adolescents in routine clinical care: a systematic review and meta-analysis. <i>Clinical Psychology Review</i>, 83, 101918. DOI: 10.1016/j.cpr.2020.101918",
        "Woodward, L.J. and Fergusson, D.M. (2001) Life course outcomes of young people with anxiety disorders in adolescence. <i>Journal of the American Academy of Child &amp; Adolescent Psychiatry</i>, 40(9), pp. 1086&#8211;1093. DOI: 10.1097/00004583-200109000-00018",
        "Xiang, A.H. et al. (2024) Depression and anxiety among US children and young adults. <i>JAMA Network Open</i>, 7(9), e2436906. DOI: 10.1001/jamanetworkopen.2024.36906",
        "Zhou, X. et al. (2019) Different types and acceptability of psychotherapies for acute anxiety disorders in children and adolescents: a network meta-analysis. <i>JAMA Psychiatry</i>, 76(1), pp. 41&#8211;50. DOI: 10.1001/jamapsychiatry.2018.3070",
    ]
    for r in refs:
        s.append(Paragraph(r, REF_ITEM))

    s.append(sp(0.6))
    s.append(HRFlowable(width="100%", thickness=0.4, color=MUTED, spaceAfter=4))
    s.append(Paragraph("Module 4 &#8212; Child and Adolescent Mental Health &nbsp;&#8226;&nbsp; Assignment Part B &nbsp;&#8226;&nbsp; Student 5779906", FOOT))

    doc.build(s, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Done: {OUTPUT}")

build()
