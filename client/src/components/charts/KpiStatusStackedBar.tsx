import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS_COLORS } from '../../lib/colors';

const STATUS_ORDER = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

export function KpiStatusStackedBar({
  counts,
  label,
  height = 90,
  showLegend = true
}: {
  counts: Record<string, number>;
  label: string;
  height?: number;
  showLegend?: boolean;
}) {
  const row: Record<string, number | string> = { name: label };
  for (const s of STATUS_ORDER) row[s] = counts[s] ?? 0;
  const data = [row];
  const total = STATUS_ORDER.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, total || 1]} hide />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {STATUS_ORDER.map((s) => (
          <Bar key={s} dataKey={s} stackId="status" fill={STATUS_COLORS[s]} barSize={30} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
