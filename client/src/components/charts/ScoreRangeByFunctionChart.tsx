import { Bar, CartesianGrid, Cell, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis, ComposedChart } from 'recharts';
import { blueForValue } from '../../lib/colors';

export interface RangeDatum {
  function: string;
  min: number;
  max: number;
  avg: number;
  n: number;
}

// Floating min-max range bars with an average marker — shows spread within a
// function, not just its average, the way Deloitte/McKinsey range charts do
// (a single average bar can hide a function that's badly split between
// power users and non-users).
export function ScoreRangeByFunctionChart({ data, height = 300 }: { data: RangeDatum[]; height?: number }) {
  const chartData = data.map((d) => ({ ...d, base: d.min, range: d.max - d.min }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="function" tick={{ fontSize: 10.5 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, key: string, item: any) => {
            if (key === 'range') return [`${item.payload.min.toFixed(0)}–${item.payload.max.toFixed(0)}`, 'Range'];
            if (key === 'avg') return [value.toFixed(1), 'Average'];
            return [value, key];
          }}
        />
        <Bar dataKey="base" stackId="range" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="range" stackId="range" radius={[6, 6, 6, 6]} barSize={26}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={blueForValue(d.avg)} fillOpacity={0.55} />
          ))}
        </Bar>
        <Scatter dataKey="avg" fill="#C09A4F" shape={(props: any) => {
          const { cx, cy } = props;
          return <circle cx={cx} cy={cy} r={5} fill="#C09A4F" stroke="#fff" strokeWidth={1.5} />;
        }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
