import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TrainingReadinessDatum {
  function: string;
  training: number;
  composite: number;
}

// Training investment vs. overall readiness, per function — after Microsoft's
// Work Trend Index framing of maturity-index inputs against outcomes, and
// PwC's "does the investment show up in the result" comparisons.
export function TrainingVsReadinessChart({ data, height = 280 }: { data: TrainingReadinessDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="function" tick={{ fontSize: 10.5 }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="training" name="Training & Enablement score" fill="#57849B" radius={[4, 4, 0, 0]} barSize={18} />
        <Bar dataKey="composite" name="Composite score" fill="#C09A4F" radius={[4, 4, 0, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
