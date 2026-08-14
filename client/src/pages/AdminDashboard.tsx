import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { Assessment, KpisResponse, MetaResponse, QuestionsResponse } from '../types';
import { StatTile } from '../components/StatTile';
import { BandDistributionChart } from '../components/charts/BandDistributionChart';
import { DimensionBarChart } from '../components/charts/DimensionBarChart';
import { CompositeByFunctionChart } from '../components/charts/CompositeByFunctionChart';
import { DimensionHeatmap } from '../components/charts/DimensionHeatmap';
import { OrgTrendChart, type OrgTrendRow } from '../components/charts/OrgTrendChart';
import { ScoreHistogram } from '../components/charts/ScoreHistogram';
import { KpiStatusStackedBar } from '../components/charts/KpiStatusStackedBar';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { StatusLegend } from '../components/StatusLegend';
import { DimensionRadarChart, type RadarDatum } from '../components/charts/DimensionRadarChart';
import { UsageGovernanceQuadrant, type QuadrantDatum } from '../components/charts/UsageGovernanceQuadrant';
import { ScoreRangeByFunctionChart, type RangeDatum } from '../components/charts/ScoreRangeByFunctionChart';
import { CumulativeParticipationChart, type ParticipationPoint } from '../components/charts/CumulativeParticipationChart';
import { BandMigrationAreaChart, type BandMigrationRow } from '../components/charts/BandMigrationAreaChart';
import { TrainingVsReadinessChart, type TrainingReadinessDatum } from '../components/charts/TrainingVsReadinessChart';
import { BandFlowSankey, type SankeyData } from '../components/charts/BandFlowSankey';
import { KpiCategoryRadar, type CategoryReadinessDatum } from '../components/charts/KpiCategoryRadar';
import { KpiRiskParetoChart, type RiskDatum } from '../components/charts/KpiRiskParetoChart';
import { GovernanceTrendAreaChart, type GovernanceTrendRow } from '../components/charts/GovernanceTrendAreaChart';
import { BAND_COLORS } from '../lib/colors';
import { RecommendationList } from '../components/RecommendationList';
import { getOrgRecommendations } from '../lib/recommendations';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Activity,
  BarChart3,
  Building2,
  Compass,
  Download,
  GraduationCap,
  Grid3x3,
  Layers,
  LineChart,
  ListChecks,
  MoveVertical,
  Percent,
  PieChart,
  Radar as RadarIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Waypoints
} from 'lucide-react';

const BAND_ORDER = ['Not Yet Started', 'Emerging', 'Accelerating', 'Leading'];

function bandForScore(score: number): string {
  if (score < 25) return 'Not Yet Started';
  if (score < 50) return 'Emerging';
  if (score < 75) return 'Accelerating';
  return 'Leading';
}

