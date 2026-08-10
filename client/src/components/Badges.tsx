import { BAND_COLORS, STATUS_COLORS, bandClass, statusClass } from '../lib/colors';

export function BandBadge({ band }: { band: string }) {
  return (
    <span className={`badge ${bandClass(band)}`}>
      <span className="dot" style={{ background: BAND_COLORS[band] ?? '#999' }} />
      {band}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      <span className="dot" style={{ background: STATUS_COLORS[status] ?? '#999' }} />
      {status}
    </span>
  );
}
