// Single source of truth for the assessment question bank, dimension weights,
// and role modules. Scoring logic (scoring.js) and the client form both derive
// from this file (client fetches it via GET /api/questions).

const AGREE_SCALE = [
  { label: 'Strongly disagree', score: 0 },
  { label: 'Disagree', score: 25 },
  { label: 'Neutral', score: 50 },
  { label: 'Agree', score: 75 },
  { label: 'Strongly agree', score: 100 }
];

export const DIMENSIONS = [
  { key: 'usage', column: 'usage_score', label: 'Usage & Frequency', weight: 0.10 },
  { key: 'delegation', column: 'delegation_score', label: 'Delegation & Task Judgment', weight: 0.15 },
  { key: 'context', column: 'context_score', label: 'Context-Setting', weight: 0.15 },
  { key: 'discernment', column: 'discernment_score', label: 'Discernment & Verification', weight: 0.20 },
  { key: 'compliance', column: 'compliance_score', label: 'Data Handling & Regulatory Awareness', weight: 0.20 },
  { key: 'training', column: 'training_score', label: 'Training & Enablement', weight: 0.10 },
  { key: 'mindset', column: 'mindset_score', label: 'Mindset & Change Readiness', weight: 0.10 }
];

export const FUNCTIONS = [
  'Data Engineering',
  'Data Architecture',
  'QA Engineering',
  'PMO',
  'Product Owner',
  'Support',
  'Data Governance',
  'BI Developers'
];

// Core 20 questions, grouped by dimension.
export const CORE_QUESTIONS = [
  { id: 'q1', dimension: 'usage', text: 'How often do you currently use AI tools (e.g. Claude, ChatGPT, Copilot, or internal tools) as part of your work at Kestra?', options: [
    { label: 'Never', score: 0 },
    { label: 'Rarely — a few times a month', score: 25 },
    { label: 'Sometimes — a few times a week', score: 50 },
    { label: 'Often — daily', score: 75 },
    { label: "Constantly — it's core to how I work", score: 100 }
  ]},
  { id: 'q2', dimension: 'usage', text: 'Approximately what percentage of your weekly tasks currently involve some form of AI assistance?', options: [
    { label: 'None', score: 0 },
    { label: '~10%', score: 25 },
    { label: '~25%', score: 50 },
    { label: '~50%', score: 75 },
    { label: '75%+', score: 100 }
  ]},
  { id: 'q3', dimension: 'usage', text: 'How many distinct AI use cases have you tried in your role?', options: [
    { label: 'None', score: 0 },
    { label: '1', score: 25 },
    { label: '2–3', score: 50 },
    { label: '4–5', score: 75 },
    { label: '6+', score: 100 }
  ]},
  { id: 'q4', dimension: 'delegation', text: 'I can clearly identify which parts of my workflow are appropriate to delegate to AI versus which must remain fully human-reviewed, given our regulatory environment.', options: AGREE_SCALE },
  { id: 'q5', dimension: 'delegation', text: 'I select the right tool or model for a given task rather than defaulting to a single tool for everything.', options: AGREE_SCALE },
  { id: 'q6', dimension: 'delegation', text: 'I understand the limits of AI in my specific function well enough to know when NOT to use it.', options: AGREE_SCALE },
  { id: 'q7', dimension: 'context', text: 'When I use AI, I provide sufficient context — background, constraints, audience, desired format — rather than a bare instruction.', options: AGREE_SCALE },
  { id: 'q8', dimension: 'context', text: "I iterate and refine my prompts or requests when the first AI output isn't right, rather than abandoning the tool.", options: AGREE_SCALE },
  { id: 'q9', dimension: 'context', text: 'I have used AI for multi-step or complex tasks relevant to my role, not just single quick queries.', options: AGREE_SCALE },
  { id: 'q10', dimension: 'discernment', text: 'I routinely verify AI-generated outputs (numbers, code, text, analysis) against source data or my own expertise before using them.', options: AGREE_SCALE },
  { id: 'q11', dimension: 'discernment', text: 'I have personally caught an instance where AI produced inaccurate or misleading output.', options: AGREE_SCALE },
  { id: 'q12', dimension: 'discernment', text: 'I review the reasoning behind an AI output, not just accept the final answer at face value.', options: AGREE_SCALE },
  { id: 'q13', dimension: 'compliance', text: 'I know which categories of client or firm data (e.g. PII, account numbers, non-public personal information) are NOT permitted to be entered into AI tools.', options: AGREE_SCALE },
  { id: 'q14', dimension: 'compliance', text: 'I am aware of which AI tools are formally approved and vetted by Kestra for business use, versus tools I should not use with work data.', options: AGREE_SCALE },
  { id: 'q15', dimension: 'compliance', text: 'If I used AI to help produce a client-facing communication, report, or supervisory document, I would know what disclosure or review steps are required before it goes out.', options: AGREE_SCALE },
  { id: 'q16', dimension: 'compliance', text: 'I understand that AI-assisted work I produce is still subject to the same supervisory, recordkeeping, and audit requirements as work done without AI.', options: AGREE_SCALE },
  { id: 'q17', dimension: 'training', text: 'How much formal training or guidance have you received on using AI at work?', options: [
    { label: 'None', score: 0 },
    { label: 'A little — self-taught only', score: 25 },
    { label: 'Some — a session or two', score: 50 },
    { label: 'Solid — structured training', score: 75 },
    { label: 'Extensive — ongoing training & support', score: 100 }
  ]},
  { id: 'q18', dimension: 'training', text: 'I know who to contact at Kestra with questions about appropriate AI use, tooling, or compliance concerns.', options: AGREE_SCALE },
  { id: 'q19', dimension: 'mindset', text: 'I see AI as a tool to help me focus on higher-value parts of my job, not as a threat to my role.', options: AGREE_SCALE },
  { id: 'q20', dimension: 'mindset', text: 'I am comfortable experimenting with new AI capabilities as they become available, rather than waiting to be told exactly what to do.', options: AGREE_SCALE }
];

