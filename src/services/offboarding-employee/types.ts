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

export interface HandoverRecipient {
  id: number;
  handover_item_id: number;
  user_id: number;
  status: number;
  updated_by: number | null;
  received_at: string | null; // ISO Date string
  remarks: string | null;
  created_at: string;
  updated_at: string;
  status_label: string;
  user: UserRecipient;
}

export interface UserRecipient {
  id: number;
  name: string;
  email: string;
}

export interface HandoverItem {
  id: number;
  offboarding_id: number;
  category: string;
  name: string;
  notes: string | null;
  status: number;
  expected_return_date: string | null;
  received_at: string | null;
  meta: any | null; // Or a more specific object if meta has a known structure
  created_at: string;
  updated_at: string;
  status_label: string;
  recipients: HandoverRecipient[];
}