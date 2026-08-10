// Seed data for kpi_records, verbatim from the KPI framework spec (§6).
// NOTE: the spec's prose says "28 KPIs" but its own itemized list under the
// 6 categories enumerates 27 distinct KPIs (I: 4, II: 4, III: 4, IV: 7, V: 4,
// VI: 4 = 27). We seed exactly what's listed rather than inventing a 28th.
export const KPI_SEED = [
  // I. Adoption & Usage
  { kpi_key: 'weekly_active_ai_usage_rate', category: 'Adoption & Usage', kpi_name: 'Weekly Active AI Usage Rate', definition: '% of team using an approved AI tool 3+ times/week', data_source: 'Pulse survey / tool admin logs', target_value: '30% → 75%' },
  { kpi_key: 'ai_use_case_breadth', category: 'Adoption & Usage', kpi_name: 'AI Use-Case Breadth', definition: 'Avg. number of distinct AI use cases adopted per employee', data_source: 'Assessment Q3', target_value: 'Baseline → +3' },
  { kpi_key: 'assessment_participation_rate', category: 'Adoption & Usage', kpi_name: 'Assessment Participation Rate', definition: '% of team completing the baseline readiness assessment', data_source: 'Assessment tracker', target_value: '100% by Month 1' },
  { kpi_key: 'approved_tool_adoption_ratio', category: 'Adoption & Usage', kpi_name: 'Approved-Tool Adoption Ratio', definition: '% of AI usage on approved/vetted tools vs. shadow AI', data_source: 'Tool logs / IT audit', target_value: '95%+' },

  // II. Skill & Competency
  { kpi_key: 'composite_ai_readiness_score', category: 'Skill & Competency', kpi_name: 'Composite AI Readiness Score', definition: 'Org-wide average composite score (0–100)', data_source: 'Assessment (7 core dimensions)', target_value: 'Baseline +20 pts' },
  { kpi_key: 'pct_accelerating_leading_band', category: 'Skill & Competency', kpi_name: '% in Accelerating / Leading Band', definition: 'Share of team scoring 50+', data_source: 'Assessment', target_value: 'Baseline → 70%+' },
  { kpi_key: 'dimension_subscore_trend', category: 'Skill & Competency', kpi_name: 'Dimension Sub-Score Trend', definition: 'Avg. score per dimension, tracked over time', data_source: 'Assessment', target_value: 'All dimensions improving' },
  { kpi_key: 'cross_function_skill_gap', category: 'Skill & Competency', kpi_name: 'Cross-Function Skill Gap', definition: 'Spread between highest- and lowest-scoring function', data_source: 'Assessment by function', target_value: 'Gap narrows 30%+' },

  // III. Training & Enablement
  { kpi_key: 'formal_training_completion_rate', category: 'Training & Enablement', kpi_name: 'Formal Training Completion Rate', definition: '% completed role-specific AI training', data_source: 'LMS / training tracker', target_value: '100% by Month 3' },
  { kpi_key: 'training_hours_per_employee', category: 'Training & Enablement', kpi_name: 'Training Hours Delivered / Employee', definition: 'Avg. hours of structured AI training received', data_source: 'Training tracker', target_value: '5+ hours' },
  { kpi_key: 'role_playbooks_published', category: 'Training & Enablement', kpi_name: 'Role Playbooks Published', definition: '# of role-specific AI usage guides/SOPs published', data_source: 'Internal docs', target_value: '1 per function by Month 2' },
  { kpi_key: 'know_who_to_ask_rate', category: 'Training & Enablement', kpi_name: '"Know Who to Ask" Rate', definition: '% who can name who to contact for AI questions', data_source: 'Assessment Q18', target_value: '100%' },

  // IV. Governance, Risk & Compliance
  { kpi_key: 'approved_tool_list_awareness', category: 'Governance, Risk & Compliance', kpi_name: 'Approved Tool List Awareness', definition: '% correctly identifying approved vs. unapproved tools', data_source: 'Assessment Q14', target_value: '100%' },
  { kpi_key: 'data_handling_policy_awareness', category: 'Governance, Risk & Compliance', kpi_name: 'Data Handling Policy Awareness', definition: '% correctly identifying prohibited data categories for AI input', data_source: 'Assessment Q13', target_value: '100%' },
  { kpi_key: 'ai_vendor_risk_assessments_completed', category: 'Governance, Risk & Compliance', kpi_name: 'AI Vendor Risk Assessments Completed', definition: '# of AI tools/vendors formally reviewed (FINRA Reg. Notice 21-29 criteria)', data_source: 'Compliance/vendor risk log', target_value: '100% of active tools by Month 2' },
  { kpi_key: 'use_case_risk_classification_coverage', category: 'Governance, Risk & Compliance', kpi_name: 'Use-Case Risk Classification Coverage', definition: '% of active AI use cases with a documented risk tier', data_source: 'AI use-case register', target_value: '100% by Month 3' },
  { kpi_key: 'supervisory_review_coverage', category: 'Governance, Risk & Compliance', kpi_name: 'Supervisory Review Coverage', definition: '% of AI-assisted client-facing/supervisory output reviewed per policy', data_source: 'Compliance review log', target_value: '100%' },
  { kpi_key: 'ai_related_compliance_incidents', category: 'Governance, Risk & Compliance', kpi_name: 'AI-Related Compliance Incidents', definition: 'Count of AI-related compliance incidents or near-misses', data_source: 'Incident log', target_value: '0, trending down' },
  { kpi_key: 'audit_readiness_checklist_score', category: 'Governance, Risk & Compliance', kpi_name: 'Audit Readiness Checklist Score', definition: 'Internal self-assessment vs. FINRA AI governance expectations', data_source: 'Internal audit checklist', target_value: 'Pass by Month 6' },

  // V. Productivity & Business Impact
  { kpi_key: 'self_reported_time_saved_per_week', category: 'Productivity & Business Impact', kpi_name: 'Self-Reported Time Saved / Week', definition: 'Avg. hours/week saved via AI assistance', data_source: 'Pulse survey', target_value: '3–5 hrs/employee by Month 6' },
  { kpi_key: 'cycle_time_improvement_by_function', category: 'Productivity & Business Impact', kpi_name: 'Cycle Time Improvement by Function', definition: '% change in key workflow cycle times', data_source: 'Function-owned metrics/ticketing data', target_value: '10–20% improvement' },
  { kpi_key: 'quality_impact_metric_qa', category: 'Productivity & Business Impact', kpi_name: 'Quality Impact Metric (QA)', definition: 'Defect escape rate / production incident rate, tracked with review coverage', data_source: 'QA/defect tracker', target_value: 'Stable or improving' },
  { kpi_key: 'estimated_productivity_gain_roi', category: 'Productivity & Business Impact', kpi_name: 'Estimated Productivity Gain / ROI', definition: 'Directional estimate of value from AI-assisted work', data_source: 'Manager estimate + time-saved data', target_value: 'Benchmark vs. Deloitte Pioneers (>10% ROI)' },

  // VI. Sentiment, Trust & Leadership
  { kpi_key: 'ai_sentiment_score', category: 'Sentiment, Trust & Leadership', kpi_name: 'AI Sentiment Score', definition: '% of team viewing AI as an opportunity rather than a threat', data_source: 'Pulse survey', target_value: '80%+ positive/neutral' },
  { kpi_key: 'manager_ai_usage_rate', category: 'Sentiment, Trust & Leadership', kpi_name: 'Manager AI Usage Rate', definition: '% of managers/leads actively using and modeling AI use', data_source: 'Pulse survey / usage logs', target_value: '90%+' },
  { kpi_key: 'perception_gap_index', category: 'Sentiment, Trust & Leadership', kpi_name: 'Perception Gap Index', definition: 'Gap between leader-estimated and actual employee AI usage', data_source: 'Cross-referenced survey data', target_value: 'Gap narrows toward 0' },
  { kpi_key: 'ai_enablement_satisfaction', category: 'Sentiment, Trust & Leadership', kpi_name: 'AI Enablement Satisfaction', definition: 'Employee satisfaction with AI tools, training, and support provided', data_source: 'Pulse survey', target_value: 'Track and improve each cycle' }
];

export const KPI_CATEGORIES = [
  'Adoption & Usage',
  'Skill & Competency',
  'Training & Enablement',
  'Governance, Risk & Compliance',
  'Productivity & Business Impact',
  'Sentiment, Trust & Leadership'
];