// Role modules: function -> [2 questions]. Keyed by function name.
export const ROLE_MODULES = {
  'Data Engineering': { moduleKey: 'A', questions: [
    { id: 'q21', text: 'I have used, or would be comfortable using, AI to assist with data pipeline development, ETL/ELT scripting, documentation, or data quality checks.', options: AGREE_SCALE },
    { id: 'q22', text: 'When evaluating or designing data architecture, I consider AI-readiness of data (structure, lineage, metadata, access controls) as part of the design.', options: AGREE_SCALE }
  ]},
  'Data Architecture': { moduleKey: 'A', questions: [
    { id: 'q21', text: 'I have used, or would be comfortable using, AI to assist with data pipeline development, ETL/ELT scripting, documentation, or data quality checks.', options: AGREE_SCALE },
    { id: 'q22', text: 'When evaluating or designing data architecture, I consider AI-readiness of data (structure, lineage, metadata, access controls) as part of the design.', options: AGREE_SCALE }
  ]},
  'QA Engineering': { moduleKey: 'B', questions: [
    { id: 'q23', text: 'I have used, or would be comfortable using, AI to help generate test cases, test scripts, or synthetic test data.', options: AGREE_SCALE },
    { id: 'q24', text: 'I trust AI-assisted testing enough to rely on it for regression coverage, provided there is human review of critical or high-risk test paths.', options: AGREE_SCALE }
  ]},
  'PMO': { moduleKey: 'C', questions: [
    { id: 'q25', text: 'I have used, or would be comfortable using, AI to help draft status reports, RAID logs, user stories, requirements, or sprint/release documentation.', options: AGREE_SCALE },
    { id: 'q26', text: 'I use AI to support estimation, risk identification, or prioritization, while retaining final judgment myself.', options: AGREE_SCALE }
  ]},
  'Product Owner': { moduleKey: 'C', questions: [
    { id: 'q25', text: 'I have used, or would be comfortable using, AI to help draft status reports, RAID logs, user stories, requirements, or sprint/release documentation.', options: AGREE_SCALE },
    { id: 'q26', text: 'I use AI to support estimation, risk identification, or prioritization, while retaining final judgment myself.', options: AGREE_SCALE }
  ]},
  'Support': { moduleKey: 'D', questions: [
    { id: 'q27', text: 'I have used, or would be comfortable using, AI to help triage, summarize, or draft responses to support tickets or client inquiries.', options: AGREE_SCALE },
    { id: 'q28', text: 'I know the boundaries of what AI-drafted, client-facing support responses need human review before being sent — especially anything touching account or transaction details.', options: AGREE_SCALE }
  ]},
  'Data Governance': { moduleKey: 'E', questions: [
    { id: 'q29', text: 'I have used, or would be comfortable using, AI to assist with data cataloging, metadata management, or classifying data sensitivity (e.g., PII, NPI) across our systems.', options: AGREE_SCALE },
    { id: 'q30', text: 'I factor AI-specific governance requirements — such as model documentation, data lineage for AI training/inputs, and audit trails for AI-assisted decisions — into the data governance policies I help define or enforce.', options: AGREE_SCALE }
  ]},
  'BI Developers': { moduleKey: 'F', questions: [
    { id: 'q31', text: 'I have used, or would be comfortable using, AI to assist with writing queries, building dashboards, or explaining trends in existing reports.', options: AGREE_SCALE },
    { id: 'q32', text: 'I validate AI-generated insights or visualizations against the underlying data before presenting them to stakeholders, rather than trusting the output at face value.', options: AGREE_SCALE }
  ]}
};

export function questionsForFunction(fn) {
  const mod = ROLE_MODULES[fn];
  if (!mod) return [...CORE_QUESTIONS];
  return [...CORE_QUESTIONS, ...mod.questions];
}

export function allQuestionIds(fn) {
  return questionsForFunction(fn).map(q => q.id);
}
