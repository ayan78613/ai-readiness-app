import type { Assessment, Dimension } from '../types';
import { COMPARISON_TEMPLATES } from './externalBenchmarks';

export type Priority = 'high' | 'medium' | 'low' | 'positive';

export interface Recommendation {
  priority: Priority;
  title: string;
  detail: string;
  tag?: string;
  references?: number[]; // source numbers, keyed to SOURCES in externalBenchmarks.ts
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2, positive: 3 };

function sortAndCap(recs: Recommendation[], cap: number): Recommendation[] {
  return [...recs].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]).slice(0, cap);
}

// ---------- Individual / role-level ----------
// Detail text is a function of the person's live score, not a fixed string —
// each dimension pulls in the same cited external comparison points used on
// the Benchmark Report page, so the "why this matters" line changes with the
// data and stays traceable to a real source (see SOURCES in externalBenchmarks.ts).

const DIMENSION_TIPS: Record<string, { title: string; detail: (score: number) => string; kpiTag: string; references?: number[] }> = {
  usage: {
    title: 'Build a regular AI habit',
    detail: (score) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.usage.external;
      return `Your usage score is ${score.toFixed(0)}/100. Pick one recurring task — drafting, research, or summarization — and use an approved AI tool for it every time this week, rather than only reaching for it occasionally. Financial-services firms report weekly active usage rates of ${followers.value}% among "${followers.label}" firms vs. ${pioneers.value}% among "${pioneers.label}" — consistency, not occasional use, is what separates them.`;
    },
    kpiTag: 'Weekly Active AI Usage Rate',
    references: [1]
  },
  delegation: {
    title: 'Get clearer on what to delegate',
    detail: (score) =>
      `Your delegation-judgment score is ${score.toFixed(0)}/100. Review Kestra's role-specific guidance on which tasks are safe to hand to AI and which must stay fully human-reviewed. FINRA's 2026 oversight report specifically calls out clear supervisory boundaries for GenAI-assisted work as an exam focus area — this isn't just good practice, it's what examiners will look for.`,
    kpiTag: 'Role Playbooks Published',
    references: [4]
  },
  context: {
    title: 'Improve prompt context and iteration',
    detail: (score) =>
      `Your context-setting score is ${score.toFixed(0)}/100. Give AI more background, constraints, and desired format up front, and iterate on outputs instead of accepting the first draft as final. Datos Insights' 2025 survey of 300 capital-markets executives found use-case breadth is one of the widest gaps between AI leaders and laggards in this sector — this is where that gap starts closing.`,
    kpiTag: 'AI Use-Case Breadth',
    references: [3]
  },
  discernment: {
    title: 'Verify AI outputs before relying on them',
    detail: (score) =>
      `Your discernment score is ${score.toFixed(0)}/100. Make it a habit to check AI-generated numbers, code, or text against a source or your own expertise before using it in any deliverable. FINRA's 2026 oversight report treats supervisory review of GenAI output as a core control, not a nice-to-have.`,
    kpiTag: 'Supervisory Review Coverage',
    references: [4]
  },
  compliance: {
    title: 'Review the data-handling policy',
    detail: (score) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.governance.external;
      return `Your compliance-awareness score is ${score.toFixed(0)}/100. Confirm which data categories (PII, account numbers, NPI) are off-limits for AI tools and which tools are formally approved, before your next AI-assisted task — this is a regulatory requirement, not optional. Deloitte found only ${followers.value}% of "${followers.label}" financial-services firms report adequate governance readiness vs. ${pioneers.value}% of "${pioneers.label}" — awareness alone doesn't close that gap without formal tracking.`;
    },
    kpiTag: 'Data Handling Policy Awareness',
    references: [1, 4]
  },
  training: {
    title: 'Get structured training',
    detail: (score) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.training.external;
      return `Your training score is ${score.toFixed(0)}/100. Reach out to your team's AI point of contact for structured training — self-teaching alone tends to leave gaps in safe-use guidance. Deloitte's financial-services survey found firms citing themselves as "highly prepared" on AI talent jumped from ${followers.value} to ${pioneers.value} on their readiness index once training moved from ad hoc to structured.`;
    },
    kpiTag: 'Formal Training Completion Rate',
    references: [1]
  },
  mindset: {
    title: 'Build comfort experimenting',
    detail: (score) =>
      `Your mindset score is ${score.toFixed(0)}/100. Try one new AI capability this month in a low-stakes context, so you have that comfort built up before it matters on a deadline. A cross-industry study found roughly half of finance teams remain stuck in the middle of the AI-maturity curve — often due to hesitancy, not tooling. Building comfort early is what moves someone out of that middle.`,
    kpiTag: 'AI Sentiment Score',
    references: [2]
  }
};

