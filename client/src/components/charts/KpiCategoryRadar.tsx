import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface CategoryReadinessDatum {
  category: string;
  pctReady: number;
}

// % of each KPI category's items that are On track or Complete, plotted
// against a 100%-target ring — the Gartner 7-pillar radar pattern applied to
// the management/KPI side of the framework rather than the individual
// assessment side (see DimensionRadarChart for that half).
export function KpiCategoryRadar({ data, height = 320 }: { data: CategoryReadinessDatum[]; height?: number }) {
  const chartData = data.map((d) => ({ ...d, target: 100 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} outerRadius="66%">
        <PolarGrid stroke="var(--border-hairline)" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10.5 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={5} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, name: string) => [`${value.toFixed(0)}%`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Radar name="Target" dataKey="target" stroke="#B7BEC4" strokeDasharray="4 4" fill="transparent" strokeWidth={1.5} />
        <Radar name="% On track / Complete" dataKey="pctReady" stroke="#57849B" fill="#57849B" fillOpacity={0.3} strokeWidth={2.5} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
