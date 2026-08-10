import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { blueForValue } from '../../lib/colors';

export interface FnDatum {
  function: string;
  value: number;
  n: number;
}

export function CompositeByFunctionChart({ data, height = 280 }: { data: FnDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 12, left: 4, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="function" tick={{ fontSize: 10.5 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, _n, item: any) => [`${value.toFixed(0)} (n=${item?.payload?.n ?? 0})`, 'Composite avg']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
          {data.map((d, i) => (
            <Cell key={i} fill={blueForValue(d.value)} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
