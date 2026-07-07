/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  is_first_login: boolean;
  first_login_at: string | null;
  deleted_at: string | null;
  fcm_token: string | null;
  profile_id: number | null;
  profile: any | null;
  avatar_url?: string | null;
}

export interface IApprover {
  id: number;
  approver_id: number;
  user_id: number;
  approver_type: string;
  status: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ISelfAssessmentResponse {
  id: number;
  assessment_period: string;
  year: string;
  status: number;
  start_date: string;
  end_date: string;
  reminder: number;
  submitted: number;
  total_employees: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  progress: number;
  creator: IUser;
}

export interface IEmployeeSelfAssessmentResponse {
  id: number;
  form_id: number;
  period: string;
  status: string;
  due_date: string;
  team_member: {
    id: number;
    form_id: number;
    user_name: string;
    job_position_name: string;
    job_level_name: string;
    department_name: string;
    submitted_at: string | null;
    validated_at: string | null;
    photo_profile: string;
    status_label: string;
  }[];
}

export interface IFormAssignment {
  form_id: number;
  users: number[];
}

export interface IMutateSelfAssessmentRequest {
  assessment_period: string;
  year: string;
  start_date: string;
  end_date: string;
  forms: IFormAssignment[];
}

export interface IMutateEmployeeSelfAssessmentRequest {
  status?: string;
  submissions: {
    field_id: number;
    value: string;
    additional_data: any | null;
  }[];
}

export interface IAssessmentInfo {
  id: number;
  assessment_period: string;
  year: string;
  start_date: string;
  end_date: string;
  creator: string;
  form_id: number;
}

export interface IAssessmentSummary {
  completed: number;
  in_progress: number;
  not_started: number;
  total: number;
  progress: number;
}

export interface IEmployeeAssessment {
  id: number;
  name: string;
  position: string;
  submission_status: string;
  score: string;
  supervisor: string;
  form_name: string;
  submitted_at: string;
}

export interface ISelfAssessmentDetailResponse {
  assessment: IAssessmentInfo;
  summary: IAssessmentSummary;
  employees: IEmployeeAssessment[];
}

export interface IEmployeeAssessmentInfo {
  employee_id: number;
  name: string;
  photo_profile: string;
  position: string;
  department: string;
  job_level: string;
  submitted_at: string | null;
  validated_at: string | null;
  status: string;
  supervisor: string;
}

export interface IAssessmentField {
  score: number;
  value: string;
  field_id: number;
  field_group_id: number;
  additional_data: any | null;
}

export interface IAssessmentGroup {
  name: string;
  score: number;
  max_score?: number;
  rating_score?: number;
  rating_max?: number;
  group_weight?: number;
  field_group_id: number;
}

export interface IAssessmentData {
  fields: IAssessmentField[];
  groups: IAssessmentGroup[];
  total_score: number;
  max_total_score?: number;
}

export interface IAssessmentSubmission {
  id: number;
  form_id: number;
  submitted_by: number;
  formable_type: string;
  formable_id: number;
  data: IAssessmentData;
  created_at: string;
  updated_at: string;
  validated_for: number | null;
}

export interface IEmployeeSelfAssessmentResponse {
  assessment_info: IEmployeeAssessmentInfo;
  self_assessment: IAssessmentSubmission;
  self_assessment_validation: IAssessmentSubmission;
}
