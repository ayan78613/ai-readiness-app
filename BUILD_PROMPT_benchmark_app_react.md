# Build Prompt: Kestra AI Readiness Benchmark App (React + Local API + SQLite)

*Supersedes the earlier Python/Flask version of this prompt. This version specifies a React frontend hosted on a local port, a Node.js local API backend, Kestra-branded "shiny/glossy" professional styling, and a dashboard covering the full 28-KPI management framework in addition to assessment analytics.*

Paste everything below into your coding assistant (Claude Code, Cursor, etc.) as the build spec. It's self-contained — the questions, scoring logic, data model, and KPI list are all defined here so nothing needs to be invented.

---

## PROMPT START

Build a local web application called the **Kestra AI Readiness Benchmark App**: employees take a structured AI-readiness self-assessment, every submission is scored and server-timestamped automatically, and a management dashboard shows both the assessment analytics and the full 28-KPI tracking framework. Everything is stored on local disk — this is an internal tool for a FINRA-regulated broker-dealer, so it must run fully offline with zero external network calls at runtime.

### 1. Architecture & local hosting

- Monorepo with two folders:
  - `/server` — Node.js + Express + `better-sqlite3`, a REST API, no external network calls.
  - `/client` — React (Vite + React; TypeScript preferred if you default to it, plain JS is fine otherwise).
- `client` runs on a local dev port, default **`http://localhost:5173`**, started with `npm run dev` (Vite). Configure Vite's dev-server proxy so requests to `/api/*` forward to the backend.
- `server` runs on a local port, default **`http://localhost:4000`**, started with `npm run start` (or `node server.js`).
- Add a root-level `npm run dev` (using `concurrently` or similar) that starts both with a single command after `npm install` at the root and in each subfolder.
- CORS on the server should only allow the local client origin — this is an internal tool, not a public service.
- All fonts/icons must be bundled locally (self-hosted in `/client/public` or via an npm package) rather than loaded from a live CDN, so the app works with no internet connection after install.
- No analytics, telemetry, or third-party API calls anywhere in the stack.

### 2. Frontend styling — professional, "shiny/glossy," Kestra-branded

Use whatever component approach you like (MUI, Chakra, Tailwind, or hand-rolled CSS) — the important part is the visual result described below.

**Brand palette.** I could not pull Kestra Financial's exact production CSS (their site — kestrafinancial.com — renders via client-side JS, so it wasn't scrapeable). The palette below is sourced from a third-party brand-asset aggregator (Brandfetch) for kestrafinancial.com, not Kestra's internal style guide — treat it as a strong, well-reasoned default, and swap in exact values if/when the real brand guide is available. (Note: "Kestra" the workflow-orchestration software company, kestra.io, is a completely different business — don't pull its branding by mistake.)

| Role | Color | Hex |
|---|---|---|
| Brand accent (primary) | Gold ("Tussock") | `#C09A4F` |
| Brand secondary | Slate blue ("Horizon") | `#57849B` |
| Body text / ink | Dark gray ("Tundora") | `#4A4A4A` |
| Surface | White | `#FFFFFF` |

Derive supporting tints/shades of the gold and blue programmatically for hover, gradient, and disabled states, rather than introducing unrelated colors.

**What "shiny and glossy, but professional" means concretely:**
- A dark, elegant header/nav bar (deep charcoal or navy-tinted dark — not pure black) with a thin gold accent underline on the active nav item.
- Cards with soft elevation: subtle box-shadow, 12–16px rounded corners, a faint 1px hairline border, gentle hover lift (`translateY` + increased shadow) on interactive cards.
- A restrained gold gradient (e.g. `linear-gradient(135deg, #C09A4F, #D8B876)`), used sparingly on primary CTA buttons, the hero score ring/gauge, and active-state highlights — not on large backgrounds. Keep big surfaces white/light-gray so it reads premium rather than gaudy.
- Clean sans-serif typography (self-hosted, e.g. Inter or similar for body/UI; a slightly heavier weight or a refined serif for headings/hero numbers is fine). Generous whitespace, clear hierarchy: large hero numbers for headline KPIs, small letter-spaced caps for section labels.
- Smooth, subtle transitions (150–250ms ease) on hover/focus. No bouncy or jarring motion.
- **Keep the glossy treatment to UI chrome only** — headers, cards, buttons, badges, the hero score display. Chart data marks (bars, lines, points) must stay flat, single-hue, and accessible; no gradients or shine on the data itself, since that makes charts harder to read accurately. Status colors (see §6) are semantic, not decorative — always pair a status color with a text label or icon, never color alone.
- Responsive down to laptop width; the dashboard's primary target is a wide-desktop layout since this is an internal admin-style tool.

