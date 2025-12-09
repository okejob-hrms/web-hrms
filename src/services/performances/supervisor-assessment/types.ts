import z from "zod";

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employee_id: number;
  employee_code: string;
  avatar_url: string | null;
}

export interface IPosition {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_root: boolean;
}

export interface ILevel {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  level: number;
}

export interface IDepartment {
  id: number;
  name: string;
}

export interface ISchedule {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  participants: IUser[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IAssessor {
  id: number;
  supervisor_assessment_id: number;
  user_id: number;
  score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  status: number;
  status_label: string;
}

export interface IForm {
  id: number;
  name: string;
}

export interface IFinalSubmission {
  id: number;
  form_id: number;
  submitted_by: number;
  formable_type: string;
  formable_id: number;
  data: {
    type: "merging_answers" | string;
    fields: Array<{
      value: number | string | boolean | null;
      field_id: number;
      additional_data: unknown | null;
      form_submission_id: number;
      score: number;
      score_label: string | null;
      field_group_id: number;
      subtotal_score: number;
      subtotal_score_label: string | null;
      performance_competency_level: number;
    }>;
    sources: Array<{
      form_submission_id: number;
    }>;
    final_score: ISupervisorAssessmentFinalScore | null;
    merged_at: string; // ISO datetime
    merged_by: string; // e.g. "system"
  };
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  validated_for: unknown | null;
}

export interface FinalScoreMetadata {
  score_weight: number;
  score_weight_type: string; // e.g. "percent"
}

export interface FinalScoreGroup {
  name: string;
  score: number;
  metadata: FinalScoreMetadata;
  score_label: string;
  field_group_id: number;
}

export interface ISupervisorAssessmentFinalScore {
  groups: FinalScoreGroup[];
  work_value: number;
  total_score: number;
  score_threshold: {
    id: number;
    min_value: number;
    max_value: number;
    score: string;
  } | null;
  work_value_label: string;
  total_score_label: string;
}

export interface ISupervisorAssessmentResponse {
  id: number;
  user: IUser;
  employee_start_date: string;
  current_position: IPosition;
  current_level: ILevel;
  current_department: IDepartment;
  target_position: IPosition;
  target_level: ILevel;
  status: number;
  status_label: string;
  schedule: ISchedule | null;
  assessors: IAssessor[];
  form: IForm;
  final_submission: IFinalSubmission | null;
  // final_score: ISupervisorAssessmentFinalScore | null;
  created_at: string;
  updated_at: string;
}
export interface ISupervisorAssessmentParam {
  per_page: string;
  page: string;
}

export interface ISupervisorAssessmentMutation {
  user_id: number;
  form_id: number;
  target_position_id: number;
  target_level_id: number;
  assessors: number[];
}

export const ScheduleRequestSchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  participants: z
    .array(z.number())
    .min(1, "At least one participant is required"),
  notes: z.string(),
});

export type IScheduleRequest = z.infer<typeof ScheduleRequestSchema>;

export interface IScheduleResponse {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  participants: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    employee_id: number;
    employee_code: string;
    avatar_url: string | null;
  }[];
  updated_at: string;
  created_at: string;
  notes: string | null;
  status: number;
}
