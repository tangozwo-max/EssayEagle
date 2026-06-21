# Essay Incorporation Plan — Elicit Run 2 (Social Media)

**Project:** Module 4 Part B — *Anxiety in Children and Adolescents: A Systemic Disorder*
**Source:** `04 Research/elicit/report2/Elicit report run 2.md` + RIS (14 studies)
**Author:** Jackie (evidence) / Steven (critical analysis), reviewed by Pascal
**Date:** 2026-06-06
**Status:** PROPOSAL — not yet applied to `06 Drafting/make_essay.py`. Awaiting sign-off.

---

## 1. The one-paragraph verdict

Run 2 does **not** overturn the essay's existing position — it **strengthens and sharpens it**. The thesis already
argues that *general* social-media use is a weak/contested cause while *mechanism-specific* exposure (problematic use,
social comparison, cyberbullying) is the real signal. Every well-designed study in this batch points the same way.
The highest-value additions give the essay (a) its first **adolescent-specific, directional, longitudinal** result on
problematic use, (b) a **well-powered null** that hardens the "general use is weak" claim, and (c) a chance to fold in
your "kids don't play outside / lost real friendships / sedentary screens" idea — **but only with an honest caveat**,
because the best evidence says that harm runs through *social comparison*, not through *displaced physical activity*.

