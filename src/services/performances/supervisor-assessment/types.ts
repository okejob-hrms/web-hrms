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
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ISupervisorAssessmentResponse {
  id: number;
  user: IUser;
  current_position: IPosition;
  current_level: ILevel;
  target_position: IPosition;
  target_level: ILevel;
  status: number;
  status_label: string;
  schedule: string | null;
  created_at: string;
  updated_at: string;
}
export interface ISupervisorAssessmentParam {
  status: string;
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
