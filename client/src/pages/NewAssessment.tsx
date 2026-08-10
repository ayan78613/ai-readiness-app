import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { QuestionsResponse } from '../types';
import { getAnonToken } from '../lib/identity';

export function NewAssessment() {
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [meta, setMeta] = useState<{ anonymous_mode: boolean } | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [fn, setFn] = useState('');
  const [roundLabel, setRoundLabel] = useState('Baseline');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getQuestions().then(setData);
    api.getMeta().then(setMeta);
  }, []);

  useEffect(() => {
    if (meta?.anonymous_mode) setEmployeeId(getAnonToken());
  }, [meta]);

  const roleQuestions = useMemo(() => {
    if (!data || !fn) return [];
    return data.roleModules[fn]?.questions ?? [];
  }, [data, fn]);

  const allQuestions = useMemo(() => {
    if (!data) return [];
    return [...data.coreQuestions, ...roleQuestions];
  }, [data, roleQuestions]);

  const isComplete =
    employeeId.trim() &&
    fn &&
    allQuestions.length > 0 &&
    allQuestions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    if (!isComplete) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.submitAssessment({
        employee_id: employeeId.trim(),
        function: fn,
        round_label: roundLabel.trim() || 'Baseline',
        answers
      });
      navigate(`/results/${result.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!data || !meta) {
    return <div className="page"><p className="muted">Loading assessment…</p></div>;
  }

  const dimensionsWithQuestions = data.dimensions.map((dim) => ({
    dim,
    questions: data.coreQuestions.filter((q) => q.dimension === dim.key)
  }));

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">AI Readiness Self-Assessment</p>
        <h1 className="page-title">New Assessment</h1>
        <p className="page-subtitle">20 core questions plus 2 questions for your role — about 8–10 minutes.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="grid grid-3">
          {!meta.anonymous_mode && (
            <div className="field">
              <label>Employee ID / initials</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. JSM"
              />
            </div>
          )}
          {meta.anonymous_mode && (
            <div className="field">
              <label>Your identity</label>
              <input type="text" value="Anonymous (token saved in this browser)" disabled />
            </div>
          )}
          <div className="field">
            <label>Function</label>
            <select value={fn} onChange={(e) => { setFn(e.target.value); setAnswers({}); }}>
              <option value="">Select your function…</option>
              {data.functions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Round label</label>
            <input type="text" value={roundLabel} onChange={(e) => setRoundLabel(e.target.value)} placeholder="Baseline" />
          </div>
        </div>
      </div>

      {dimensionsWithQuestions.map(({ dim, questions }) => (
        <section key={dim.key}>
          <div className="section-divider">
            <span className="label">{dim.label} <span className="weight">({Math.round(dim.weight * 100)}%)</span></span>
            <span className="line" />
          </div>
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
          ))}
        </section>
      ))}

      {fn && roleQuestions.length > 0 && (
        <section>
          <div className="section-divider">
            <span className="label">Role Module — {fn}</span>
            <span className="line" />
          </div>
          {roleQuestions.map((q) => (
            <QuestionCard key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
          ))}
        </section>
      )}

      {!fn && <p className="muted mt-24">Select your function above to see your role-specific questions.</p>}

      {error && <p style={{ color: 'var(--status-off-track)' }}>{error}</p>}

      <div className="mt-24" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={!isComplete || submitting} onClick={handleSubmit}>
          {submitting ? 'Submitting…' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ q, value, onChange }: { q: { id: string; text: string; options: { label: string; score: number }[] }; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="card question-card">
      <div className="question-text">{q.text}</div>
      <div className="option-row">
        {q.options.map((opt) => (
          <button
            key={opt.score}
            type="button"
            className={`option-btn${value === opt.score ? ' selected' : ''}`}
            onClick={() => onChange(opt.score)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