> ⚠️ **Two data-quality catches from full-text verification (why we scanned the studies):**
> 1. The RIS entry labelled **"Li et al. 2025, *The Lancet*… N=8.2 million… loneliness after 2011"** is a **mislabel**.
>    That abstract is actually **Twenge et al. (2019)**, *J. Soc. Pers. Relationships*. We use the correct attribution below.
> 2. **Plackett et al.** is tagged *The Lancet* in the RIS — that is a **conference abstract**. The citable version of
>    record is **JMIR (2023), 25, e43213**. We cite the JMIR paper.
> 3. **Lee et al.** version of record is **2026, 27(2), 391–406** (Elicit's "2025" = online-first). Same year-of-record
>    issue we hit with Shannon — flagging so we don't repeat that error.

---

## 2. What to ADD (recommended — high value, verified)

### A. Gingras et al. (2023) → Section 3.2 *(problematic use, the strongest single add)*
Adolescent-specific (N=257, ages 13→14), two-wave **cross-lagged** panel: **problematic use predicted later anxiety
(β = .16, p = .010); the reverse did not hold.** This is the essay's first piece of *directional, adolescent,
anxiety-specific* longitudinal evidence — it upgrades the problematic-use claim that currently leans only on Shannon
(2022, cross-sectional, young adults).

### B. Plackett et al. (2023, JMIR) → Section 3.3 *(the well-powered null)*
UK Understanding Society cohort (N=3,228, ages 10–15). In adjusted models, **time on social media at 12–13 did not
predict mental-health difficulties at 14–15.** A high-quality null that strengthens the "general-use signal collapses
when measured prospectively" argument already carried by Odgers & Jensen (2020) and Tang et al. (2021).

### C. Twenge et al. (2019) + Boers et al. (2019) → ONE hedged sentence in Section 3.3 *(your "outdoor play / friendships" idea, done safely)*
- **Twenge (2019):** the generation reaching adolescence in the 2010s spends markedly **less time face-to-face** and
  reports **rising loneliness** (N=8.2M cohorts). → gives you the "no real friendships / less in-person contact" point.
- **Boers (2019):** directly tested the **displacement hypothesis** (screens displacing exercise) and **rejected it** —
  no screen-time↔exercise association; the link to symptoms ran through **upward social comparison**, not reduced activity.
- **Net:** present displacement as a *proposed pathway to loneliness*, explicitly **not** an established activity-mediated
  cause of anxiety. This both honours your intuition and earns postgraduate critical-analysis credit (the rubric's
  highest-weight criterion) instead of joining the screen-time moral panic.

---

## 3. What to ADD only if word budget allows (optional)

| Study | Where | Why optional |
|---|---|---|
| **Lee et al. (2026)** — 27 longitudinal studies, cyberbullying→anxiety **r=.23** | §3.2/§3.3 cyberbullying | Adds *longitudinal* robustness to the existing Li, Q. (2025) Meta-SEM. Honest "weak but consistent" framing. |
| **Li, S.H. et al. (2025, BJC)** — screen time vs anx/dep, *maladaptive* use matters | §3.3 (beside Tang 2021) | Same research group as Tang (2021); empirical follow-up. **Requires disambiguating** the two 2025 "Li" cites. |

---

## 4. What to REJECT (and why — so the file shows the reasoning)

| Study | Reason not used |
|---|---|
| Yang et al. (2023); Kohler et al. (2021) | Experimental causal evidence for the comparison mechanism — but **undergraduates/adults, not minors**. Citing adult lab studies as evidence about children is a marker red flag. The mechanism is already carried by Khetawat & Steele (2023). |
| Molero et al. (2022) | Cross-sectional cyberbullying meta — **superseded** by Lee's longitudinal meta. |
| Fahy (2016); Rose & Tynes (2015); van Zalk (2018); Marciano (2020) | Individual cohorts / bidirectionality nuance — **subsumed** by the Lee meta; would over-detail a tight essay. |
| Vidyawati (2024); van Schalkwyk et al. (2017) | Body-image / ASD-friendship niche — **off-thesis** for this essay. |

---

## 5. Exact draft edits (apply to `06 Drafting/make_essay.py`)

> Page-range dashes shown as normal "–" here; in `make_essay.py` use the HTML entity `&#8211;` to match house style.

### 5.1 New reference-list entries (insert alphabetically into `refs = [...]`)

```
Boers, E., Afzali, M.H., Newton, N. and Conrod, P. (2019) Association of screen time and depression in
adolescence. JAMA Pediatrics, 173(9), pp. 853–859. DOI: 10.1001/jamapediatrics.2019.1759

Gingras, M.-P., Brendgen, M., Beauchamp, M.H. et al. (2023) Adolescents and social media: Longitudinal links
between types of use, problematic use and internalizing symptoms. Research on Child and Adolescent Psychopathology,
51(11), pp. 1641–1655. DOI: 10.1007/s10802-023-01084-7

Lee, J., Choo, H., Zhang, Y. et al. (2026) Cyberbullying victimization and mental health symptoms among children
and adolescents: A meta-analysis of longitudinal studies. Trauma, Violence, & Abuse, 27(2), pp. 391–406.
DOI: 10.1177/15248380241313051

Plackett, R., Sheringham, J. and Dykxhoorn, J. (2023) The longitudinal impact of social media use on UK
adolescents' mental health: A longitudinal observational study. Journal of Medical Internet Research, 25, e43213.
DOI: 10.2196/43213

Twenge, J.M., Spitzberg, B.H. and Campbell, W.K. (2019) Less in-person social interaction with peers among U.S.
adolescents in the 21st century and links to loneliness. Journal of Social and Personal Relationships, 36(6),
pp. 1892–1913. DOI: 10.1177/0265407519836170
```
Optional (only if §3.3 Li, S.H. add is taken):
```
Li, S.H., Batterham, P.J., Whitton, A.E. et al. (2025) Cross-sectional and longitudinal associations of screen
time with adolescent depression and anxiety. British Journal of Clinical Psychology, 64, pp. 873–887.
DOI: 10.1111/bjc.12547   [issue no. to confirm at final audit]
```

### 5.2 In-text edits

**Edit 1 — §3.2 (Gingras).** In the "problematic use" paragraph, after `…(Shannon et al., 2022).` insert:

> In adolescents specifically, two-wave longitudinal data indicate that problematic use predicts later anxiety while
> the reverse does not hold, which begins to establish direction rather than mere co-occurrence (Gingras et al., 2023).

**Edit 2 — §3.3 (Plackett).** After `…the direction of causation remains unresolved (Odgers and Jensen, 2020).` insert:

> In a well-powered UK cohort, time spent on social media at ages 12–13 did not predict mental-health difficulties
> two years later, underscoring how weak the general-use signal becomes once exposure is measured prospectively
> (Plackett et al., 2023).

**Edit 3 — §3.3 (Twenge + Boers — your displacement/friendship idea).** Add as a new sentence pair near the end of §3.3,
before the asymmetric-conclusion sentence:

> A further proposed pathway — that screens displace in-person contact, leaving adolescents lonelier and less active —
> has cohort-level support, since the cohorts reaching adolescence in the 2010s spend markedly less time face-to-face
> and report rising loneliness (Twenge et al., 2019). The activity-displacement version of this account is not borne
> out, however: screen time shows no association with reduced exercise, and its link to symptoms runs instead through
> social comparison (Boers et al., 2019). The displacement story is therefore better read as a route to loneliness than
> as an established cause of anxiety.

**Edit 4 — OPTIONAL — §3.2 (Lee) + disambiguation.** If Lee is added, append to the cyberbullying sentence:

> …diminished social support (Li, Q. et al., 2025), an association that longitudinal syntheses confirm holds
> prospectively, if modestly, over time (Lee et al., 2026).

…and **change every existing `(Li et al., 2025)` → `(Li, Q. et al., 2025)`** (and the ref-list head to `Li, Q.,`) to
disambiguate from Li, S.H. (2025) if 5.1-optional is also taken.

### 5.3 Source-block (green box) additions
Add matching `(key, citation, cite_for)` tuples to the §3.2 and §3.3 `source_block([...])` calls:
- §3.2: `SM-3` Gingras (2023) — "Adolescent longitudinal: problematic use → later anxiety (β=.16), not reverse (CLPM, n=257)."
- §3.3: `ST-2` Plackett (2023) — "Well-powered UK cohort null: SM time at 12–13 ≠ later difficulties (n=3,228)."
- §3.3: `DISP-1` Twenge (2019) — "Cohort decline in face-to-face interaction; loneliness rose post-2011 (n=8.2M)."
- §3.3: `DISP-2` Boers (2019) — "Displacement hypothesis rejected; harm runs via social comparison, not lost exercise (4-yr, n=3,826)."

---

## 6. Word-budget note
Edits 1–3 add ≈ 110 words. Current draft ≈ 1,669 / 2,000 → ≈ 1,780 after. Comfortably within limit and helps close the
P3 "restore toward ~2,100" gap. Adding the optional Lee + Li, S.H. material would add ≈ 40 more (≈ 1,820).
