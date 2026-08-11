import { Router } from 'express';
import { db } from '../db.js';
import { scoreAssessment } from '../scoring.js';
import { FUNCTIONS, ROLE_MODULES, CORE_QUESTIONS, allQuestionIds } from '../questionBank.js';

const router = Router();

const VALID_SCORES = new Set([0, 25, 50, 75, 100]);
const ALL_QUESTION_IDS = Array.from({ length: 36 }, (_, i) => `q${i + 1}`);

function validateSubmission(body) {
  const errors = [];
  const { employee_id, function: fn, round_label, answers } = body;

  if (!employee_id || typeof employee_id !== 'string' || !employee_id.trim()) {
    errors.push('employee_id is required.');
  }
  if (!fn || !FUNCTIONS.includes(fn)) {
    errors.push(`function must be one of: ${FUNCTIONS.join(', ')}`);
  }
  if (round_label !== undefined && typeof round_label !== 'string') {
    errors.push('round_label must be a string.');
  }
  if (!answers || typeof answers !== 'object') {
    errors.push('answers is required.');
    return errors;
  }

  if (FUNCTIONS.includes(fn)) {
    const requiredIds = allQuestionIds(fn);
    for (const id of requiredIds) {
      const val = answers[id];
      if (val === undefined || val === null || !VALID_SCORES.has(Number(val))) {
        errors.push(`answers.${id} is required and must be one of 0/25/50/75/100.`);
      }
    }
  }

  return errors;
}

router.post('/', (req, res) => {
  const errors = validateSubmission(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { employee_id, function: fn, round_label, answers } = req.body;

  const fullAnswers = {};
  for (const id of ALL_QUESTION_IDS) {
    fullAnswers[id] = answers[id] !== undefined ? Number(answers[id]) : null;
  }

  const scores = scoreAssessment(fullAnswers, fn);
  const submitted_at = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO assessments
      (employee_id, function, round_label, submitted_at, answers_json,
       usage_score, delegation_score, context_score, discernment_score,
       compliance_score, training_score, mindset_score,
       composite_score, band, functional_score)
    VALUES
      (@employee_id, @function, @round_label, @submitted_at, @answers_json,
       @usage_score, @delegation_score, @context_score, @discernment_score,
       @compliance_score, @training_score, @mindset_score,
       @composite_score, @band, @functional_score)
  `);

  const info = stmt.run({
    employee_id: employee_id.trim(),
    function: fn,
    round_label: round_label && round_label.trim() ? round_label.trim() : 'Baseline',
    submitted_at,
    answers_json: JSON.stringify(fullAnswers),
    ...scores
  });

  const row = db.prepare('SELECT * FROM assessments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(serialize(row));
});

router.get('/', (req, res) => {
  const { employee_id, round_label, function: fn, date_from, date_to } = req.query;
  const clauses = [];
  const params = {};

  if (employee_id) { clauses.push('employee_id = @employee_id'); params.employee_id = employee_id; }
  if (round_label) { clauses.push('round_label = @round_label'); params.round_label = round_label; }
  if (fn) { clauses.push('function = @function'); params.function = fn; }
  if (date_from) { clauses.push('submitted_at >= @date_from'); params.date_from = date_from; }
  if (date_to) { clauses.push('submitted_at <= @date_to'); params.date_to = date_to; }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM assessments ${where} ORDER BY submitted_at ASC`).all(params);
  res.json(rows.map(serialize));
});

// Deliberate admin reset, not the normal append-only submission flow — wipes
// every captured assessment record. Requires an explicit confirmation on the
// client before this is ever called.
router.delete('/', (req, res) => {
  const { count: before } = db.prepare('SELECT COUNT(*) AS count FROM assessments').get();
  db.exec('DELETE FROM assessments');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'assessments'");
  res.json({ deleted: before });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(row));
});

function serialize(row) {
  return { ...row, answers: JSON.parse(row.answers_json) };
}

export default router;
