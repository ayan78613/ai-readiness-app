import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface RiskDatum {
  category: string;
  atRiskCount: number;
  total: number;
}

const RISK_RAMP = ['#F2D9C4', '#E9BE9C', '#DFA274', '#D3854D', '#C0483F'];

function riskColor(count: number, max: number): string {
  const t = max > 0 ? count / max : 0;
  const idx = Math.round(t * (RISK_RAMP.length - 1));
  return RISK_RAMP[Math.max(0, idx)];
}

// Categories ranked by concentration of "At risk" + "Off track" KPIs — the
// ranked-bar-of-barriers pattern IBM's Global AI Adoption Index uses for
// adoption obstacles, repurposed here to show where governance attention is
// most needed right now.
export function KpiRiskParetoChart({ data, height = 260 }: { data: RiskDatum[]; height?: number }) {
  const sorted = [...data].sort((a, b) => b.atRiskCount - a.atRiskCount);
  const max = Math.max(...sorted.map((d) => d.atRiskCount), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-hairline)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="category" width={190} tick={{ fontSize: 11.5 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, _n, item: any) => [`${value} of ${item?.payload?.total}`, 'At risk / Off track']}
        />
        <Bar dataKey="atRiskCount" radius={[0, 6, 6, 0]} barSize={18}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={riskColor(d.atRiskCount, max)} />
          ))}
          <LabelList dataKey="atRiskCount" position="right" style={{ fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
