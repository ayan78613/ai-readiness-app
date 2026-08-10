import { blueForValue } from '../../lib/colors';

interface Props {
  functions: string[];
  dimensions: { key: string; label: string }[];
  matrix: Record<string, Record<string, number | null>>; // matrix[function][dimensionKey]
}

export function DimensionHeatmap({ functions, dimensions, matrix }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        className="heatmap"
        style={{ gridTemplateColumns: `160px repeat(${dimensions.length}, 1fr)`, minWidth: 720 }}
      >
        <div />
        {dimensions.map((d) => (
          <div key={d.key} className="heatmap-header">{d.label}</div>
        ))}

        {functions.map((fn) => (
          <FnRow key={fn} fn={fn} dimensions={dimensions} row={matrix[fn]} />
        ))}
      </div>
    </div>
  );
}

function FnRow({ fn, dimensions, row }: { fn: string; dimensions: { key: string; label: string }[]; row: Record<string, number | null> }) {
  return (
    <>
      <div className="heatmap-rowlabel">{fn}</div>
      {dimensions.map((d) => {
        const v = row?.[d.key];
        return (
          <div
            key={d.key}
            className="heatmap-cell"
            title={`${fn} — ${d.label}: ${v !== null && v !== undefined ? v.toFixed(0) : 'n/a'}`}
            style={{ background: v !== null && v !== undefined ? blueForValue(v) : '#EDEDED', color: v !== null && v !== undefined && v > 60 ? '#fff' : '#3A3A3A' }}
          >
            {v !== null && v !== undefined ? v.toFixed(0) : '—'}
          </div>
        );
      })}
    </>
  );
}
