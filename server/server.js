import express from 'express';
import cors from 'cors';
import './db.js';
import { CONFIG } from './config.js';
import questionsRouter from './routes/questions.js';
import assessmentsRouter from './routes/assessments.js';
import kpisRouter from './routes/kpis.js';
import metaRouter from './routes/meta.js';
import exportRouter from './routes/export.js';

const app = express();

app.use(cors({ origin: CONFIG.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/kpis', kpisRouter);
app.use('/api/meta', metaRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(CONFIG.PORT, () => {
  console.log(`Kestra AI Readiness API listening on http://localhost:${CONFIG.PORT}`);
});
