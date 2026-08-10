import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ParticipationPoint {
  date: string;
  cumulative: number;
}

// Cumulative distinct employees assessed over time — the classic "adoption
// S-curve" used throughout Stanford HAI, PwC, and McKinsey adoption-over-time
// charts, computed here from first-submission dates rather than survey waves.
export function CumulativeParticipationChart({ data, height = 240 }: { data: ParticipationPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="participationFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57849B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#57849B" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number) => [value, 'Cumulative employees assessed']}
        />
        <Area type="monotone" dataKey="cumulative" stroke="#57849B" strokeWidth={2} fill="url(#participationFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
