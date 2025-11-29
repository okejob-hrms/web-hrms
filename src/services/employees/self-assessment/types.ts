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
  user_id: number;
  assessment_period: string;
  year: string;
  start_date: string;
  end_date: string;
  status: number;
  created_at: string;
  updated_at: string;
  approvers: IApprover[];
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

export interface IAssessmentInfo {
  id: number;
  assessment_period: string;
  year: string;
  start_date: string;
  end_date: string;
  creator: string;
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
  position: string;
  department: string;
  job_level: string;
  submitted_at: string | null;
  validated_at: string | null;
  status: string;
  supervisor: string;
}

export interface IEmployeeSelfAssessmentResponse {
  assessment_info: IEmployeeAssessmentInfo;
  score: any[];
  self_assessment: any[];
  self_assessment_validation: any[];
}
