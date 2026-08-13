// Static, cited external reference data for the Benchmark Report page.
// These numbers do NOT come from our database — they're published figures
// from named sources (see `sources` below), fixed until someone updates this
// file against a newer report. Only the "us" side of each comparison is
// computed live from the app's own data at render time.

export type Verdict = 'good' | 'warn' | 'bad';

export interface ExternalPoint {
  label: string;
  value: number;
}

export interface Comparison {
  title: string;
  note: string;
  unit: string;
  external: ExternalPoint[]; // one or two reference points, low to high
  caption: string;
  sourceRefs: number[];
}

// Verdict: compare `us` against the external points (assumed sorted ascending).
// >= highest external point => good; <= lowest => bad; in between => warn.
export function computeVerdict(us: number, external: ExternalPoint[]): { verdict: Verdict; text: string } {
  const sorted = [...external].sort((a, b) => a.value - b.value);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  if (us >= highest.value) return { verdict: 'good', text: `At or above ${highest.label} tier` };
  if (us <= lowest.value) return { verdict: 'bad', text: `At or below ${lowest.label} tier` };
  return { verdict: 'warn', text: `Between ${lowest.label} and ${highest.label}` };
}

// Comparison templates. `us` is filled in by the page from live data.
export const COMPARISON_TEMPLATES: Record<string, Comparison> = {
  leadingShare: {
    title: 'Share at the top maturity tier',
    note: 'Kestra "Leading" band vs. Deloitte FS "Pioneer" share',
    unit: '%',
    external: [{ label: 'Pioneers', value: 46 }],
    caption: 'Different units — individual staff self-assessment vs. firm-level executive classification.',
    sourceRefs: [1]
  },
  governance: {
    title: 'Governance & risk readiness',
    note: 'Governance KPIs "On track" vs. FS execs "adequately/highly prepared"',
    unit: '%',
    external: [{ label: 'Followers', value: 16 }, { label: 'Pioneers', value: 36 }],
    caption: 'Management-verified KPI tracking, not self-reported awareness (that figure is tracked separately).',
    sourceRefs: [1]
  },
  training: {
    title: 'Training & talent readiness',
    note: 'Training & Enablement dimension vs. FS execs "highly prepared" on talent',
    unit: '',
    external: [{ label: 'Followers', value: 7 }, { label: 'Pioneers', value: 37 }],
    caption: 'Different scales (0–100 vs. share of respondents) — read as directional.',
    sourceRefs: [1]
  },
  usage: {
    title: 'Workforce AI tool usage',
    note: 'Weekly Active Usage Rate KPI vs. FS firms with 40%+ workforce access',
    unit: '%',
    external: [{ label: 'Followers', value: 19 }, { label: 'Pioneers', value: 43 }],
    caption: 'Adjacent metrics — usage frequency vs. access breadth.',
    sourceRefs: [1]
  },
  deployment: {
    title: 'Initiative deployment intensity',
    note: 'KPIs "On track" vs. finance-AI initiatives deployed to production',
    unit: '%',
    external: [{ label: 'Laggards', value: 12 }, { label: 'Leaders', value: 62 }],
    caption: 'Loosest comparison — KPIs tracked vs. AI projects attempted — included as the clearest execution signal available.',
    sourceRefs: [2]
  }
};

// 1-10 finance AI maturity distribution, for the positioning gauge.
export const MATURITY_TIERS = [
  { label: 'Low (1–3)', share: 17, color: '#8A6B62' },
  { label: 'Mid (4–6)', share: 50, color: 'var(--blue-dark)' },
  { label: 'High (7–10)', share: 33, color: 'var(--gold)' }
];

export const LPL_FACTS = {
  scaleCaveat: 'LPL Financial serves 30,000+ affiliated advisors; this program’s Baseline round has a small number of respondents at one firm. What follows is directional context from a named industry peer’s public disclosures, not a statistical peer comparison.',
  stats: [
    { value: '~$2B', label: 'Tech modernization spend, past 3 years', ref: 5 },
    { value: '30,000+', label: 'Advisors on the expanded Anthropic/Claude integration', ref: 6 },
    { value: '2', label: 'Named AI products: "LPL Latitude" platform + "Cyan" agent', ref: 5 }
  ],
  cards: [
    {
      title: 'Governance-first sequencing',
      lplQuote: '"Intentionally building advisor-centric AI for years, testing solutions through controlled pilots to ensure... safety, compliance and regulatory standards."',
      ref: 6,
      insightTemplate: (govPct: number | string) =>
        `LPL's public language leads with governance sequencing before scale. Our data shows the same discipline isn't fully operationalized yet — only ${govPct}% of Governance KPIs are formally tracked "On track."`
    },
    {
      title: 'Platform-embedded, not bolt-on',
      lplQuote: 'AI embedded directly into "LPL Latitude," the firm’s unified advisor workflow platform, "rather than deploying AI as a standalone tool."',
      ref: 5,
      insightTemplate: (kpiPct: number | string) =>
        `Same intended direction (systemic, not point-tool), different stage: LPL describes a shipped platform; our 27-KPI framework spans 6 categories but only ${kpiPct}% are active — the framework exists, platform-level rollout is early.`
    },
    {
      title: 'Named foundation-model partner',
      lplQuote: 'Expanded partnership with Anthropic to deploy Claude-based plugins "controlled by compliance teams" across the advisor network.',
      ref: 6,
      insightTemplate: (usageRate: number | string) =>
        `Worth noting without overstating: this program is itself built on the same model family LPL is standardizing on for advisor-facing work. Our Weekly Active AI Usage Rate KPI: ${usageRate}.`
    }
  ]
};

export const SOURCES = [
  { n: 1, text: 'Deloitte Center for Financial Services, "Harnessing gen AI in financial services: Why pioneers lead the way." 542 FS board/C-suite respondents, July–Sept 2024.', url: 'https://www.deloitte.com/us/en/insights/industry/financial-services/generative-ai-financial-services-pioneers.html' },
  { n: 2, text: 'Cross-industry finance-function AI maturity research (1–10 scale; leader/laggard deployment rates), via Financial IT / Payhawk.', url: 'https://financialit.net/news/artificial-intelligence/half-finance-teams-globally-stuck-middle-ai-maturity' },
  { n: 3, text: 'Datos Insights, "Key AI Trends in Capital Markets" — Q3 2025 survey of 300 executives at institutional broker-dealers, asset managers, hedge funds, trading firms.', url: 'https://datos-insights.com/reports/key-ai-trends-in-capital-markets-cmk-2026-102346/' },
  { n: 4, text: 'FINRA 2026 Annual Regulatory Oversight Report — GenAI governance section, published Dec 9, 2025.', url: 'https://www.finra.org/media-center/newsreleases/2025/finra-publishes-2026-regulatory-oversight-report-empower-member-firm' },
  { n: 5, text: 'LPL Financial, Focus 2026 announcement and wealth-platform rollout coverage — ~$2B technology investment over 3 years, "LPL Latitude" platform, "Cyan" AI agent.', url: 'https://www.wealthmanagement.com/ibd-news/lpl-investing-in-ai-to-prop-the-advisor-up-' },
  { n: 6, text: 'LPL Financial & Anthropic, expanded partnership coverage — Claude plugins across 30,000+ advisors, "controlled pilots," compliance-controlled deployment.', url: 'https://completeaitraining.com/news/lpl-deepens-anthropic-partnership-as-claude-plugins-roll/' }
];