export function AdminDashboard() {
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allRoundsAssessments, setAllRoundsAssessments] = useState<Assessment[]>([]);
  const [totalAssessmentCount, setTotalAssessmentCount] = useState(0);
  const [kpiData, setKpiData] = useState<KpisResponse | null>(null);

  const [roundLabel, setRoundLabel] = useState('');
  const [fn, setFn] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api.getQuestions().then(setQuestions);
    api.getMeta().then(setMeta);
    refreshKpis();
  }, []);

  // Unfiltered, so it always reflects the true total — the modal message
  // and "Clear Data" action operate on ALL assessments, not the current filter.
  useEffect(() => {
    api.getAssessments({}).then((rows) => setTotalAssessmentCount(rows.length));
  }, [refreshTick]);

  useEffect(() => {
    api.getAssessments({
      round_label: roundLabel || undefined,
      function: fn || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    }).then(setAssessments);
  }, [roundLabel, fn, dateFrom, dateTo, refreshTick]);

  // Cross-round charts (radar round-over-round, band migration, cumulative
  // participation, band-flow Sankey) are inherently about comparing rounds,
  // so they use a dataset that respects function/date filters but never the
  // round filter itself.
  useEffect(() => {
    api.getAssessments({
      function: fn || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    }).then(setAllRoundsAssessments);
  }, [fn, dateFrom, dateTo, refreshTick]);

  function refreshKpis() {
    api.getKpis().then(setKpiData);
    api.getMeta().then(setMeta);
  }

  async function handleClearAssessments() {
    setClearing(true);
    try {
      await api.clearAssessments();
      setClearModalOpen(false);
      setRefreshTick((t) => t + 1);
      api.getMeta().then(setMeta);
    } finally {
      setClearing(false);
    }
  }

  const roundLabels = useMemo(() => Array.from(new Set(assessments.map((a) => a.round_label))), [assessments]);

  const headline = useMemo(() => {
    const n = assessments.length;
    const avg = n ? assessments.reduce((s, a) => s + a.composite_score, 0) / n : 0;
    const accelLead = assessments.filter((a) => a.band === 'Accelerating' || a.band === 'Leading').length;
    return { n, avg, pct: n ? Math.round((accelLead / n) * 100) : 0 };
  }, [assessments]);

  const bandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of assessments) counts[a.band] = (counts[a.band] ?? 0) + 1;
    return counts;
  }, [assessments]);

  const dimAverages = useMemo(() => {
    if (!questions) return [];
    return questions.dimensions.map((dim) => {
      const vals = assessments.map((a) => (a as any)[dim.column]).filter((v) => v !== null && v !== undefined);
      const avg = vals.length ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : 0;
      return { key: dim.key, label: dim.label, value: avg };
    });
  }, [assessments, questions]);

  const byFunction = useMemo(() => {
    if (!questions) return [];
    return questions.functions.map((f) => {
      const rows = assessments.filter((a) => a.function === f);
      const avg = rows.length ? rows.reduce((s, a) => s + a.composite_score, 0) / rows.length : 0;
      return { function: f, value: avg, n: rows.length };
    });
  }, [assessments, questions]);

  const heatmapMatrix = useMemo(() => {
    if (!questions) return {};
    const matrix: Record<string, Record<string, number | null>> = {};
    for (const f of questions.functions) {
      const rows = assessments.filter((a) => a.function === f);
      matrix[f] = {};
      for (const dim of questions.dimensions) {
        const vals = rows.map((a) => (a as any)[dim.column]).filter((v) => v !== null && v !== undefined);
        matrix[f][dim.key] = vals.length ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : null;
      }
    }
    return matrix;
  }, [assessments, questions]);

  const orgTrend = useMemo(() => {
    if (!questions) return { rows: [], fnKeys: [] as string[] };
    const rounds = new Map<string, { date: string; rows: Assessment[] }>();
    for (const a of assessments) {
      const entry = rounds.get(a.round_label) ?? { date: a.submitted_at, rows: [] };
      entry.rows.push(a);
      if (a.submitted_at < entry.date) entry.date = a.submitted_at;
      rounds.set(a.round_label, entry);
    }
    const sortedRounds = Array.from(rounds.entries()).sort((a, b) => a[1].date.localeCompare(b[1].date));
    const fnKeys = questions.functions;
    const rows = sortedRounds.map(([label, { rows: rrows }]) => {
      const row: any = { date: label, org: rrows.length ? rrows.reduce((s, a) => s + a.composite_score, 0) / rrows.length : 0 };
      for (const f of fnKeys) {
        const fr = rrows.filter((a) => a.function === f);
        row[f] = fr.length ? fr.reduce((s, a) => s + a.composite_score, 0) / fr.length : null;
      }
      return row;
    });
    return { rows, fnKeys };
  }, [assessments, questions]);

  // Group all-rounds data by round_label, ordered by that round's earliest
  // submission date — shared by the radar, band-migration, and Sankey charts.
  const roundsChronological = useMemo(() => {
    const rounds = new Map<string, { date: string; rows: Assessment[] }>();
    for (const a of allRoundsAssessments) {
      const entry = rounds.get(a.round_label) ?? { date: a.submitted_at, rows: [] };
      entry.rows.push(a);
      if (a.submitted_at < entry.date) entry.date = a.submitted_at;
      rounds.set(a.round_label, entry);
    }
    return Array.from(rounds.entries()).sort((a, b) => a[1].date.localeCompare(b[1].date));
  }, [allRoundsAssessments]);

  const dimensionRadar = useMemo(() => {
    if (!questions || roundsChronological.length === 0) return { data: [] as RadarDatum[], currentLabel: '', previousLabel: undefined as string | undefined };
    const latest = roundsChronological[roundsChronological.length - 1];
    const previous = roundsChronological.length > 1 ? roundsChronological[roundsChronological.length - 2] : null;
    const avgFor = (rows: Assessment[], col: string) => {
      const vals = rows.map((a) => (a as any)[col]).filter((v) => v !== null && v !== undefined);
      return vals.length ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : 0;
    };
    const data = questions.dimensions.map((dim) => ({
      dimension: dim.label,
      current: avgFor(latest[1].rows, dim.column),
      previous: previous ? avgFor(previous[1].rows, dim.column) : null
    }));
    return { data, currentLabel: latest[0], previousLabel: previous ? previous[0] : undefined };
  }, [roundsChronological, questions]);

  const usageGovernanceQuadrant = useMemo(() => {
    if (!questions) return [] as QuadrantDatum[];
    return questions.functions.map((f) => {
      const rows = assessments.filter((a) => a.function === f);
      const avgOf = (vals: number[]) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
      const usage = avgOf(rows.map((a) => a.usage_score).filter((v): v is number => v !== null));
      const discernment = rows.map((a) => a.discernment_score).filter((v): v is number => v !== null);
      const compliance = rows.map((a) => a.compliance_score).filter((v): v is number => v !== null);
      const governance = avgOf([...discernment, ...compliance]);
      const composite = avgOf(rows.map((a) => a.composite_score));
      return { function: f, usage, governance, n: rows.length, band: bandForScore(composite) };
    }).filter((d) => d.n > 0);
  }, [assessments, questions]);

  const scoreRangeByFunction = useMemo(() => {
    if (!questions) return [] as RangeDatum[];
    return questions.functions.map((f) => {
      const rows = assessments.filter((a) => a.function === f);
      if (rows.length === 0) return null;
      const scores = rows.map((a) => a.composite_score);
      return {
        function: f,
        min: Math.min(...scores),
        max: Math.max(...scores),
        avg: scores.reduce((s, v) => s + v, 0) / scores.length,
        n: rows.length
      };
    }).filter((d): d is RangeDatum => d !== null);
  }, [assessments, questions]);

  const cumulativeParticipation = useMemo(() => {
    const firstSeen = new Map<string, string>();
    for (const a of allRoundsAssessments) {
      const existing = firstSeen.get(a.employee_id);
      if (!existing || a.submitted_at < existing) firstSeen.set(a.employee_id, a.submitted_at);
    }
    const dates = Array.from(firstSeen.values()).sort();
    const byDay = new Map<string, number>();
    for (const d of dates) {
      const day = new Date(d).toLocaleDateString();
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    let cumulative = 0;
    const points: ParticipationPoint[] = [];
    for (const [day, count] of byDay.entries()) {
      cumulative += count;
      points.push({ date: day, cumulative });
    }
    return points;
  }, [allRoundsAssessments]);

  const bandMigration = useMemo(() => {
    return roundsChronological.map(([label, { rows }]) => {
      const row: BandMigrationRow = { round: label };
      for (const band of BAND_ORDER) row[band] = 0;
      for (const a of rows) row[a.band] = (Number(row[a.band]) || 0) + 1;
      return row;
    });
  }, [roundsChronological]);

  const trainingVsReadiness = useMemo(() => {
    if (!questions) return [] as TrainingReadinessDatum[];
    return questions.functions.map((f) => {
      const rows = assessments.filter((a) => a.function === f);
      const avgOf = (vals: number[]) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
      return {
        function: f,
        training: avgOf(rows.map((a) => a.training_score).filter((v): v is number => v !== null)),
        composite: avgOf(rows.map((a) => a.composite_score))
      };
    }).filter((d) => assessments.some((a) => a.function === d.function));
  }, [assessments, questions]);

  const bandFlowSankey = useMemo((): SankeyData => {
    const byEmployee = new Map<string, Assessment[]>();
    for (const a of allRoundsAssessments) {
      const list = byEmployee.get(a.employee_id) ?? [];
      list.push(a);
      byEmployee.set(a.employee_id, list);
    }
    const flows = new Map<string, number>();
    for (const rows of byEmployee.values()) {
      if (rows.length < 2) continue;
      const sorted = [...rows].sort((a, b) => a.submitted_at.localeCompare(b.submitted_at));
      const firstBand = sorted[0].band;
      const lastBand = sorted[sorted.length - 1].band;
      const key = `${firstBand}|||${lastBand}`;
      flows.set(key, (flows.get(key) ?? 0) + 1);
    }
    const usedFirst = new Set<string>();
    const usedLast = new Set<string>();
    for (const key of flows.keys()) {
      const [f, l] = key.split('|||');
      usedFirst.add(f);
      usedLast.add(l);
    }
    const firstNodes = BAND_ORDER.filter((b) => usedFirst.has(b)).map((b) => `${b} (First)`);
    const lastNodes = BAND_ORDER.filter((b) => usedLast.has(b)).map((b) => `${b} (Latest)`);
    const nodeNames = [...firstNodes, ...lastNodes];
    const nodeIndex = new Map(nodeNames.map((n, i) => [n, i]));
    const links = Array.from(flows.entries()).map(([key, value]) => {
      const [f, l] = key.split('|||');
      return { source: nodeIndex.get(`${f} (First)`)!, target: nodeIndex.get(`${l} (Latest)`)!, value };
    });
    return { nodes: nodeNames.map((name) => ({ name })), links };
  }, [allRoundsAssessments]);

  const kpiCategoryRadar = useMemo((): CategoryReadinessDatum[] => {
    if (!kpiData) return [];
    return kpiData.categories.map((cat) => {
      const items = kpiData.kpis.filter((k) => k.category === cat);
      const ready = items.filter((k) => k.status === 'On track' || k.status === 'Complete').length;
      return { category: cat, pctReady: items.length ? (ready / items.length) * 100 : 0 };
    });
  }, [kpiData]);

  const kpiRiskPareto = useMemo((): RiskDatum[] => {
    if (!kpiData) return [];
    return kpiData.categories.map((cat) => {
      const items = kpiData.kpis.filter((k) => k.category === cat);
      const atRisk = items.filter((k) => k.status === 'At risk' || k.status === 'Off track').length;
      return { category: cat, atRiskCount: atRisk, total: items.length };
    });
  }, [kpiData]);

  const GOVERNANCE_CATEGORY = 'Governance, Risk & Compliance';

  const governanceTrend = useMemo((): GovernanceTrendRow[] => {
    if (!kpiData) return [];
    const govKpis = kpiData.kpis.filter((k) => k.category === GOVERNANCE_CATEGORY);
    const timestamps = Array.from(new Set(govKpis.flatMap((k) => k.history.map((h) => h.recorded_at)))).sort();
    return timestamps.map((ts) => {
      const row: GovernanceTrendRow = { date: new Date(ts).toLocaleDateString() };
      for (const s of ['Not started', 'On track', 'At risk', 'Off track', 'Complete']) row[s] = 0;
      for (const k of govKpis) {
        const applicable = k.history.filter((h) => h.recorded_at <= ts);
        const state = applicable[applicable.length - 1];
        const status = state ? state.status : 'Not started';
        row[status] = (Number(row[status]) || 0) + 1;
      }
      return row;
    });
  }, [kpiData]);

  const leadingPct = useMemo(() => {
    if (assessments.length === 0) return undefined;
    return Math.round(((bandCounts['Leading'] ?? 0) / assessments.length) * 100);
  }, [bandCounts, assessments]);

  const govPct = useMemo(() => {
    if (!kpiData) return undefined;
    const govKpis = kpiData.kpis.filter((k) => k.category === GOVERNANCE_CATEGORY);
    if (govKpis.length === 0) return undefined;
    const govActive = govKpis.filter((k) => k.status === 'On track' || k.status === 'Complete').length;
    return Math.round((govActive / govKpis.length) * 100);
  }, [kpiData]);

  const orgRecommendations = useMemo(() => {
    return getOrgRecommendations({
      dimAverages,
      byFunction,
      quadrant: usageGovernanceQuadrant,
      riskPareto: kpiRiskPareto,
      bandCounts,
      totalN: assessments.length,
      leadingPct,
      govPct
    });
  }, [dimAverages, byFunction, usageGovernanceQuadrant, kpiRiskPareto, bandCounts, assessments, leadingPct, govPct]);

  const dataAsOf = meta?.data_as_of ? new Date(meta.data_as_of).toLocaleString() : '—';

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Management View</p>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Org-wide AI readiness analytics and the 27-KPI management framework, in one view.</p>
      </div>

      <div className="banner"><span className="pulse-dot" /> Data as of: {dataAsOf}</div>

      {assessments.length > 0 && (
        <div className="card recommendation-card" style={{ marginBottom: 32 }}>
          <div className="chart-card-heading" style={{ marginBottom: 14 }}>
            <div className="chart-card-icon"><Sparkles size={15} /></div>
            <div className="card-title" style={{ margin: 0 }}>Recommended Actions — Org-Wide</div>
          </div>
          <RecommendationList recommendations={orgRecommendations} />
        </div>
      )}

      <div className="zone-heading">
        <div className="zone-icon"><BarChart3 size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="zone-tag">Zone A</span>
            <h2>Assessment Analytics</h2>
          </div>
          <span className="zone-description">Individual-submission data — filterable by round, function, and date range.</span>
        </div>
        {totalAssessmentCount > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <a className="btn btn-secondary" href={api.exportUrl('assessments', 'csv')}><Download size={14} /> Export CSV</a>
            <a className="btn btn-secondary" href={api.exportUrl('assessments', 'json')}><Download size={14} /> Export JSON</a>
            <button className="btn btn-danger" onClick={() => setClearModalOpen(true)}>
              <Trash2 size={14} /> Clear Data
            </button>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <div className="field">
          <label>Round</label>
          <select value={roundLabel} onChange={(e) => setRoundLabel(e.target.value)}>
            <option value="">All rounds</option>
            {roundLabels.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Function</label>
          <select value={fn} onChange={(e) => setFn(e.target.value)}>
            <option value="">All functions</option>
            {questions?.functions.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="field">
          <label>From</label>
          <input type="text" placeholder="YYYY-MM-DD" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="text" placeholder="YYYY-MM-DD" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {(roundLabel || fn || dateFrom || dateTo) && (
          <button className="btn btn-ghost" onClick={() => { setRoundLabel(''); setFn(''); setDateFrom(''); setDateTo(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {assessments.length === 0 ? (
        <div className="card empty-state">No assessment submissions match the current filters yet.</div>
      ) : (
        <>
          <div className="grid grid-3 mb-8">
            <div className="card interactive">
              <StatTile icon={TrendingUp} label="Org Composite Average" value={headline.avg.toFixed(1)} sub={`${headline.n} submissions`} />
            </div>
            <div className="card interactive">
              <StatTile icon={Users} label="Participation" value={String(headline.n)} sub="submissions in current filter" />
            </div>
            <div className="card interactive">
              <StatTile icon={Percent} label="% Accelerating / Leading" value={`${headline.pct}%`} />
            </div>
          </div>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="Band Distribution"
              subtitle="Where the org sits across the 4 maturity bands"
              icon={PieChart}
              table={<BandTable counts={bandCounts} />}
            >
              <BandDistributionChart counts={bandCounts} />
            </ChartCard>

            <ChartCard
              title="Dimension Averages"
              subtitle="Org-wide average per assessment dimension"
              icon={BarChart3}
              table={<DimTable data={dimAverages} />}
            >
              <DimensionBarChart data={dimAverages} />
            </ChartCard>
          </div>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="Composite Score by Function"
              subtitle="Average readiness score per function"
              icon={Building2}
              table={<FnTable data={byFunction} />}
            >
              <CompositeByFunctionChart data={byFunction} />
            </ChartCard>

            <ChartCard
              title="Composite Score Distribution"
              subtitle="How individual scores spread across the org"
              icon={Activity}
              table={<HistTable scores={assessments.map((a) => a.composite_score)} />}
            >
              <ScoreHistogram scores={assessments.map((a) => a.composite_score)} />
            </ChartCard>
          </div>

          {questions && (
            <ChartCard
              className="mt-24"
              title="Function × Dimension Heatmap"
              subtitle="Where each team is strong or weak, at a glance"
              icon={Grid3x3}
              table={<HeatmapTable functions={questions.functions} dimensions={questions.dimensions.map((d) => ({ key: d.key, label: d.label }))} matrix={heatmapMatrix} />}
            >
              <DimensionHeatmap
                functions={questions.functions}
                dimensions={questions.dimensions.map((d) => ({ key: d.key, label: d.label }))}
                matrix={heatmapMatrix}
              />
            </ChartCard>
          )}

          <ChartCard
            className="mt-24"
            title="Composite Score Trend Over Time (by round)"
            subtitle="Org average emphasized; per-function lines shown thin"
            icon={LineChart}
            table={<OrgTrendTable rows={orgTrend.rows} functionKeys={orgTrend.fnKeys} />}
          >
            <OrgTrendChart data={orgTrend.rows} functionKeys={orgTrend.fnKeys} />
          </ChartCard>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="Dimension Profile — Round over Round"
              subtitle="Gartner-style 7-pillar readiness radar"
              icon={RadarIcon}
              table={<RadarTable data={dimensionRadar.data} currentLabel={dimensionRadar.currentLabel} previousLabel={dimensionRadar.previousLabel} />}
            >
              <DimensionRadarChart data={dimensionRadar.data} currentLabel={dimensionRadar.currentLabel || 'Latest round'} previousLabel={dimensionRadar.previousLabel} />
            </ChartCard>

            <ChartCard
              title="Usage vs. Governance Readiness by Function"
              subtitle="Fast adoption without control is the risk to watch"
              icon={Compass}
              table={<QuadrantTable data={usageGovernanceQuadrant} />}
            >
              <UsageGovernanceQuadrant data={usageGovernanceQuadrant} />
            </ChartCard>
          </div>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="Composite Score Range by Function"
              subtitle="Spread within a function, not just its average"
              icon={MoveVertical}
              table={<RangeTable data={scoreRangeByFunction} />}
            >
              <ScoreRangeByFunctionChart data={scoreRangeByFunction} />
            </ChartCard>

            <ChartCard
              title="Training Investment vs. Readiness by Function"
              subtitle="Does training show up in the outcome?"
              icon={GraduationCap}
              table={<TrainingReadinessTable data={trainingVsReadiness} />}
            >
              <TrainingVsReadinessChart data={trainingVsReadiness} />
            </ChartCard>
          </div>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="Cumulative Participation"
              subtitle="Distinct employees assessed, running total"
              icon={Users}
              table={<ParticipationTable data={cumulativeParticipation} />}
            >
              <CumulativeParticipationChart data={cumulativeParticipation} />
            </ChartCard>

            <ChartCard
              title="Band Composition Across Rounds"
              subtitle="Maturity-stage migration, release over release"
              icon={Layers}
              table={<BandMigrationTable data={bandMigration} />}
            >
              <BandMigrationAreaChart data={bandMigration} />
            </ChartCard>
          </div>

          {bandFlowSankey.links.length > 0 ? (
            <ChartCard
              className="mt-24"
              title="Band Migration: First Round → Latest Round (returning employees)"
              icon={Waypoints}
              table={<SankeyTable data={bandFlowSankey} />}
            >
              <BandFlowSankey data={bandFlowSankey} />
            </ChartCard>
          ) : (
            <div className="card mt-24 empty-state">
              Band migration needs at least one employee with 2+ submissions across different rounds — not enough repeat submissions yet.
            </div>
          )}
        </>
      )}

      <div className="zone-heading">
        <div className="zone-icon"><ShieldCheck size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="zone-tag">Zone B</span>
            <h2>KPI Framework</h2>
          </div>
          <span className="zone-description">The 27-KPI management framework across 6 categories — append-only history.</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn btn-secondary" href={api.exportUrl('kpi_records', 'csv')}><Download size={14} /> Export CSV</a>
          <a className="btn btn-secondary" href={api.exportUrl('kpi_records', 'json')}><Download size={14} /> Export JSON</a>
        </div>
      </div>

      {kpiData && (
        <>
          <div className="grid grid-2 mb-8">
            <ChartCard
              title="KPI Status Breakdown, Overall"
              subtitle="Part-to-whole across all 27 KPIs"
              icon={ListChecks}
              table={<StatusCountTable counts={overallStatusCounts(kpiData)} />}
            >
              <KpiStatusStackedBar counts={overallStatusCounts(kpiData)} label={`All ${kpiData.kpis.length} KPIs`} />
            </ChartCard>
            <ChartCard
              title="KPI Status Breakdown, by Category"
              subtitle="Which category is lagging behind the others"
              icon={ListChecks}
              table={<StatusByCategoryTable kpiData={kpiData} />}
            >
              <StatusLegend />
              {kpiData.categories.map((cat) => (
                <KpiStatusStackedBar
                  key={cat}
                  counts={statusCountsForCategory(kpiData, cat)}
                  label={cat}
                  height={54}
                  showLegend={false}
                />
              ))}
            </ChartCard>
          </div>

          <div className="grid grid-2 mt-24">
            <ChartCard
              title="KPI Category Readiness"
              subtitle="% On track / Complete vs. a 100% target ring"
              icon={RadarIcon}
              table={<CategoryRadarTable data={kpiCategoryRadar} />}
            >
              <KpiCategoryRadar data={kpiCategoryRadar} />
            </ChartCard>

            <ChartCard
              title="KPI Risk Concentration by Category"
              subtitle="Where governance attention is most needed now"
              icon={ShieldAlert}
              table={<RiskParetoTable data={kpiRiskPareto} />}
            >
              <KpiRiskParetoChart data={kpiRiskPareto} />
            </ChartCard>
          </div>

          <ChartCard
            className="mt-24"
            title="Governance, Risk & Compliance — Status Over Time"
            subtitle="The category FINRA's 2026 oversight report calls out for GenAI supervision"
            icon={ShieldCheck}
            table={<GovernanceTrendTable data={governanceTrend} />}
          >
            <GovernanceTrendAreaChart data={governanceTrend} />
          </ChartCard>

          {kpiData.categories.map((cat) => {
            const CategoryIcon = CATEGORY_ICONS[cat] ?? ListChecks;
            const count = kpiData.kpis.filter((k) => k.category === cat).length;
            return (
              <div key={cat} className="mt-24">
                <div className="kpi-category-heading">
                  <div className="chart-card-icon"><CategoryIcon size={15} /></div>
                  <span className="kpi-category-title">{cat}</span>
                  <span className="kpi-category-count">{count} KPIs</span>
                </div>
                {kpiData.kpis.filter((k) => k.category === cat).map((k) => (
                  <KpiCard key={k.kpi_key} kpi={k} onUpdated={refreshKpis} />
                ))}
              </div>
            );
          })}
        </>
      )}

      <ConfirmModal
        open={clearModalOpen}
        title="Clear all assessment data?"
        message={`This permanently deletes all ${totalAssessmentCount} captured assessment submission(s) from this local database — including any outside your current filters. Export a copy first if you want to keep them; this cannot be undone. The KPI framework in Zone B is not affected.`}
        confirmLabel="Delete permanently"
        busy={clearing}
        onConfirm={handleClearAssessments}
        onCancel={() => setClearModalOpen(false)}
      />
    </div>
  );
}

const CATEGORY_ICONS: Record<string, typeof TrendingUp> = {
  'Adoption & Usage': TrendingUp,
  'Skill & Competency': BarChart3,
  'Training & Enablement': GraduationCap,
  'Governance, Risk & Compliance': ShieldCheck,
  'Productivity & Business Impact': Activity,
  'Sentiment, Trust & Leadership': Sparkles
};

function overallStatusCounts(data: KpisResponse) {
  const counts: Record<string, number> = {};
  for (const k of data.kpis) counts[k.status] = (counts[k.status] ?? 0) + 1;
  return counts;
}

function statusCountsForCategory(data: KpisResponse, category: string) {
  const counts: Record<string, number> = {};
  for (const k of data.kpis.filter((k) => k.category === category)) counts[k.status] = (counts[k.status] ?? 0) + 1;
  return counts;
}

function HeatmapTable({
  functions,
  dimensions,
  matrix
}: {
  functions: string[];
  dimensions: { key: string; label: string }[];
  matrix: Record<string, Record<string, number | null>>;
}) {
  return (
    <table className="data-table">
      <thead><tr><th>Function</th>{dimensions.map((d) => <th key={d.key}>{d.label}</th>)}</tr></thead>
      <tbody>
        {functions.map((fn) => (
          <tr key={fn}>
            <td>{fn}</td>
            {dimensions.map((d) => {
              const v = matrix[fn]?.[d.key];
              return <td key={d.key}>{v !== null && v !== undefined ? v.toFixed(1) : '—'}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const STATUS_ORDER = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

function StatusCountTable({ counts }: { counts: Record<string, number> }) {
  return (
    <table className="data-table">
      <thead><tr><th>Status</th><th>Count</th></tr></thead>
      <tbody>{STATUS_ORDER.map((s) => <tr key={s}><td>{s}</td><td>{counts[s] ?? 0}</td></tr>)}</tbody>
    </table>
  );
}

function StatusByCategoryTable({ kpiData }: { kpiData: KpisResponse }) {
  return (
    <table className="data-table">
      <thead><tr><th>Category</th>{STATUS_ORDER.map((s) => <th key={s}>{s}</th>)}</tr></thead>
      <tbody>
        {kpiData.categories.map((cat) => {
          const counts = statusCountsForCategory(kpiData, cat);
          return (
            <tr key={cat}>
              <td>{cat}</td>
              {STATUS_ORDER.map((s) => <td key={s}>{counts[s] ?? 0}</td>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OrgTrendTable({ rows, functionKeys }: { rows: OrgTrendRow[]; functionKeys: string[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Round</th><th>Org Average</th>{functionKeys.map((f) => <th key={f}>{f}</th>)}</tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.date}>
            <td>{r.date}</td>
            <td>{Number(r.org).toFixed(1)}</td>
            {functionKeys.map((f) => <td key={f}>{r[f] !== null && r[f] !== undefined ? Number(r[f]).toFixed(1) : '—'}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BandTable({ counts }: { counts: Record<string, number> }) {
  return (
    <table className="data-table">
      <thead><tr><th>Band</th><th>Count</th></tr></thead>
      <tbody>{Object.entries(counts).map(([band, count]) => <tr key={band}><td>{band}</td><td>{count}</td></tr>)}</tbody>
    </table>
  );
}

function DimTable({ data }: { data: { label: string; value: number }[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Dimension</th><th>Average</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{d.value.toFixed(1)}</td></tr>)}</tbody>
    </table>
  );
}

function FnTable({ data }: { data: { function: string; value: number; n: number }[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Function</th><th>Average</th><th>N</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.function}><td>{d.function}</td><td>{d.value.toFixed(1)}</td><td>{d.n}</td></tr>)}</tbody>
    </table>
  );
}

function RadarTable({ data, currentLabel, previousLabel }: { data: RadarDatum[]; currentLabel: string; previousLabel?: string }) {
  return (
    <table className="data-table">
      <thead><tr><th>Dimension</th><th>{currentLabel || 'Current'}</th>{previousLabel && <th>{previousLabel}</th>}</tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.dimension}>
            <td>{d.dimension}</td>
            <td>{d.current.toFixed(1)}</td>
            {previousLabel && <td>{d.previous !== null && d.previous !== undefined ? d.previous.toFixed(1) : '—'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function QuadrantTable({ data }: { data: QuadrantDatum[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Function</th><th>Usage</th><th>Governance Readiness</th><th>Band</th><th>N</th></tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.function}>
            <td>{d.function}</td>
            <td>{d.usage.toFixed(1)}</td>
            <td>{d.governance.toFixed(1)}</td>
            <td><span style={{ color: BAND_COLORS[d.band] }}>{d.band}</span></td>
            <td>{d.n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RangeTable({ data }: { data: RangeDatum[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Function</th><th>Min</th><th>Average</th><th>Max</th><th>N</th></tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.function}>
            <td>{d.function}</td>
            <td>{d.min.toFixed(0)}</td>
            <td>{d.avg.toFixed(1)}</td>
            <td>{d.max.toFixed(0)}</td>
            <td>{d.n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TrainingReadinessTable({ data }: { data: TrainingReadinessDatum[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Function</th><th>Training & Enablement</th><th>Composite</th></tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.function}>
            <td>{d.function}</td>
            <td>{d.training.toFixed(1)}</td>
            <td>{d.composite.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ParticipationTable({ data }: { data: ParticipationPoint[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Date</th><th>Cumulative Employees</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.cumulative}</td></tr>)}</tbody>
    </table>
  );
}

function BandMigrationTable({ data }: { data: BandMigrationRow[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Round</th>{BAND_ORDER.map((b) => <th key={b}>{b}</th>)}</tr></thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row.round)}>
            <td>{row.round}</td>
            {BAND_ORDER.map((b) => <td key={b}>{row[b] ?? 0}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SankeyTable({ data }: { data: SankeyData }) {
  return (
    <table className="data-table">
      <thead><tr><th>From (First Round)</th><th>To (Latest Round)</th><th>Employees</th></tr></thead>
      <tbody>
        {data.links.map((l, i) => (
          <tr key={i}>
            <td>{data.nodes[l.source]?.name.replace(' (First)', '')}</td>
            <td>{data.nodes[l.target]?.name.replace(' (Latest)', '')}</td>
            <td>{l.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CategoryRadarTable({ data }: { data: CategoryReadinessDatum[] }) {
  return (
    <table className="data-table">
      <thead><tr><th>Category</th><th>% On track / Complete</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.category}><td>{d.category}</td><td>{d.pctReady.toFixed(0)}%</td></tr>)}</tbody>
    </table>
  );
}

function RiskParetoTable({ data }: { data: RiskDatum[] }) {
  const sorted = [...data].sort((a, b) => b.atRiskCount - a.atRiskCount);
  return (
    <table className="data-table">
      <thead><tr><th>Category</th><th>At Risk / Off Track</th><th>Total KPIs</th></tr></thead>
      <tbody>{sorted.map((d) => <tr key={d.category}><td>{d.category}</td><td>{d.atRiskCount}</td><td>{d.total}</td></tr>)}</tbody>
    </table>
  );
}

function GovernanceTrendTable({ data }: { data: GovernanceTrendRow[] }) {
  const statuses = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];
  return (
    <table className="data-table">
      <thead><tr><th>Date</th>{statuses.map((s) => <th key={s}>{s}</th>)}</tr></thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.date}</td>
            {statuses.map((s) => <td key={s}>{row[s] ?? 0}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HistTable({ scores }: { scores: number[] }) {
  const bins = [0, 20, 40, 60, 80, 100];
  const rows = bins.slice(0, -1).map((lo, i) => {
    const hi = bins[i + 1];
    const isLast = i === bins.length - 2;
    const count = scores.filter((s) => (isLast ? s >= lo && s <= hi : s >= lo && s < hi)).length;
    return { label: `${lo}–${hi}`, count };
  });
  return (
    <table className="data-table">
      <thead><tr><th>Range</th><th>Employees</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td>{r.count}</td></tr>)}</tbody>
    </table>
  );
}
