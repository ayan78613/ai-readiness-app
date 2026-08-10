import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface RadarDatum {
  dimension: string;
  current: number;
  previous?: number | null;
}

// Org dimension profile, round-over-round — Gartner 7-pillar / WEF-IMF country
// readiness radar pattern, applied to our 7 assessment dimensions.
export function DimensionRadarChart({ data, previousLabel, currentLabel, height = 320 }: { data: RadarDatum[]; previousLabel?: string; currentLabel: string; height?: number }) {
  const hasPrevious = previousLabel && data.some((d) => d.previous !== null && d.previous !== undefined);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border-hairline)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={5} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {hasPrevious && (
          <Radar name={previousLabel} dataKey="previous" stroke="#B7BEC4" fill="#B7BEC4" fillOpacity={0.15} strokeWidth={1.5} />
        )}
        <Radar name={currentLabel} dataKey="current" stroke="#C09A4F" fill="#C09A4F" fillOpacity={0.28} strokeWidth={2.5} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
