import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { Assessment, QuestionsResponse } from '../types';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { DimensionBarChart } from '../components/charts/DimensionBarChart';
import { StatTile } from '../components/StatTile';
import { BandBadge } from '../components/Badges';
import { RecommendationList } from '../components/RecommendationList';
import { getIndividualRecommendations } from '../lib/recommendations';
import { Sparkles, Target, UserCircle2, CalendarClock } from 'lucide-react';

export function Results() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getAssessment(id).then(setAssessment).catch((e) => setError(e.message));
    api.getQuestions().then(setQuestions);
  }, [id]);

  if (error) return <div className="page"><p>{error}</p></div>;
  if (!assessment || !questions) return <div className="page"><p className="muted">Loading results…</p></div>;

  const dimData = questions.dimensions.map((dim) => ({
    label: dim.label,
    value: (assessment as any)[dim.column] ?? 0
  }));

  const submittedLocal = new Date(assessment.submitted_at).toLocaleString();

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Results</p>
        <h1 className="page-title">Your AI Readiness Score</h1>
        <p className="page-subtitle">
          Assessment completed on: <strong>{submittedLocal}</strong> · {assessment.function} · {assessment.round_label}
        </p>
      </div>

      <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
        <div className="card interactive text-center">
          <div className="card-title">Composite Score</div>
          <ScoreGauge score={assessment.composite_score} band={assessment.band} />
          <div className="mt-24"><BandBadge band={assessment.band} /></div>
        </div>

        <div className="card interactive" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Dimension Scores</div>
          <DimensionBarChart data={dimData} />
        </div>
      </div>

      <div className="grid grid-3 mt-24">
        <div className="card interactive">
          <StatTile
            icon={Target}
            label="Functional Score"
            value={assessment.functional_score !== null ? assessment.functional_score.toFixed(0) : '—'}
            sub={`Role module average for ${assessment.function} — reported separately from the composite score`}
          />
        </div>
        <div className="card interactive">
          <StatTile icon={UserCircle2} label="Employee" value={assessment.employee_id} sub={assessment.function} />
        </div>
        <div className="card interactive">
          <StatTile icon={CalendarClock} label="Round" value={assessment.round_label} sub={submittedLocal} />
        </div>
      </div>

      <div className="card recommendation-card mt-24">
        <div className="chart-card-heading" style={{ marginBottom: 14 }}>
          <div className="chart-card-icon"><Sparkles size={15} /></div>
          <div className="card-title" style={{ margin: 0 }}>Recommended Next Steps — {assessment.function}</div>
        </div>
        <RecommendationList recommendations={getIndividualRecommendations(assessment, questions.dimensions)} />
      </div>

      <div className="mt-24">
        <Link to="/history" className="btn btn-secondary">View My History</Link>
      </div>
    </div>
  );
}