### 3. Data model (Express API → SQLite file `ai_readiness.db`)

**Table `assessments`** — one row per submission, append-only (never edited/overwritten after insert — this is what makes trend tracking meaningful):

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `employee_id` | TEXT | Initials/ID, or an opaque token in anonymous mode (config flag, default anonymous) |
| `function` | TEXT | `Data Engineering` \| `Data Architecture` \| `QA Engineering` \| `PMO` \| `Product Owner` \| `Support` |
| `round_label` | TEXT | e.g. `Baseline`, `Month 4`, `Month 6`; default `Baseline` |
| `submitted_at` | TEXT (ISO 8601 with offset) | **Set by the server at submission time — never accept a client-supplied timestamp.** This is the "as-of" date shown wherever results appear. |
| `answers_json` | TEXT (JSON) | `{q1: 75, q2: 50, ..., q28: null}` — 0/25/50/75/100 or null if not applicable to this respondent's module |
| `usage_score`, `delegation_score`, `context_score`, `discernment_score`, `compliance_score`, `training_score`, `mindset_score` | REAL | Computed at submission time |
| `composite_score` | REAL (0–100) | Weighted average, see §5 |
| `band` | TEXT | `Not Yet Started` \| `Emerging` \| `Accelerating` \| `Leading` |
| `functional_score` | REAL (0–100) | Average of the respondent's 2 role-module answers |

**Table `kpi_records`** — append-only time series for the 28-KPI management framework (§6), so KPIs that aren't derived from the assessment (training completion, incident counts, tool adoption, etc.) can also be tracked and charted over time:

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `kpi_key` | TEXT | Stable slug, e.g. `weekly_active_usage_rate` |
| `category` | TEXT | One of the 6 categories in §6 |
| `kpi_name` | TEXT | |
| `definition` | TEXT | |
| `data_source` | TEXT | |
| `baseline_value` | TEXT | |
| `target_value` | TEXT | The 6-month target (free text — targets are a mix of numeric and qualitative, e.g. "100% by Month 3") |
| `current_value` | TEXT | Latest known actual |
| `status` | TEXT | `Not started` \| `On track` \| `At risk` \| `Off track` \| `Complete` |
| `owner` | TEXT | |
| `recorded_at` | TEXT (ISO 8601) | **Server-set.** Every update to a KPI's value/status inserts a NEW row rather than overwriting, so the dashboard can chart each KPI's history, not just its latest value. |

On first launch, if the DB doesn't exist, create both tables and seed `kpi_records` with one initial row per KPI from §6 (category, kpi_name, definition, data_source, target_value pre-filled; baseline_value/current_value blank, status = `Not started`).

### 4. The assessment: dimensions, weights, and full question bank

20 core questions across 7 weighted dimensions (weights sum to 100%, define `composite_score`), plus 4 role-specific modules of 2 questions each. Every employee answers the 20 core questions plus only the 2-question module matching their `function` (22 questions, ~8–10 minutes). Options map to scores 0/25/50/75/100 (Strongly disagree/Never/None → Strongly agree/Constantly/Extensive), except where custom option labels are noted.

