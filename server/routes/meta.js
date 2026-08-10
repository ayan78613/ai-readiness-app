import { Router } from 'express';
import { db } from '../db.js';
import { CONFIG } from '../config.js';

const router = Router();

router.get('/', (req, res) => {
  const latestAssessment = db.prepare('SELECT MAX(submitted_at) AS t FROM assessments').get().t;
  const latestKpi = db.prepare('SELECT MAX(recorded_at) AS t FROM kpi_records').get().t;
  const candidates = [latestAssessment, latestKpi].filter(Boolean);
  const data_as_of = candidates.length ? candidates.sort().at(-1) : null;

  res.json({
    anonymous_mode: CONFIG.ANONYMOUS_MODE,
    data_as_of
  });
});

export default router;
