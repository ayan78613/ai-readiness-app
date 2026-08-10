// Sequential single-hue ramp (light -> dark) of brand blue #57849B, for
// magnitude charts (bar fills, heatmap cells) per the "one hue per measure" rule.
const RAMP = ['#DCE7EB', '#C3D6DD', '#A9C4CF', '#8FB2C1', '#73A0B0', '#57849B', '#446B7E', '#345364'];

export function blueForValue(value: number, min = 0, max = 100): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const idx = Math.round(t * (RAMP.length - 1));
  return RAMP[idx];
}

export const BAND_COLORS: Record<string, string> = {
  'Not Yet Started': '#9AA0A6',
  Emerging: '#C98A2B',
  Accelerating: '#57849B',
  Leading: '#3E8E5B'
};

export const STATUS_COLORS: Record<string, string> = {
  'Not started': '#9AA0A6',
  'On track': '#3E8E5B',
  'At risk': '#C98A2B',
  'Off track': '#C0483F',
  Complete: '#57849B'
};

export function bandClass(band: string): string {
  return 'badge-band-' + band.toLowerCase().replace(/\s+/g, '-');
}

export function statusClass(status: string): string {
  return 'badge-status-' + status.toLowerCase().replace(/\s+/g, '-');
}
