import { Router } from 'express';
import { db } from '../db.js';

const router = Router();
const TABLES = new Set(['assessments', 'kpi_records']);

function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

router.get('/:table.:format', (req, res) => {
  const { table, format } = req.params;
  if (!TABLES.has(table)) return res.status(400).json({ error: 'Unknown table' });
  if (!['csv', 'json'].includes(format)) return res.status(400).json({ error: 'Unknown format' });

  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id ASC`).all();

  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${table}.json"`);
    return res.json(rows);
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${table}.csv"`);
  res.send(toCsv(rows));
});

export default router;
