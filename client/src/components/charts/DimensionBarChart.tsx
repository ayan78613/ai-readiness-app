import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { blueForValue } from '../../lib/colors';

export interface DimBarDatum {
  label: string;
  value: number;
}

export function DimensionBarChart({ data, height = 280 }: { data: DimBarDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-hairline)" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="label" width={190} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={blueForValue(d.value)} />
          ))}
          <LabelList dataKey="value" position="right" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 11, fill: 'var(--ink)' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
