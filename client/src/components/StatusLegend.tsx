import { STATUS_COLORS } from '../lib/colors';

const ORDER = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

export function StatusLegend() {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10, fontSize: 11.5 }}>
      {ORDER.map((s) => (
        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: STATUS_COLORS[s], display: 'inline-block' }} />
          {s}
        </span>
      ))}
    </div>
  );
}
