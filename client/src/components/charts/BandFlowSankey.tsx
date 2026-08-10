import { Layer, ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { BAND_COLORS } from '../../lib/colors';

export interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

// Baseline-band -> latest-band flow per returning employee — the cohort
// migration diagram pattern used in enterprise-transformation reports to show
// who actually moved maturity stages, not just the aggregate distribution.
export function BandFlowSankey({ data, height = 280 }: { data: SankeyData; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Sankey
        data={data}
        nodePadding={24}
        margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
        link={{ stroke: '#B7BEC4', strokeOpacity: 0.35 }}
        node={<SankeyNode />}
      >
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-hairline)' }}
          formatter={(value: number) => [value, 'Employees']}
        />
      </Sankey>
    </ResponsiveContainer>
  );
}

function SankeyNode(props: any) {
  const { x, y, width, height, payload } = props;
  const bandName = String(payload.name).replace(/ \((First|Latest)\)$/, '');
  const fill = BAND_COLORS[bandName] ?? '#57849B';
  const isLeft = x < 200;
  return (
    <Layer>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} rx={2} />
      <text
        x={isLeft ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isLeft ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={11}
        fill="var(--ink)"
      >
        {payload.name}
      </text>
    </Layer>
  );
}
