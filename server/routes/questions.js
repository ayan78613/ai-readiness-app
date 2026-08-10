import { Router } from 'express';
import { DIMENSIONS, CORE_QUESTIONS, ROLE_MODULES, FUNCTIONS } from '../questionBank.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    dimensions: DIMENSIONS,
    coreQuestions: CORE_QUESTIONS,
    roleModules: ROLE_MODULES,
    functions: FUNCTIONS
  });
});

export default router;
