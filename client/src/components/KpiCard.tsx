import { useState } from 'react';
import type { KpiWithHistory } from '../types';
import { StatusBadge } from './Badges';
import { Sparkline } from './charts/Sparkline';
import { parseNumeric } from '../lib/kpiParsing';
import { api } from '../api';
import { STATUS_COLORS } from '../lib/colors';

const STATUS_OPTIONS = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

export function KpiCard({ kpi, onUpdated }: { kpi: KpiWithHistory; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(kpi.current_value ?? '');
  const [status, setStatus] = useState(kpi.status);
  const [owner, setOwner] = useState(kpi.owner ?? '');
  const [saving, setSaving] = useState(false);

  const sparkData = kpi.history
    .map((h) => ({ label: new Date(h.recorded_at).toLocaleDateString(), value: parseNumeric(h.current_value) }))
    .filter((p): p is { label: string; value: number } => p.value !== null);

  async function save() {
    setSaving(true);
    try {
      await api.updateKpi(kpi.kpi_key, { current_value: currentValue, status, owner });
      setEditing(false);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card interactive kpi-row" style={{ marginBottom: 10, borderLeft: `3px solid ${STATUS_COLORS[kpi.status]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{kpi.kpi_name}</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{kpi.definition}</div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Source: {kpi.data_source}</div>
        </div>

        <div style={{ minWidth: 110, textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 11 }}>Baseline</div>
          <div style={{ fontSize: 13 }}>{kpi.baseline_value || '—'}</div>
        </div>
        <div style={{ minWidth: 150, textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 11 }}>Target</div>
          <div style={{ fontSize: 13 }}>{kpi.target_value}</div>
        </div>
        <div style={{ minWidth: 110, textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 11 }}>Current</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{kpi.current_value || '—'}</div>
          {sparkData.length > 1 && <Sparkline data={sparkData} width={100} height={20} />}
        </div>
        <div style={{ minWidth: 130 }}>
          <div className="muted" style={{ fontSize: 11, textAlign: 'right' }}>Status</div>
          <div style={{ textAlign: 'right', marginTop: 2 }}><StatusBadge status={kpi.status} /></div>
          <div className="muted" style={{ fontSize: 11, textAlign: 'right', marginTop: 4 }}>{kpi.owner || 'Unowned'}</div>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={() => setEditing((e) => !e)}>
            {editing ? 'Cancel' : 'Update'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-4 mt-24" style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 16 }}>
          <div className="field">
            <label>Current value</label>
            <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="e.g. 42% or Pass" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Owner</label>
            <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. J. Alvarez" />
          </div>
          <div style={{ alignSelf: 'end', marginBottom: 18 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save (new record)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
