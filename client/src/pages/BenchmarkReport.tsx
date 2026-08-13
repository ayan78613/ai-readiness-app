import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { Assessment, KpisResponse, QuestionsResponse } from '../types';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { DimensionRadarChart, type RadarDatum } from '../components/charts/DimensionRadarChart';
import { DimensionBarChart, type DimBarDatum } from '../components/charts/DimensionBarChart';
import { CompositeByFunctionChart, type FnDatum } from '../components/charts/CompositeByFunctionChart';
import { KpiStatusStackedBar } from '../components/charts/KpiStatusStackedBar';
import { StatTile } from '../components/StatTile';
import { BandBadge } from '../components/Badges';
import { BenchmarkCompareBar } from '../components/BenchmarkCompareBar';
import { ChartCard } from '../components/ChartCard';
import { COMPARISON_TEMPLATES, LPL_FACTS, MATURITY_TIERS, SOURCES } from '../lib/externalBenchmarks';
import { Scale, BarChart3, Building2, ShieldCheck, Compass, Landmark } from 'lucide-react';

export function BenchmarkReport() {
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [kpiData, setKpiData] = useState<KpisResponse | null>(null);

  useEffect(() => {
    api.getQuestions().then(setQuestions);
    api.getAssessments({}).then(setAssessments);
    api.getKpis().then(setKpiData);
  }, []);

  const stats = useMemo(() => {
    if (!questions || !assessments || !kpiData) return null;

    const n = assessments.length;
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const compositeAvg = avg(assessments.map((a) => a.composite_score));

    const bandCounts: Record<string, number> = {};
    for (const a of assessments) bandCounts[a.band] = (bandCounts[a.band] ?? 0) + 1;
    const leadingPct = n ? Math.round(((bandCounts['Leading'] ?? 0) / n) * 100) : 0;

    const dimAverages = questions.dimensions.map((dim) => {
      const vals = assessments.map((a) => (a as any)[dim.column]).filter((v) => v !== null && v !== undefined);
      return { key: dim.key, label: dim.label, value: avg(vals) };
    });
    const weakest = [...dimAverages].sort((a, b) => a.value - b.value)[0];
    const trainingDim = dimAverages.find((d) => d.key === 'training');

    const byFn = new Map<string, number[]>();
    for (const a of assessments) {
      const list = byFn.get(a.function) ?? [];
      list.push(a.composite_score);
      byFn.set(a.function, list);
    }
    const fnData: FnDatum[] = Array.from(byFn.entries())
      .map(([fn, vals]) => ({ function: fn, value: avg(vals), n: vals.length }))
      .sort((a, b) => b.value - a.value);

    const totalKpis = kpiData.kpis.length;
    const activeKpis = kpiData.kpis.filter((k) => k.status === 'On track' || k.status === 'Complete').length;
    const activePct = totalKpis ? Math.round((activeKpis / totalKpis) * 100) : 0;
    const statusCounts: Record<string, number> = {};
    for (const k of kpiData.kpis) statusCounts[k.status] = (statusCounts[k.status] ?? 0) + 1;

    const GOVERNANCE = 'Governance, Risk & Compliance';
    const govKpis = kpiData.kpis.filter((k) => k.category === GOVERNANCE);
    const govActive = govKpis.filter((k) => k.status === 'On track' || k.status === 'Complete').length;
    const govPct = govKpis.length ? Math.round((govActive / govKpis.length) * 100) : 0;

    const usageKpi = kpiData.kpis.find((k) => k.kpi_key === 'weekly_active_ai_usage_rate');
    const usageValue = usageKpi?.current_value ? parseFloat(usageKpi.current_value) : NaN;

    return {
      n, compositeAvg, bandCounts, leadingPct, dimAverages, weakest, trainingDim,
      fnData, totalKpis, activeKpis, activePct, statusCounts, govKpis, govPct, usageKpi, usageValue
    };
  }, [questions, assessments, kpiData]);

  if (!stats || !questions) {
    return <div className="page"><p className="muted">Loading benchmark data…</p></div>;
  }

  const band = stats.compositeAvg >= 75 ? 'Leading' : stats.compositeAvg >= 50 ? 'Accelerating' : stats.compositeAvg >= 25 ? 'Emerging' : 'Not Yet Started';

  const radarData: RadarDatum[] = stats.dimAverages.map((d) => ({ dimension: d.label, current: d.value }));
  const dimBarData: DimBarDatum[] = stats.dimAverages.map((d) => ({ label: d.label, value: d.value }));

  const comparisonValues: Record<string, number> = {
    leadingShare: stats.leadingPct,
    governance: stats.govPct,
    training: stats.trainingDim?.value ?? 0,
    usage: isNaN(stats.usageValue) ? 0 : stats.usageValue,
    deployment: stats.activePct
  };

  const positionScore10 = (stats.compositeAvg / 100) * 10;

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Management Dashboard</p>
        <h1 className="page-title">Benchmark Report</h1>
        <p className="page-subtitle">
          Live internal results, charted against cited financial-services AI-maturity research. Gold marks are Kestra's own data, computed fresh on every visit; blue marks are published external benchmarks.
        </p>
      </div>

      <div className="benchmark-legend">
        <span className="item"><span className="sw" style={{ background: 'var(--gold)' }} />Kestra (live)</span>
        <span className="item"><span className="sw" style={{ background: 'var(--blue)' }} />External benchmark (cited)</span>
      </div>

      {/* ---------- HERO ---------- */}
      <div className="grid grid-3" style={{ gridTemplateColumns: '1.3fr 1fr', marginBottom: 14 }}>
        <div className="card interactive hero-benchmark">
          <ScoreGauge score={stats.compositeAvg} band={band} />
          <div className="hero-benchmark-text">
            <h2>Ahead of the industry on self-assessed readiness — behind it on formal governance execution</h2>
            <p>
              <b>{stats.leadingPct}%</b> of respondents sit in the <b>Leading</b> band, ahead of the 46% "Pioneer" share Deloitte
              found across 542 financial-services executives.<sup>1</sup> But only <b>{stats.govPct}%</b> of Governance KPIs are
              formally tracked "On track" — explored below.
            </p>
          </div>
        </div>
        <div className="grid grid-2">
          <div className="card"><StatTile label="Band mix" value={`${stats.leadingPct}%`} sub={`Leading, ${stats.n} submissions`} /></div>
          <div className="card"><StatTile label="Weakest dimension" value={stats.weakest.value.toFixed(1)} sub={stats.weakest.label} /></div>
          <div className="card"><StatTile label="Governance KPIs active" value={`${stats.govKpis.filter((k) => k.status === 'On track' || k.status === 'Complete').length}/${stats.govKpis.length}`} sub="Formally tracked" /></div>
          <div className="card"><StatTile label="KPI program overall" value={`${stats.activeKpis}/${stats.totalKpis}`} sub="On track or Complete" /></div>
        </div>
      </div>

      {/* ---------- COMPARISONS ---------- */}
      <div className="zone-heading">
        <div className="zone-icon"><Scale size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2>How We Compare</h2></div>
          <span className="zone-description">Kestra vs. published financial-services benchmarks — verdict computed live from your data</span>
        </div>
      </div>
      <div className="grid grid-3">
        {Object.entries(COMPARISON_TEMPLATES).map(([key, comp]) => (
          <BenchmarkCompareBar key={key} comparison={comp} us={comparisonValues[key]} />
        ))}
      </div>

      {/* ---------- DIMENSIONS ---------- */}
      <div className="zone-heading">
        <div className="zone-icon"><BarChart3 size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2>Dimension Profile</h2></div>
          <span className="zone-description">7 weighted dimensions — org-wide average, self-reported</span>
        </div>
      </div>
      <div className="grid grid-2">
        <ChartCard title="Shape" subtitle="Radar view — where the profile bulges or dips">
          <DimensionRadarChart data={radarData} currentLabel="Org average" />
        </ChartCard>
        <ChartCard title="Ranked" subtitle="Same data, precise magnitude compare">
          <DimensionBarChart data={dimBarData} />
        </ChartCard>
      </div>

      {/* ---------- FUNCTION + KPI ---------- */}
      <div className="zone-heading">
        <div className="zone-icon"><Building2 size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2>Function Breakdown &amp; KPI Status</h2></div>
          <span className="zone-description">Where submissions concentrate; how the management KPI program is tracking</span>
        </div>
      </div>
      <div className="grid grid-2">
        <ChartCard title="Composite by function" subtitle="Every function with a submission so far">
          <CompositeByFunctionChart data={stats.fnData} />
        </ChartCard>
        <ChartCard title={`${stats.totalKpis} tracked KPIs, by status`} subtitle={`${stats.activeKpis} active, ${stats.totalKpis - stats.activeKpis} not yet started`}>
          <KpiStatusStackedBar counts={stats.statusCounts} label={`All ${stats.totalKpis} KPIs`} />
        </ChartCard>
      </div>

      {/* ---------- NAMED PEER: LPL ---------- */}
      <div className="zone-heading">
        <div className="zone-icon"><Landmark size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2>Named Peer: LPL Financial</h2></div>
          <span className="zone-description">Publicly disclosed facts — not a fabricated LPL "score," since they haven't published one</span>
        </div>
      </div>
      <div className="peer-banner">
        <span className="badge badge-status-at-risk"><span className="dot" style={{ background: 'var(--status-at-risk)' }} />Scale caveat</span>
        <span>{LPL_FACTS.scaleCaveat}</span>
      </div>
      <div className="card">
        <div className="peer-stats">
          {LPL_FACTS.stats.map((s) => (
            <div className="peer-stat" key={s.label}>
              <div className="v">{s.value}</div>
              <div className="l">{s.label}<sup>{s.ref}</sup></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-3 mt-24">
        <div className="card peer-card">
          <div className="t">{LPL_FACTS.cards[0].title}</div>
          <div className="peer-side lpl"><div className="who">LPL (public disclosure)</div>{LPL_FACTS.cards[0].lplQuote}<sup>{LPL_FACTS.cards[0].ref}</sup></div>
          <div className="peer-side us"><div className="who">Kestra (internal data)</div>Staff self-report {stats.dimAverages.find((d) => d.key === 'compliance')?.value.toFixed(1)}/100 compliance awareness, but only {stats.govPct}% of Governance KPIs are formally tracked "On track."</div>
          <div className="peer-insight">{LPL_FACTS.cards[0].insightTemplate(stats.govPct)}</div>
        </div>
        <div className="card peer-card">
          <div className="t">{LPL_FACTS.cards[1].title}</div>
          <div className="peer-side lpl"><div className="who">LPL (public disclosure)</div>{LPL_FACTS.cards[1].lplQuote}<sup>{LPL_FACTS.cards[1].ref}</sup></div>
          <div className="peer-side us"><div className="who">Kestra (internal data)</div>{stats.totalKpis}-KPI framework spans 6 categories org-wide, but {stats.totalKpis - stats.activeKpis} of {stats.totalKpis} are still "Not started."</div>
          <div className="peer-insight">{LPL_FACTS.cards[1].insightTemplate(stats.activePct)}</div>
        </div>
        <div className="card peer-card">
          <div className="t">{LPL_FACTS.cards[2].title}</div>
          <div className="peer-side lpl"><div className="who">LPL (public disclosure)</div>{LPL_FACTS.cards[2].lplQuote}<sup>{LPL_FACTS.cards[2].ref}</sup></div>
          <div className="peer-side us"><div className="who">Kestra (internal data)</div>Weekly Active AI Usage Rate KPI: {stats.usageKpi?.current_value || '—'} (target {stats.usageKpi?.target_value || '—'}).</div>
          <div className="peer-insight">{LPL_FACTS.cards[2].insightTemplate(stats.usageKpi?.current_value || 'not yet recorded')}</div>
        </div>
      </div>

      {/* ---------- POSITIONING ---------- */}
      <div className="zone-heading">
        <div className="zone-icon"><Compass size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2>Estimated Global Positioning</h2></div>
          <span className="zone-description">Mapped onto the closest published maturity scale — not a measured rank</span>
        </div>
      </div>
      <div className="card">
        <p style={{ margin: '0 0 4px', fontSize: 13.5 }}>
          A cross-industry finance-function study scores organizations 1–10 on AI maturity: ~17% score low (1–3), ~50% mid (4–6),
          ~33% high (7–10).<sup>2</sup> Kestra's composite ({stats.compositeAvg.toFixed(1)}/100) maps to{' '}
          <b className="tnum" style={{ color: 'var(--heading-color)' }}>≈{positionScore10.toFixed(1)}/10</b>.
        </p>
        <div className="pos-wrap">
          <div className="pos-flag" style={{ left: `${positionScore10 * 10}%` }}>
            <span className="t">Kestra · {positionScore10.toFixed(1)}/10</span>
            <span className="stem" />
          </div>
          <div className="pos-band">
            {MATURITY_TIERS.map((t) => (
              <div key={t.label} className="pos-seg" style={{ flex: t.share, background: t.color }}>{t.label.split(' ')[0]}</div>
            ))}
          </div>
        </div>
        <div className="pos-labels">
          {MATURITY_TIERS.map((t) => <span key={t.label}>~{t.share}% of orgs</span>)}
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 12.5, color: 'var(--ink-soft)' }}>
          Treat as directional: external surveys sample 300–2,773 firms; this program is one firm, {stats.n} respondents. The tier
          label matters less than the internal gap it sits on top of — individual readiness is running ahead of governed program execution.
        </p>
      </div>

      {/* ---------- METHODOLOGY ---------- */}
      <div className="zone-heading">
        <div className="zone-icon" style={{ opacity: 0.7 }}><ShieldCheck size={17} /></div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2 style={{ fontSize: 13, color: 'var(--ink-soft)' }}>How the Score Is Built</h2></div>
        </div>
      </div>
      <div className="card" style={{ borderStyle: 'dashed', background: 'var(--surface-alt)' }}>
        <div className="grid grid-2">
          <div>
            <div className="card-title">Dimension weights</div>
            {questions.dimensions.map((d) => {
              const val = stats.dimAverages.find((s) => s.key === d.key)?.value ?? 0;
              return (
                <div key={d.key} style={{ display: 'grid', gridTemplateColumns: '1fr 34px 84px 34px', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 11.5 }}>
                  <span>{d.label}</span>
                  <span style={{ textAlign: 'right', color: 'var(--ink-soft)' }}>{Math.round(d.weight * 100)}%</span>
                  <span style={{ height: 6, borderRadius: 3, background: 'var(--surface-sunk)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${val}%`, background: 'var(--blue)' }} />
                  </span>
                  <span className="tnum" style={{ textAlign: 'right', fontWeight: 700 }}>{val.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
          <div>
            <div className="card-title">Formula</div>
            <div style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, background: 'var(--surface-sunk)', borderRadius: 8, padding: '14px 16px', lineHeight: 1.85, overflowX: 'auto' }}>
              <div>composite = round(</div>
              {questions.dimensions.map((d, i) => (
                <div key={d.key}>&nbsp;&nbsp;{d.key} × {d.weight.toFixed(2)} {i < questions.dimensions.length - 1 ? '+' : ''}</div>
              ))}
              <div>)</div>
              <div style={{ marginTop: 8, color: 'var(--ink-soft)' }}>band: &lt;25 Not Yet Started · &lt;50 Emerging · &lt;75 Accelerating · ≥75 Leading</div>
            </div>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 11.5, color: 'var(--ink-soft)' }}>
          20 core questions (0/25/50/75/100 scale) across the 7 dimensions above, plus 2 role-specific questions per respondent
          ({questions.functions.length} functions). Discernment &amp; Compliance carry the heaviest weight deliberately — for a
          FINRA-regulated broker-dealer, catching a wrong AI output matters more than usage frequency.
        </p>
      </div>

      {/* ---------- SOURCES ---------- */}
      <div className="zone-heading">
        <div className="zone-icon" style={{ opacity: 0.7 }}>§</div>
        <div className="zone-heading-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2 style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Sources</h2></div>
        </div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11.5, color: 'var(--ink-soft)' }}>
        {SOURCES.map((s) => (
          <div key={s.n}>
            <span style={{ color: 'var(--gold-dark)', fontWeight: 700, marginRight: 6 }}>{s.n}</span>
            {s.text} <a href={s.url} target="_blank" rel="noopener" style={{ color: 'var(--blue-dark)' }}>{new URL(s.url).hostname} →</a>
          </div>
        ))}
      </div>

      <div className="mt-24" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
        Computed live from this app's database on every visit · n = {stats.n}, one firm, one round — read tier estimates as directional, not statistically powered.
      </div>
    </div>
  );
}
