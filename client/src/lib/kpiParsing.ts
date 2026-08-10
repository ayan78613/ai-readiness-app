// KPI current_value is free text (mix of numeric and qualitative per §6/§9).
// For the sparkline we only plot rows where the value parses cleanly as a
// number, optionally with a trailing % or leading $.
export function parseNumeric(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^-?\$?\s*(-?\d+(\.\d+)?)\s*%?$/);
  if (!match) return null;
  return Number(match[1]);
}
