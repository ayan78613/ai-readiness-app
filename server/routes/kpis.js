import { Router } from 'express';
import { db } from '../db.js';
import { KPI_CATEGORIES } from '../kpiSeed.js';

const router = Router();
const VALID_STATUSES = ['Not started', 'On track', 'At risk', 'Off track', 'Complete'];

// GET /api/kpis -> every KPI's latest state + full history (for sparklines)
router.get('/', (req, res) => {
  const keys = db.prepare('SELECT DISTINCT kpi_key FROM kpi_records').all().map(r => r.kpi_key);

  const historyStmt = db.prepare('SELECT * FROM kpi_records WHERE kpi_key = ? ORDER BY recorded_at ASC');

  const kpis = keys.map(key => {
    const history = historyStmt.all(key);
    const latest = history[history.length - 1];
    return {
      kpi_key: key,
      category: latest.category,
      kpi_name: latest.kpi_name,
      definition: latest.definition,
      data_source: latest.data_source,
      baseline_value: latest.baseline_value,
      target_value: latest.target_value,
      current_value: latest.current_value,
      status: latest.status,
      owner: latest.owner,
      recorded_at: latest.recorded_at,
      history
    };
  });

  // stable order: category order from spec, then original seed order within category
  const catOrder = new Map(KPI_CATEGORIES.map((c, i) => [c, i]));
  kpis.sort((a, b) => (catOrder.get(a.category) ?? 99) - (catOrder.get(b.category) ?? 99) || a.kpi_key.localeCompare(b.kpi_key));

  res.json({ categories: KPI_CATEGORIES, kpis });
});

// POST /api/kpis/:kpi_key -> insert a new kpi_records row (append-only update)
router.post('/:kpi_key', (req, res) => {
  const { kpi_key } = req.params;
  const latest = db.prepare('SELECT * FROM kpi_records WHERE kpi_key = ? ORDER BY recorded_at DESC LIMIT 1').get(kpi_key);
  if (!latest) return res.status(404).json({ error: 'Unknown kpi_key' });

  const { current_value, status, owner, baseline_value } = req.body;
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const recorded_at = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO kpi_records
      (kpi_key, category, kpi_name, definition, data_source, baseline_value, target_value, current_value, status, owner, recorded_at)
    VALUES
      (@kpi_key, @category, @kpi_name, @definition, @data_source, @baseline_value, @target_value, @current_value, @status, @owner, @recorded_at)
  `);

  const info = stmt.run({
    kpi_key: latest.kpi_key,
    category: latest.category,
    kpi_name: latest.kpi_name,
    definition: latest.definition,
    data_source: latest.data_source,
    baseline_value: baseline_value !== undefined ? String(baseline_value) : latest.baseline_value,
    target_value: latest.target_value,
    current_value: current_value !== undefined ? String(current_value) : latest.current_value,
    status: status !== undefined ? status : latest.status,
    owner: owner !== undefined ? String(owner) : latest.owner,
    recorded_at
  });

  const row = db.prepare('SELECT * FROM kpi_records WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

export default router;
