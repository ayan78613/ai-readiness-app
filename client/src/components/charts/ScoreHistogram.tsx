import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { blueForValue } from '../../lib/colors';

const BIN_SIZE = 20;

export function ScoreHistogram({ scores, height = 260 }: { scores: number[]; height?: number }) {
  const bins = Array.from({ length: 5 }, (_, i) => {
    const lo = i * BIN_SIZE;
    const hi = lo + BIN_SIZE;
    const label = `${lo}–${hi}`;
    const count = scores.filter((s) => (i === 4 ? s >= lo && s <= hi : s >= lo && s < hi)).length;
    return { label, count, mid: lo + BIN_SIZE / 2 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bins} margin={{ top: 24, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number) => [value, 'Employees']}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={54}>
          {bins.map((b, i) => (
            <Cell key={i} fill={blueForValue(b.mid)} />
          ))}
          <LabelList dataKey="count" position="top" style={{ fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
