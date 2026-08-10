import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Label } from 'recharts';
import { BAND_COLORS } from '../../lib/colors';

export interface QuadrantDatum {
  function: string;
  usage: number;
  governance: number; // avg of discernment + compliance
  n: number;
  band: string;
}

// x = Usage & Frequency, y = avg(Discernment & Verification, Data Handling &
// Regulatory Awareness) — "adoption speed vs. control readiness" quadrant,
// after MIT Sloan/BCG's Pioneers-Investigators-Experimenters-Passives matrix
// and BCG AI Radar's investment-vs-value gap framing, reframed for a
// FINRA-regulated context where fast adoption without governance is the risk.
export function UsageGovernanceQuadrant({ data, height = 340 }: { data: QuadrantDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid stroke="var(--border-hairline)" />
        <XAxis type="number" dataKey="usage" domain={[0, 100]} name="Usage & Frequency" tick={{ fontSize: 11 }}>
          <Label value="Usage & Frequency →" position="insideBottom" offset={-12} style={{ fontSize: 11, fill: 'var(--ink-soft)' }} />
        </XAxis>
        <YAxis type="number" dataKey="governance" domain={[0, 100]} name="Governance Readiness" tick={{ fontSize: 11 }}>
          <Label value="Governance Readiness →" angle={-90} position="insideLeft" style={{ fontSize: 11, fill: 'var(--ink-soft)', textAnchor: 'middle' }} />
        </YAxis>
        <ZAxis type="number" dataKey="n" range={[120, 400]} name="Submissions" />
        <ReferenceLine x={50} stroke="var(--border-hairline)" strokeDasharray="4 4" />
        <ReferenceLine y={50} stroke="var(--border-hairline)" strokeDasharray="4 4" />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number, name: string) => [value.toFixed(1), name]}
          labelFormatter={() => ''}
        />
        <Scatter data={data} shape={(props: any) => <CustomDot {...props} />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  const fill = BAND_COLORS[payload.band] ?? '#57849B';
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ink)">
        {payload.function}
      </text>
    </g>
  );
}