**Dimension 1 — Usage & Frequency (10%) — q1–q3**
1. How often do you currently use AI tools (e.g. Claude, ChatGPT, Copilot, or internal tools) as part of your work at Kestra? *(Never / Rarely — a few times a month / Sometimes — a few times a week / Often — daily / Constantly — it's core to how I work)*
2. Approximately what percentage of your weekly tasks currently involve some form of AI assistance? *(None / ~10% / ~25% / ~50% / 75%+)*
3. How many distinct AI use cases have you tried in your role? *(None / 1 / 2–3 / 4–5 / 6+)*

**Dimension 2 — Delegation & Task Judgment (15%) — q4–q6**
4. I can clearly identify which parts of my workflow are appropriate to delegate to AI versus which must remain fully human-reviewed, given our regulatory environment.
5. I select the right tool or model for a given task rather than defaulting to a single tool for everything.
6. I understand the limits of AI in my specific function well enough to know when NOT to use it.

**Dimension 3 — Context-Setting (15%) — q7–q9**
7. When I use AI, I provide sufficient context — background, constraints, audience, desired format — rather than a bare instruction.
8. I iterate and refine my prompts or requests when the first AI output isn't right, rather than abandoning the tool.
9. I have used AI for multi-step or complex tasks relevant to my role, not just single quick queries.

**Dimension 4 — Discernment & Verification (20%) — q10–q12**
10. I routinely verify AI-generated outputs (numbers, code, text, analysis) against source data or my own expertise before using them.
11. I have personally caught an instance where AI produced inaccurate or misleading output.
12. I review the reasoning behind an AI output, not just accept the final answer at face value.

**Dimension 5 — Data Handling & Regulatory Awareness (20%) — q13–q16**
13. I know which categories of client or firm data (e.g. PII, account numbers, non-public personal information) are NOT permitted to be entered into AI tools.
14. I am aware of which AI tools are formally approved and vetted by Kestra for business use, versus tools I should not use with work data.
15. If I used AI to help produce a client-facing communication, report, or supervisory document, I would know what disclosure or review steps are required before it goes out.
16. I understand that AI-assisted work I produce is still subject to the same supervisory, recordkeeping, and audit requirements as work done without AI.

**Dimension 6 — Training & Enablement (10%) — q17–q18**
17. How much formal training or guidance have you received on using AI at work? *(None / A little — self-taught only / Some — a session or two / Solid — structured training / Extensive — ongoing training & support)*
18. I know who to contact at Kestra with questions about appropriate AI use, tooling, or compliance concerns.

**Dimension 7 — Mindset & Change Readiness (10%) — q19–q20**
19. I see AI as a tool to help me focus on higher-value parts of my job, not as a threat to my role.
20. I am comfortable experimenting with new AI capabilities as they become available, rather than waiting to be told exactly what to do.

**Role Module A — Data Engineering & Data Architecture (function ∈ {Data Engineering, Data Architecture}) — q21–q22**
21. I have used, or would be comfortable using, AI to assist with data pipeline development, ETL/ELT scripting, documentation, or data quality checks.
22. When evaluating or designing data architecture, I consider AI-readiness of data (structure, lineage, metadata, access controls) as part of the design.

**Role Module B — QA Engineering (function = QA Engineering) — q23–q24**
23. I have used, or would be comfortable using, AI to help generate test cases, test scripts, or synthetic test data.
24. I trust AI-assisted testing enough to rely on it for regression coverage, provided there is human review of critical or high-risk test paths.

**Role Module C — PMO & Product (function ∈ {PMO, Product Owner}) — q25–q26**
25. I have used, or would be comfortable using, AI to help draft status reports, RAID logs, user stories, requirements, or sprint/release documentation.
26. I use AI to support estimation, risk identification, or prioritization, while retaining final judgment myself.

**Role Module D — Support (function = Support) — q27–q28**
27. I have used, or would be comfortable using, AI to help triage, summarize, or draft responses to support tickets or client inquiries.
28. I know the boundaries of what AI-drafted, client-facing support responses need human review before being sent — especially anything touching account or transaction details.

### 5. Scoring logic (implement exactly)

```
dimension_score(dim) = average(scores of that dimension's questions)   // ignore nulls

composite_score = round(
    usage_score       * 0.10 +
    delegation_score  * 0.15 +
    context_score     * 0.15 +
    discernment_score * 0.20 +
    compliance_score  * 0.20 +
    training_score    * 0.10 +
    mindset_score     * 0.10
)

band =
    "Not Yet Started" if composite_score < 25
    "Emerging"        if composite_score < 50
    "Accelerating"    if composite_score < 75
    "Leading"         otherwise   // >= 75

functional_score = average(the respondent's 2 role-module answers)   // reported separately, NOT part of composite_score
```

### 6. The KPI framework — seed data for `kpi_records` (28 KPIs, 6 categories)

Format: **KPI name** — definition — data source — target.

**I. Adoption & Usage**
- **Weekly Active AI Usage Rate** — % of team using an approved AI tool 3+ times/week — Pulse survey / tool admin logs — 30% → 75%
- **AI Use-Case Breadth** — Avg. number of distinct AI use cases adopted per employee — Assessment Q3 — Baseline → +3
- **Assessment Participation Rate** — % of team completing the baseline readiness assessment — Assessment tracker — 100% by Month 1
- **Approved-Tool Adoption Ratio** — % of AI usage on approved/vetted tools vs. shadow AI — Tool logs / IT audit — 95%+

**II. Skill & Competency**
- **Composite AI Readiness Score** — Org-wide average composite score (0–100) — Assessment (7 core dimensions) — Baseline +20 pts
- **% in Accelerating / Leading Band** — Share of team scoring 50+ — Assessment — Baseline → 70%+
- **Dimension Sub-Score Trend** — Avg. score per dimension, tracked over time — Assessment — All dimensions improving
- **Cross-Function Skill Gap** — Spread between highest- and lowest-scoring function — Assessment by function — Gap narrows 30%+

**III. Training & Enablement**
- **Formal Training Completion Rate** — % completed role-specific AI training — LMS / training tracker — 100% by Month 3
- **Training Hours Delivered / Employee** — Avg. hours of structured AI training received — Training tracker — 5+ hours
- **Role Playbooks Published** — # of role-specific AI usage guides/SOPs published — Internal docs — 1 per function by Month 2
- **"Know Who to Ask" Rate** — % who can name who to contact for AI questions — Assessment Q18 — 100%

**IV. Governance, Risk & Compliance**
- **Approved Tool List Awareness** — % correctly identifying approved vs. unapproved tools — Assessment Q14 — 100%
- **Data Handling Policy Awareness** — % correctly identifying prohibited data categories for AI input — Assessment Q13 — 100%
- **AI Vendor Risk Assessments Completed** — # of AI tools/vendors formally reviewed (FINRA Reg. Notice 21-29 criteria) — Compliance/vendor risk log — 100% of active tools by Month 2
- **Use-Case Risk Classification Coverage** — % of active AI use cases with a documented risk tier — AI use-case register — 100% by Month 3
- **Supervisory Review Coverage** — % of AI-assisted client-facing/supervisory output reviewed per policy — Compliance review log — 100%
- **AI-Related Compliance Incidents** — Count of AI-related compliance incidents or near-misses — Incident log — 0, trending down
- **Audit Readiness Checklist Score** — Internal self-assessment vs. FINRA AI governance expectations — Internal audit checklist — Pass by Month 6

**V. Productivity & Business Impact**
- **Self-Reported Time Saved / Week** — Avg. hours/week saved via AI assistance — Pulse survey — 3–5 hrs/employee by Month 6
- **Cycle Time Improvement by Function** — % change in key workflow cycle times — Function-owned metrics/ticketing data — 10–20% improvement
- **Quality Impact Metric (QA)** — Defect escape rate / production incident rate, tracked with review coverage — QA/defect tracker — Stable or improving
- **Estimated Productivity Gain / ROI** — Directional estimate of value from AI-assisted work — Manager estimate + time-saved data — Benchmark vs. Deloitte Pioneers (>10% ROI)

**VI. Sentiment, Trust & Leadership**
- **AI Sentiment Score** — % of team viewing AI as an opportunity rather than a threat — Pulse survey — 80%+ positive/neutral
- **Manager AI Usage Rate** — % of managers/leads actively using and modeling AI use — Pulse survey / usage logs — 90%+
- **Perception Gap Index** — Gap between leader-estimated and actual employee AI usage — Cross-referenced survey data — Gap narrows toward 0
- **AI Enablement Satisfaction** — Employee satisfaction with AI tools, training, and support provided — Pulse survey — Track and improve each cycle

### 7. Required screens

1. **New Assessment** — employee ID/initials (or anonymous token per config), function dropdown, `round_label` field (default `Baseline`), the 20 core questions, then the 2 role-module questions auto-selected by function. Validate all applicable questions are answered before enabling submit. On submit: compute scores server-side, stamp `submitted_at` server-side, insert the row, then show a results view.

2. **Results view** (shown after every submission, and reachable again later) — composite score, band badge, dimension scores, functional score, and, prominently, **"Assessment completed on: {submitted_at formatted in the viewer's local time}."** Full chart list for this screen is in §8, items 1–3 — build all three, not just a summary number.

3. **My History** — for a returning `employee_id`, their composite score and per-dimension trend across past submissions, each point/row labeled with its date and `round_label`. Full chart list in §8, items 4–5.

4. **Admin Dashboard — the centerpiece screen, must surface every KPI and measure:**
   - A persistent banner: **"Data as of {the most recent `submitted_at`/`recorded_at` across both tables}."**
   - **Zone A — Assessment Analytics** (from `assessments`): headline stats plus the full chart set in §8 items 6–12 (band distribution, dimension averages, composite-by-function, the function×dimension heatmap, trend-over-time, and score distribution). Filterable by `round_label`, date range, and function — filters must re-render the charts, not just the tables.
   - **Zone B — KPI Framework** (from `kpi_records`): all 28 KPIs, grouped under their 6 category headings, each as a row/card showing baseline, target, current value, status badge, owner, and the date it was last recorded — plus the KPI status charts in §8 items 13–15 (overall status breakdown, per-category status breakdown, per-KPI trend sparklines). An "Update KPI" action (inline edit or modal) inserts a new `kpi_records` row (never overwrites) — this is how the team keeps the dashboard current over time, and it's what powers the sparklines.
   - Export button: download all `assessments` and `kpi_records` data as CSV and/or JSON.

5. **KPI status colors** — semantic, not brand colors, always paired with a text label: On track = green, At risk = amber, Off track = red, Complete = the brand blue (`#57849B`), Not started = neutral gray.

### 8. Charts & graphs — required inventory

This is an exhaustive list — every chart below must be present and working. Don't substitute a table for a chart or drop one because it seems redundant with a stat tile; management explicitly wants full visual coverage of the assessment analytics and the KPI framework, not just numbers in a list.

**General rules for every chart (apply throughout):**
- Recommended library: **Recharts** (composable, SVG-based, easy to theme to the brand palette) for bar/line/radial charts. The one grid/heatmap chart below doesn't need a separate charting library — build it as a simple colored CSS-grid/table.
- One hue per single-series magnitude chart — a **sequential** ramp (light → dark) of the brand blue `#57849B`. Never a rainbow of unrelated colors across bars that represent the same measure.
- **Never a dual-axis chart** (two y-scales on one plot). If two measures differ in scale or unit, use two separate charts, small multiples, or index both to a common base.
- Any chart with 2+ distinct series gets a visible legend; label sparingly and directly (endpoints/extremes), never a number crammed onto every single point/bar.
- Every chart has a hover tooltip with the exact value, its label, and — where relevant — the target/benchmark for comparison.
- Status and band colors are semantic (see §6/§7) and are always paired with a text label or icon — never color alone.
- Add a "view as table" toggle for every chart on the Admin Dashboard — accessibility fallback and a way to get exact numbers.
- All Zone A charts must visibly update when the dashboard's `round_label` / date-range / function filters change — filtering must actually re-render the charts, not just the tables underneath them.

**On the Results view (one employee, one submission):**
1. **Composite score meter** — a radial/donut gauge (ratio against the 0–100 max), brand gradient fill, band label and numeric score shown in the center. (This is the one place a gauge/ring form is appropriate — it's a single ratio against a limit.)
2. **Dimension scores** (7) — horizontal bar chart, single-hue sequential blue fill, one bar per dimension, value labeled at the bar's end.
3. **Functional score** — a stat tile (not a full chart) showing the number, clearly labeled as separate from the composite.

**On My History (one employee, across submissions):**
4. **Composite score over time** — line chart, one point per past submission, x-axis = submission date, y-axis fixed 0–100, latest point direct-labeled.
5. **Dimension trends** — 7 small sparkline/line charts in a grid (one per dimension) so an employee can see which specific skill is actually improving, not just the composite.

**On the Admin Dashboard — Zone A (Assessment Analytics):**
6. **Headline stat tiles** — org composite average, participation count, % Accelerating/Leading. (Stat tiles, not mini bar charts — each is a single current value.)
7. **Band distribution** — column chart, bars ordered left→right Not Yet Started → Emerging → Accelerating → Leading, colored with the 4 band semantic colors (not brand gold/blue), each bar labeled with count and %.
8. **Dimension averages** (7) — horizontal bar chart, single-hue sequential blue fill, org-wide average per dimension.
9. **Composite score by function** (6 functions) — column chart, single-hue sequential blue fill; headcount-assessed for that function shown in the tooltip.
10. **Function × Dimension heatmap** — a 6-row (function) × 7-column (dimension) grid, each cell shaded on a single-hue sequential blue ramp by that function's average score on that dimension, value shown in the cell. This is the single most useful view for management — where each team is strong or weak, at a glance. Build it as a plain colored grid/table, not a heavy library.
11. **Composite score trend over time** — line chart across assessment rounds/dates (Baseline, Month 4, Month 6, …). Use the **emphasis** form: one accent-colored line for the org average, with per-function lines (if shown at all) rendered thin and gray rather than as six competing legend colors.
12. **Composite score distribution** — histogram (5–8 bins spanning 0–100) showing how many employees fall in each score range, single-hue sequential fill.

**On the Admin Dashboard — Zone B (KPI Framework):**
13. **KPI status breakdown, overall** — one horizontal stacked bar (part-to-whole) showing the count of the 28 KPIs in each status (Not started / On track / At risk / Off track / Complete), using the status semantic palette from §7.
14. **KPI status breakdown, by category** — 6 small stacked bars (same status palette), one per KPI category, so management can immediately see which category (e.g. Governance, Risk & Compliance) is lagging behind the others.
15. **Per-KPI trend sparkline** — for any KPI whose `current_value` history is numeric/percentage, show a small inline sparkline (roughly 12–20pt tall) next to that KPI's row, plotting its value across its recorded history. For KPIs with qualitative/text-only values, skip the sparkline and just show the current value and status badge.

### 9. Non-functional requirements

- Zero external network calls at runtime; both `client` and `server` run fully offline after `npm install`.
- All timestamps generated server-side, stored ISO 8601, displayed in the viewer's local time.
- SQLite data persists across restarts of both processes.
- `assessments` and `kpi_records` are both append-only — updates always insert a new timestamped row rather than overwriting, which is what makes every trend/history view meaningful.
- Config flag for anonymous vs. attributed assessment identity (default anonymous).
- Basic client- and server-side validation before any write.
- CSV/JSON export from the dashboard.

### 10. Acceptance criteria

- [ ] `npm run dev` at the repo root starts both the React client (local port) and the Express API (local port) with a single command; the app is reachable in the browser with no other manual steps.
- [ ] Submitting an assessment creates an immutable row with a server-generated `submitted_at` (client cannot set or spoof it); composite score and band match a hand-calculated example using the weights/thresholds in §5.
- [ ] The completion date is visibly displayed on the results view, history view, and dashboard.
- [ ] Multiple submissions from the same `employee_id` produce a visible history/trend rather than overwriting each other.
- [ ] The Admin Dashboard renders both Zone A (assessment analytics) and Zone B (all 28 KPIs across their 6 categories), and editing a KPI inserts a new `kpi_records` row rather than mutating the old one.
- [ ] Visual design follows the Kestra palette and the "glossy chrome / flat accessible data" split described in §2 — verify by actually opening the running app and reviewing it, not just by reading the code.
- [ ] The app makes zero external network calls once dependencies are installed (verify with the browser network tab / by disconnecting from the internet and confirming it still works).
- [ ] Data persists after restarting both the client and server processes.
- [ ] Data exports to CSV/JSON from the dashboard.
- [ ] All 15 charts/graphs listed in §8 are present and rendering real data (not placeholders): 3 on the Results view, 2 on My History, 7 in Dashboard Zone A, 3 in Dashboard Zone B — confirm by checking each one off against that list while the app is running.
- [ ] No chart uses a dual axis; every multi-series chart has a legend; every chart has a working hover tooltip; the Function × Dimension heatmap and both KPI status stacked-bars use the specified color rules, not arbitrary colors.

## PROMPT END

---

*Companion context: this implements the assessment and KPI framework defined in `Kestra_AI_Readiness_Program.docx` and is meant to become the living replacement for manually maintaining `Kestra_AI_Readiness_KPI_Tracker.xlsx` — once built, keep using the Excel workbook as an offline backup/export target if useful, via the app's CSV export.*
