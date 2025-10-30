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
  }[];
}

export interface IFormTemplateParams {
  form_id?: number;
  label: string;
  type: string;
  options: string[];
  is_required: boolean;
  order: number;
}

export interface IFormField {
  label: string;
  type: "text" | "textarea" | "checkbox" | "range" | string;
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
  };
}

export interface IMutateFieldRequest {
  form_id: number;
  fields: IFormField[];
}

export interface IMutateFormRequest {
  name: string;
  type: number; // 1: Exit Interview, 2: Self Assessment, 3: Supervisor Assesment
  description: string;
}
