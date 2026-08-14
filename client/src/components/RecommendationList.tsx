import { AlertTriangle, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import type { Recommendation } from '../lib/recommendations';
import { SOURCES } from '../lib/externalBenchmarks';

const PRIORITY_META: Record<string, { label: string; icon: typeof Info }> = {
  high: { label: 'High priority', icon: AlertTriangle },
  medium: { label: 'Medium priority', icon: ArrowUpRight },
  low: { label: 'Worth noting', icon: Info },
  positive: { label: 'On track', icon: CheckCircle2 }
};

export function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return <p className="muted">No specific actions flagged right now — scores are balanced across dimensions.</p>;
  }

  const citedNumbers = Array.from(new Set(recommendations.flatMap((r) => r.references ?? []))).sort((a, b) => a - b);
  const citedSources = SOURCES.filter((s) => citedNumbers.includes(s.n));

  return (
    <div>
      <div className="recommendation-list">
        {recommendations.map((rec, i) => {
          const meta = PRIORITY_META[rec.priority];
          const Icon = meta.icon;
          return (
            <div className={`recommendation-item priority-${rec.priority}`} key={i}>
              <div className="recommendation-icon">
                <Icon size={16} />
              </div>
              <div>
                <div className="recommendation-title">{rec.title}</div>
                <div className="recommendation-detail">
                  {rec.detail}
                  {rec.references?.map((n) => <sup key={n} className="recommendation-ref">{n}</sup>)}
                </div>
                {rec.tag && <div className="recommendation-tag">{rec.tag}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {citedSources.length > 0 && (
        <div className="recommendation-sources">
          {citedSources.map((s) => (
            <div key={s.n}>
              <span className="n">{s.n}</span>
              {s.text} <a href={s.url} target="_blank" rel="noopener">{new URL(s.url).hostname} →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
