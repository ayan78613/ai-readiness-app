import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TrendPoint {
  date: string;
  value: number;
  roundLabel?: string;
}

export function CompositeTrendChart({ data, height = 260 }: { data: TrendPoint[]; height?: number }) {
  const lastIndex = data.length - 1;

  const renderLastLabel = (props: any) => {
    if (props.index !== lastIndex) return <g />;
    return (
      <text x={props.x + 10} y={props.y + 4} fontSize={13} fontWeight={700} fill="#9C7C3D">
        {props.value.toFixed(0)}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 46, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(v: number, _n, item: any) => [v.toFixed(0), item?.payload?.roundLabel ?? 'Composite score']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#C09A4F"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#C09A4F' }}
          label={renderLastLabel}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
