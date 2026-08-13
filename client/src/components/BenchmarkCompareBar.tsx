import type { Comparison } from '../lib/externalBenchmarks';
import { computeVerdict } from '../lib/externalBenchmarks';

const VERDICT_BADGE_CLASS: Record<string, string> = {
  good: 'badge-status-on-track',
  warn: 'badge-status-at-risk',
  bad: 'badge-status-off-track'
};
const VERDICT_DOT_VAR: Record<string, string> = {
  good: 'var(--status-on-track)',
  warn: 'var(--status-at-risk)',
  bad: 'var(--status-off-track)'
};

function formatValue(v: number): string {
  const rounded = Math.round(v * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function BenchmarkCompareBar({ comparison, us }: { comparison: Comparison; us: number }) {
  const { verdict, text } = computeVerdict(us, comparison.external);
  const maxVal = Math.max(us, ...comparison.external.map((e) => e.value), 50);
  const rows = [
    { label: 'Kestra', value: us, us: true },
    ...comparison.external.map((e) => ({ label: e.label, value: e.value, us: false }))
  ];

  return (
    <div className="card compare-card">
      <div className="compare-head">
        <div className="compare-title">{comparison.title}</div>
        <span className={`badge ${VERDICT_BADGE_CLASS[verdict]}`}>
          <span className="dot" style={{ background: VERDICT_DOT_VAR[verdict] }} />
          {text}
        </span>
      </div>
      <div className="muted" style={{ fontSize: 11.5 }}>{comparison.note}</div>
      <div className="compare-bars">
        {rows.map((r, i) => {
          const w = Math.max(3, (r.value / maxVal) * 100);
          return (
            <div className="compare-bar-row" key={i}>
              <div className={`compare-bar-label${r.us ? ' us' : ''}`}>{r.label}</div>
              <div className="compare-bar-track">
                <div
                  className="compare-bar-fill"
                  style={{ width: `${w}%`, background: r.us ? 'var(--gold)' : 'var(--blue)' }}
                />
              </div>
              <div className="compare-bar-val tnum">{formatValue(r.value)}{comparison.unit}</div>
            </div>
          );
        })}
      </div>
      <div className="compare-caption">
        {comparison.caption}
        {comparison.sourceRefs.map((n) => <sup key={n}>{n}</sup>)}
      </div>
    </div>
  );
}
