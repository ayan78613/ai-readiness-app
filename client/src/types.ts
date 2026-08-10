export interface Option {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  dimension?: string;
  text: string;
  options: Option[];
}

export interface Dimension {
  key: string;
  column: string;
  label: string;
  weight: number;
}

export interface RoleModule {
  moduleKey: string;
  questions: Question[];
}

export interface QuestionsResponse {
  dimensions: Dimension[];
  coreQuestions: Question[];
  roleModules: Record<string, RoleModule>;
  functions: string[];
}

export type Band = 'Not Yet Started' | 'Emerging' | 'Accelerating' | 'Leading';

export interface Assessment {
  id: number;
  employee_id: string;
  function: string;
  round_label: string;
  submitted_at: string;
  answers: Record<string, number | null>;
  usage_score: number | null;
  delegation_score: number | null;
  context_score: number | null;
  discernment_score: number | null;
  compliance_score: number | null;
  training_score: number | null;
  mindset_score: number | null;
  composite_score: number;
  band: Band;
  functional_score: number | null;
}

export type KpiStatus = 'Not started' | 'On track' | 'At risk' | 'Off track' | 'Complete';

export interface KpiRecord {
  id: number;
  kpi_key: string;
  category: string;
  kpi_name: string;
  definition: string;
  data_source: string;
  baseline_value: string;
  target_value: string;
  current_value: string;
  status: KpiStatus;
  owner: string;
  recorded_at: string;
}

export interface KpiWithHistory extends KpiRecord {
  history: KpiRecord[];
}

export interface KpisResponse {
  categories: string[];
  kpis: KpiWithHistory[];
}

export interface MetaResponse {
  anonymous_mode: boolean;
  data_as_of: string | null;
}
