import { AlertTriangle, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import type { Recommendation } from '../lib/recommendations';

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
  return (
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
              <div className="recommendation-detail">{rec.detail}</div>
              {rec.tag && <div className="recommendation-tag">{rec.tag}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
