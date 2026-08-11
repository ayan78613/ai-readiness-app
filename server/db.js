import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KPI_SEED } from './kpiSeed.js';

// Node's built-in SQLite module (stable/RC on modern Node, ships inside Node
// itself) instead of better-sqlite3 — a native addon whose prebuilt binaries
// lag behind new Node majors and whose from-source build breaks whenever V8's
// API shifts. This has the same synchronous .prepare().run/get/all() surface,
// so no route code needed to change.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'ai_readiness.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    function TEXT NOT NULL,
    round_label TEXT NOT NULL DEFAULT 'Baseline',
    submitted_at TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    usage_score REAL,
    delegation_score REAL,
    context_score REAL,
    discernment_score REAL,
    compliance_score REAL,
    training_score REAL,
    mindset_score REAL,
    composite_score REAL NOT NULL,
    band TEXT NOT NULL,
    functional_score REAL
  );

  CREATE TABLE IF NOT EXISTS kpi_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kpi_key TEXT NOT NULL,
    category TEXT NOT NULL,
    kpi_name TEXT NOT NULL,
    definition TEXT,
    data_source TEXT,
    baseline_value TEXT,
    target_value TEXT,
    current_value TEXT,
    status TEXT NOT NULL DEFAULT 'Not started',
    owner TEXT,
    recorded_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_assessments_employee ON assessments(employee_id);
  CREATE INDEX IF NOT EXISTS idx_kpi_records_key ON kpi_records(kpi_key);
`);

const kpiCount = db.prepare('SELECT COUNT(*) AS n FROM kpi_records').get().n;
if (kpiCount === 0) {
  const insert = db.prepare(`
    INSERT INTO kpi_records
      (kpi_key, category, kpi_name, definition, data_source, baseline_value, target_value, current_value, status, owner, recorded_at)
    VALUES
      (@kpi_key, @category, @kpi_name, @definition, @data_source, '', @target_value, '', 'Not started', '', @recorded_at)
  `);
  const now = new Date().toISOString();
  db.exec('BEGIN');
  try {
    for (const row of KPI_SEED) insert.run({ ...row, recorded_at: now });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  console.log(`Seeded ${KPI_SEED.length} KPI rows into kpi_records.`);
}
