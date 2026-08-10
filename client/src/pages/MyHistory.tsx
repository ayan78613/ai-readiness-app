import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Assessment, QuestionsResponse } from '../types';
import { CompositeTrendChart } from '../components/charts/CompositeTrendChart';
import { Sparkline } from '../components/charts/Sparkline';
import { BandBadge } from '../components/Badges';
import { getAnonToken } from '../lib/identity';

export function MyHistory() {
  const [meta, setMeta] = useState<{ anonymous_mode: boolean } | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMeta().then((m) => {
      setMeta(m);
      if (m.anonymous_mode) {
        const token = getAnonToken();
        setEmployeeId(token);
        setLookupId(token);
      }
    });
    api.getQuestions().then(setQuestions);
  }, []);

  useEffect(() => {
    if (!lookupId) return;
    setLoading(true);
    api.getAssessments({ employee_id: lookupId }).then((rows) => {
      setAssessments(rows);
      setLoading(false);
    });
  }, [lookupId]);

  const trendData = (assessments ?? []).map((a) => ({
    date: new Date(a.submitted_at).toLocaleDateString(),
    value: a.composite_score,
    roundLabel: a.round_label
  }));

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Your Progress</p>
        <h1 className="page-title">My History</h1>
        <p className="page-subtitle">Composite score and dimension trends across your past submissions.</p>
      </div>

      {meta && !meta.anonymous_mode && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 420 }}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Employee ID / initials</label>
            <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. JSM" />
          </div>
          <button className="btn btn-primary" onClick={() => setLookupId(employeeId.trim())} disabled={!employeeId.trim()}>
            Look Up History
          </button>
        </div>
      )}

      {loading && <p className="muted">Loading…</p>}

      {!loading && assessments && assessments.length === 0 && (
        <div className="card empty-state">No submissions yet for this identity. Complete a new assessment to start your history.</div>
      )}

      {!loading && assessments && assessments.length > 0 && questions && (
        <>
          <div className="card interactive" style={{ marginBottom: 20 }}>
            <div className="card-title">Composite Score Over Time</div>
            <CompositeTrendChart data={trendData} />
          </div>

          <div className="card-title" style={{ marginTop: 8, marginBottom: 12 }}>Dimension Trends</div>
          <div className="grid grid-4">
            {questions.dimensions.map((dim) => {
              const spark = (assessments ?? []).map((a) => ({
                label: new Date(a.submitted_at).toLocaleDateString(),
                value: (a as any)[dim.column] ?? 0
              }));
              const latest = spark[spark.length - 1]?.value ?? 0;
              return (
                <div key={dim.key} className="card interactive">
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{dim.label}</div>
                  <Sparkline data={spark} width={150} height={40} />
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{latest.toFixed(0)}</div>
                </div>
              );
            })}
          </div>

          <div className="card-title" style={{ marginTop: 32, marginBottom: 12 }}>Submission Log</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Round</th>
                <th>Function</th>
                <th>Composite</th>
                <th>Band</th>
              </tr>
            </thead>
            <tbody>
              {[...assessments].reverse().map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.submitted_at).toLocaleString()}</td>
                  <td>{a.round_label}</td>
                  <td>{a.function}</td>
                  <td>{a.composite_score.toFixed(0)}</td>
                  <td><BandBadge band={a.band} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
