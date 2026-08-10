import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export interface SparkPoint {
  label: string;
  value: number;
}

export function Sparkline({ data, height = 18, width = 90, color = '#57849B' }: { data: SparkPoint[]; height?: number; width?: number; color?: string }) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip
          contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
          labelFormatter={(l) => l}
          formatter={(v: number) => [v, 'Value']}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
