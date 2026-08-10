import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';
import { BAND_COLORS } from '../../lib/colors';

export function ScoreGauge({ score, band }: { score: number; band: string }) {
  const data = [{ name: 'score', value: score, fill: 'url(#goldGaugeGradient)' }];
  return (
    <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
      <RadialBarChart
        width={220}
        height={220}
        cx="50%"
        cy="50%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={16}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <defs>
          <linearGradient id="goldGaugeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-light)" />
          </linearGradient>
        </defs>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: 'var(--gauge-track)' }} dataKey="value" cornerRadius={8} isAnimationActive />
      </RadialBarChart>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 44, fontWeight: 600, lineHeight: 1, color: 'var(--heading-color)' }}>
          {Math.round(score)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>/ 100</div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: BAND_COLORS[band] ?? '#666' }}>{band}</div>
      </div>
    </div>
  );
}
