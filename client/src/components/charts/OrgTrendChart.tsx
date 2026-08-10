import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface OrgTrendRow {
  date: string;
  org: number;
  [fnKey: string]: number | string;
}

export function OrgTrendChart({ data, functionKeys, height = 300 }: { data: OrgTrendRow[]; functionKeys: string[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {functionKeys.map((fk) => (
          <Line key={fk} type="monotone" dataKey={fk} stroke="#B7BEC4" strokeWidth={1} dot={false} legendType="none" name={fk} />
        ))}
        <Line type="monotone" dataKey="org" stroke="#C09A4F" strokeWidth={3} dot={{ r: 3 }} name="Org average" />
      </LineChart>
    </ResponsiveContainer>
  );
}