const FUNCTION_TIPS: Record<string, string> = {
  'Data Engineering': 'Pilot AI-assisted pipeline documentation or data-quality checks on one low-risk pipeline this quarter.',
  'Data Architecture': "When you next evaluate or design an architecture, explicitly factor in AI-readiness of the data — structure, lineage, metadata, access controls.",
  'QA Engineering': 'Start generating test cases or synthetic test data with AI for one non-critical suite, with human review of the results before it counts toward regression coverage.',
  PMO: 'Draft your next status report, RAID log, or set of requirements with AI assistance, then edit — track the time it saves you.',
  'Product Owner': 'Use AI to support estimation or risk identification on your next planning cycle, while keeping final judgment with you.',
  Support: 'Use AI to draft — never send — responses to routine, non-account-specific tickets, with mandatory human review before anything goes out.',
  'Data Governance': 'Pick one active AI use case and walk it through your existing governance checklist — data classification, lineage, documentation — to spot gaps before they become findings.',
  'BI Developers': 'Use AI to draft your next query or dashboard, then verify the output against the source data before it ships to stakeholders — treat it as a first draft, not a final answer.',
  'Business Analyst': 'Use AI to draft your next set of requirements or a process map, then walk it past a stakeholder before treating it as final — it speeds up the first draft, not the judgment call.',
  'Data Analyst': 'Use AI for your next exploratory pass or statistical summary, then trace the key conclusions back to the raw data before they go into a report or decision.'
};

