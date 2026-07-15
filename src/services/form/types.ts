/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFormTemplate {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
  type: number;
  deleted_at: string | null;
  type_label: string;
  groups: IFormGroup[];
}

export interface IFormGroup {
  id: string;
  name: string;
  order?: number;
  metadata: {
    score_weight: number;
    score_weight_type: string;
  };
  fields: {
    id: number;
    form_id: number;
    label: string;
    type: string;
    options: any[];
    is_required: boolean;
    order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    description: string | null;
    metadata: Record<string, any> | null;
    competency_levels?:
      | {
          id: number;
          dimensions: string;
          level: string;
          name: string;
          description: string;
        }[]
      | null;
  }[];
}

export interface IFormTemplateParams {
  form_id?: number;
  group_id?: number;
  label?: string;
  type?: string;
  options?: string[];
  is_required?: boolean;
  order?: number;
}

export interface IFormListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: number;
  sort_by?: "created_at" | "name" | "updated_at";
  sort_dir?: "asc" | "desc";
}

export interface FormFieldData {
  id: number;
  type: 'checkbox' | 'range' | 'textarea' | 'text' | 'select' | 'radio';
  label: string;
  order: number;
  is_required: boolean;
  options?: any;
  metadata?: any;
}

export interface IFormField {
  label: string;
  type?: "text" | "textarea" | "checkbox" | "range" | string;
  is_required: boolean;
  order: number;
  options?:
    | string[]
    | {
        min: number;
        max: number;
      };
  metadata?: {
    is_note?: boolean;
    competency_id?: number;
    dimension?: string;
    level_id?: number;
    level_value?: number;
    score_weight?: number;
    score_weight_type?: string;
    type?: string;
  };
}

export interface IMutateFieldRequest {
  form_id: number;
  groups: {
    id?: string;
    name?: string;
    metadata?: {
      score_weight: number;
      score_weight_type: string;
    };
    fields?: IFormField[];
  }[];
}

export interface IMutateFormRequest {
  name: string;
  type: number; // 1: Exit Interview, 2: Self Assessment, 3: Supervisor Assesment
  description?: string;
}

export interface ISubmissionForm {
  field_id: number;
  value: any;
  additional_data?: any;
}

export interface IExitFormRequest {
  submissions: ISubmissionForm[];
}

export interface IRecipientRequest {
  user_id: number;
  status: number;
}

export interface IHandoverItemRequest {
  id: number | null | undefined
  category: "work" | "document" | "equipment" | "facility";
  name: string;
  recipients: IRecipientRequest[];
}

export interface IHandoverRequest {
  data: IHandoverItemRequest[];
}
export interface IFieldResponse {
  id: number;
  form_id: number;
  label: string;
  type: string;
  options: any;
  is_required: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  field_group_id: number;
  competency_levels?:
    | {
        id: number;
        dimensions: string;
        level: string;
        name: string;
        description: string;
      }[]
    | null;
}
