export interface OffboardingData {
  id: number;
  user_id: number;
  status: number;
  effective_resignation_date: string;
  last_working_date: string;
  form_id: number;
  created_at: string;
  updated_at: string;
  status_label: string;
}

export interface OffboardingProgressStep {
  id: number;
  type: string;
  label: string;
  description: string;
  is_completed: boolean;
}