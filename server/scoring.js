import { DIMENSIONS, CORE_QUESTIONS, ROLE_MODULES } from './questionBank.js';

function average(values) {
  const nums = values.filter(v => v !== null && v !== undefined && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// answers: { q1: 75, q2: 50, ... } — 0/25/50/75/100 or null
export function scoreAssessment(answers, fn) {
  const dimensionScores = {};
  for (const dim of DIMENSIONS) {
    const qIds = CORE_QUESTIONS.filter(q => q.dimension === dim.key).map(q => q.id);
    dimensionScores[dim.column] = average(qIds.map(id => answers[id]));
  }

  const composite_score = Math.round(
    DIMENSIONS.reduce((sum, dim) => sum + (dimensionScores[dim.column] ?? 0) * dim.weight, 0)
  );

  let band;
  if (composite_score < 25) band = 'Not Yet Started';
  else if (composite_score < 50) band = 'Emerging';
  else if (composite_score < 75) band = 'Accelerating';
  else band = 'Leading';

  const roleMod = ROLE_MODULES[fn];
  const functional_score = roleMod
    ? average(roleMod.questions.map(q => answers[q.id]))
    : null;

  return { ...dimensionScores, composite_score, band, functional_score };
}
