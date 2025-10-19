export interface IFormTemplate {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface IFormTemplateParams {
  form_id?: number;
  label: string;
  type: string;
  options: string[];
  is_required: boolean;
  order: number;
}
