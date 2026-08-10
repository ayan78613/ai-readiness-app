import type { Assessment, KpisResponse, MetaResponse, QuestionsResponse } from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors?.join(' ') || body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getQuestions: () => req<QuestionsResponse>('/questions'),

  submitAssessment: (payload: {
    employee_id: string;
    function: string;
    round_label: string;
    answers: Record<string, number>;
  }) => req<Assessment>('/assessments', { method: 'POST', body: JSON.stringify(payload) }),

  getAssessment: (id: number | string) => req<Assessment>(`/assessments/${id}`),

  getAssessments: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return req<Assessment[]>(`/assessments${suffix}`);
  },

  getKpis: () => req<KpisResponse>('/kpis'),

  updateKpi: (kpiKey: string, payload: { current_value?: string; status?: string; owner?: string; baseline_value?: string }) =>
    req(`/kpis/${kpiKey}`, { method: 'POST', body: JSON.stringify(payload) }),

  getMeta: () => req<MetaResponse>('/meta'),

  exportUrl: (table: 'assessments' | 'kpi_records', format: 'csv' | 'json') => `/api/export/${table}.${format}`
};