export function getIndividualRecommendations(assessment: Assessment, dimensions: Dimension[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const scoreOf = (col: string) => (assessment as any)[col] as number | null;

  const complianceScore = scoreOf('compliance_score') ?? 100;
  if (complianceScore < 75) {
    recs.push({
      priority: complianceScore < 50 ? 'high' : 'medium',
      title: DIMENSION_TIPS.compliance.title,
      detail: DIMENSION_TIPS.compliance.detail(complianceScore),
      tag: DIMENSION_TIPS.compliance.kpiTag,
      references: DIMENSION_TIPS.compliance.references
    });
  }

  const usageScore = scoreOf('usage_score') ?? 0;
  const discernmentScore = scoreOf('discernment_score') ?? 100;
  const governanceAvg = ((discernmentScore ?? 0) + (complianceScore ?? 0)) / 2;
  if (usageScore - governanceAvg > 25) {
    const [followers, pioneers] = COMPARISON_TEMPLATES.governance.external;
    recs.push({
      priority: 'high',
      title: "You're adopting faster than you're verifying",
      detail: `Your usage score (${usageScore.toFixed(0)}) is well ahead of your discernment/compliance average (${governanceAvg.toFixed(0)}). Slow down enough to verify outputs and confirm data-handling rules before scaling up how often you use AI. Deloitte found this exact gap — usage outrunning governance — is what separates "${followers.label}" firms (${followers.value}% adequately prepared) from "${pioneers.label}" firms (${pioneers.value}%) in financial services.`,
      tag: 'Discernment & Verification',
      references: [1]
    });
  }

  const ranked = dimensions
    .map((dim) => ({ dim, score: scoreOf(dim.column) ?? 0 }))
    .filter((d) => d.dim.key !== 'compliance')
    .sort((a, b) => a.score - b.score);

  for (const { dim, score } of ranked.slice(0, 2)) {
    if (score >= 65) continue;
    const tip = DIMENSION_TIPS[dim.key];
    if (!tip) continue;
    if (recs.some((r) => r.tag === tip.kpiTag)) continue;
    recs.push({
      priority: score < 40 ? 'high' : 'medium',
      title: tip.title,
      detail: tip.detail(score),
      tag: tip.kpiTag,
      references: tip.references
    });
  }

  if (assessment.functional_score !== null && assessment.functional_score < 50) {
    const tip = FUNCTION_TIPS[assessment.function];
    if (tip) {
      recs.push({
        priority: 'medium',
        title: `Role-specific: ${assessment.function} (scoring ${assessment.functional_score.toFixed(0)}/100)`,
        detail: tip,
        tag: assessment.function
      });
    }
  }

  if (assessment.band === 'Leading') {
    recs.push({
      priority: 'positive',
      title: "You're in the Leading band",
      detail: 'Consider mentoring a teammate who is earlier in their AI journey, or piloting a new use case for your function — your experience is a resource for the org.',
    });
  } else if (assessment.band === 'Not Yet Started') {
    recs.push({
      priority: 'medium',
      title: 'Take your first step',
      detail: 'Pick one approved AI tool and one recurring, low-risk task, and use it consistently for the next two weeks before expanding further.'
    });
  }

  return sortAndCap(recs, 4);
}

// ---------- Org-level ----------

const ORG_DIMENSION_TIPS: Record<string, { title: string; detail: (score: number) => string; references?: number[] }> = {
  usage: {
    title: 'Drive habitual usage',
    detail: (s) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.usage.external;
      return `Org-wide, Usage & Frequency is the weakest dimension (${s.toFixed(0)}). Have each function identify one recurring workflow and track weekly usage of an approved tool against it. Deloitte's financial-services survey found weekly usage rates of ${followers.value}% among "${followers.label}" firms vs. ${pioneers.value}% among "${pioneers.label}" — this is the dimension that moves fastest with a concrete workflow target.`;
    },
    references: [1]
  },
  delegation: {
    title: 'Clarify delegation boundaries',
    detail: (s) => `Delegation & Task Judgment is averaging ${s.toFixed(0)} org-wide. Publish or refresh role-specific guidance on what can be delegated to AI vs. what must stay human-reviewed — FINRA's 2026 oversight report names clear supervisory boundaries for GenAI-assisted work as a specific 2026 exam focus area.`,
    references: [4]
  },
  context: {
    title: 'Coach prompting craft',
    detail: (s) => `Context-Setting is averaging ${s.toFixed(0)}. A short workshop on providing context and iterating on outputs (rather than accepting first drafts) would move this quickly. Datos Insights' 2025 survey of 300 capital-markets executives found use-case breadth is one of the widest gaps between AI leaders and laggards in this sector.`,
    references: [3]
  },
  discernment: {
    title: 'Build verification habits',
    detail: (s) => `Discernment & Verification is averaging ${s.toFixed(0)}. Require a quick verification step — source-check or peer review — before AI output is used in any deliverable. FINRA's 2026 oversight report treats supervisory review of GenAI output as a core control.`,
    references: [4]
  },
  compliance: {
    title: 'Close the compliance-awareness gap',
    detail: (s) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.governance.external;
      return `Data Handling & Regulatory Awareness is averaging ${s.toFixed(0)} — this is a regulatory exposure, not just a skills gap. Redistribute the approved-tools list and prohibited-data guidance org-wide. Deloitte found only ${followers.value}% of "${followers.label}" FS firms report adequate governance readiness vs. ${pioneers.value}% of "${pioneers.label}" — the gap closes with formal tracking, not awareness alone.`;
    },
    references: [1, 4]
  },
  training: {
    title: 'Scale structured training',
    detail: (s) => {
      const [followers, pioneers] = COMPARISON_TEMPLATES.training.external;
      return `Training & Enablement is averaging ${s.toFixed(0)}. Self-teaching isn't closing the gap — stand up structured sessions and publish the role playbooks the KPI framework calls for. Deloitte's readiness index moved from ${followers.value} to ${pioneers.value} between "${followers.label}" and "${pioneers.label}" firms once training became structured rather than ad hoc.`;
    },
    references: [1]
  },
  mindset: {
    title: 'Address change resistance',
    detail: (s) => `Mindset & Change Readiness is averaging ${s.toFixed(0)}. Survey why teams are hesitant to experiment and circulate early wins from teams already using AI well. A cross-industry study found roughly half of finance teams remain stuck in the middle of the AI-maturity curve — hesitancy, not tooling, is usually the binding constraint.`,
    references: [2]
  }
};

