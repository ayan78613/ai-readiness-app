import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BAND_COLORS } from '../../lib/colors';

const BAND_ORDER = ['Not Yet Started', 'Emerging', 'Accelerating', 'Leading'];

export interface BandMigrationRow {
  round: string;
  [band: string]: number | string;
}

// Band composition across every round (not just the current filter snapshot)
// — mirrors how Gartner and McKinsey track cohorts migrating between maturity
// stages release over release, rather than a single point-in-time bar.
export function BandMigrationAreaChart({ data, height = 280 }: { data: BandMigrationRow[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis dataKey="round" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {BAND_ORDER.map((band) => (
          <Area
            key={band}
            type="monotone"
            dataKey={band}
            stackId="1"
            stroke={BAND_COLORS[band]}
            fill={BAND_COLORS[band]}
            fillOpacity={0.65}
            name={band}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
