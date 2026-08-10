import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BAND_COLORS } from '../../lib/colors';

const ORDER = ['Not Yet Started', 'Emerging', 'Accelerating', 'Leading'];

export function BandDistributionChart({ counts, height = 260 }: { counts: Record<string, number>; height?: number }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const data = ORDER.map((band) => {
    const count = counts[band] ?? 0;
    const pct = Math.round((count / total) * 100);
    return { band, count, pct, labelText: `${count} (${pct}%)` };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="band" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, _n, item: any) => [`${value} (${item?.payload?.pct}%)`, 'Employees']}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={64}>
          {data.map((d) => (
            <Cell key={d.band} fill={BAND_COLORS[d.band]} />
          ))}
          <LabelList dataKey="labelText" position="top" style={{ fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