export interface OrgRecommendationInput {
  dimAverages: { key: string; label: string; value: number }[];
  byFunction: { function: string; value: number; n: number }[];
  quadrant: { function: string; usage: number; governance: number; n: number }[];
  riskPareto: { category: string; atRiskCount: number; total: number }[];
  bandCounts: Record<string, number>;
  totalN: number;
  leadingPct?: number;
  govPct?: number;
}

export function getOrgRecommendations(input: OrgRecommendationInput): Recommendation[] {
  const { dimAverages, byFunction, quadrant, riskPareto, bandCounts, totalN, leadingPct, govPct } = input;
  if (totalN === 0) return [];

  const recs: Recommendation[] = [];

  if (leadingPct !== undefined && govPct !== undefined && leadingPct - govPct > 20) {
    const pioneerShare = COMPARISON_TEMPLATES.leadingShare.external[0];
    recs.push({
      priority: 'high',
      title: 'Self-assessed readiness is outrunning governed execution',
      detail: `${leadingPct}% of respondents self-report in the "Leading" band — ahead of the ${pioneerShare.value}% "${pioneerShare.label}" share Deloitte found across 542 financial-services executives. But only ${govPct}% of Governance KPIs are formally tracked "On track." Close this gap before citing the Leading-band number externally — a strong self-assessment isn't a substitute for tracked governance execution.`,
      tag: 'Governance execution',
      references: [1]
    });
  }

  const gapFunctions = quadrant
    .filter((q) => q.n > 0 && q.usage - q.governance > 20)
    .sort((a, b) => (b.usage - b.governance) - (a.usage - a.governance))
    .slice(0, 2);
  for (const f of gapFunctions) {
    recs.push({
      priority: 'high',
      title: `${f.function} is adopting faster than it's governing`,
      detail: `Usage (${f.usage.toFixed(0)}) is well ahead of governance readiness (${f.governance.toFixed(0)}) in ${f.function}. Prioritize compliance/verification training there before expanding use cases further.`,
      tag: f.function
    });
  }

  const topRisk = [...riskPareto].sort((a, b) => b.atRiskCount - a.atRiskCount)[0];
  if (topRisk && topRisk.atRiskCount > 0) {
    recs.push({
      priority: 'high',
      title: `${topRisk.category} needs attention`,
      detail: `${topRisk.atRiskCount} of ${topRisk.total} KPIs in this category are At risk or Off track. Review ownership and timelines this cycle.`,
      tag: topRisk.category
    });
  }

  const weakestDim = [...dimAverages].filter((d) => d.value > 0).sort((a, b) => a.value - b.value)[0];
  if (weakestDim) {
    const tip = ORG_DIMENSION_TIPS[weakestDim.key];
    if (tip) {
      recs.push({
        priority: weakestDim.value < 50 ? 'high' : 'medium',
        title: tip.title,
        detail: tip.detail(weakestDim.value),
        tag: weakestDim.label,
        references: tip.references
      });
    }
  }

  const scoredFunctions = byFunction.filter((f) => f.n > 0).sort((a, b) => a.value - b.value);
  const weakestFn = scoredFunctions[0];
  if (weakestFn && weakestFn.value < 50 && !gapFunctions.some((g) => g.function === weakestFn.function)) {
    recs.push({
      priority: 'medium',
      title: `${weakestFn.function} has the lowest composite score`,
      detail: `${weakestFn.function} is averaging ${weakestFn.value.toFixed(0)} across ${weakestFn.n} submission(s) — the lowest of any function. Consider a targeted enablement push there.`,
      tag: weakestFn.function
    });
  }

  const early = (bandCounts['Not Yet Started'] ?? 0) + (bandCounts['Emerging'] ?? 0);
  const leading = bandCounts['Leading'] ?? 0;
  if (early / totalN > 0.5) {
    recs.push({
      priority: 'medium',
      title: 'Org is still in early rollout',
      detail: `Over half of submissions (${early} of ${totalN}) are in the Not Yet Started or Emerging bands. Prioritize basic awareness and training before investing further in advanced governance work.`
    });
  } else if (leading / totalN > 0.5) {
    recs.push({
      priority: 'positive',
      title: 'Org has crossed into majority-Leading',
      detail: `${leading} of ${totalN} submissions are in the Leading band. Shift focus from driving adoption to tightening governance rigor and proving ROI.`
    });
  }

  return sortAndCap(recs, 7);
}
