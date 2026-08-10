import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS_COLORS } from '../../lib/colors';

const STATUS_ORDER = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

export interface GovernanceTrendRow {
  date: string;
  [status: string]: number | string;
}

// Status composition of the 7 Governance, Risk & Compliance KPIs over time,
// reconstructed point-in-time from the append-only kpi_records log. Governance
// is the largest KPI category and the one FINRA's 2026 oversight report
// singles out for GenAI supervision, so it gets its own dedicated trend
// (Deloitte's reports treat "governance readiness to scale" the same way).
export function GovernanceTrendAreaChart({ data, height = 260 }: { data: GovernanceTrendRow[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} domain={[0, 7]} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {STATUS_ORDER.map((s) => (
          <Area key={s} type="monotone" dataKey={s} stackId="1" stroke={STATUS_COLORS[s]} fill={STATUS_COLORS[s]} fillOpacity={0.65} name={s} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
