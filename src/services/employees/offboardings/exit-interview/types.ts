/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFormSubmissionRequest {
  submissions: IFormSubmissionField[];
}

export interface IFormSubmissionField {
  field_id: number;
  value: string | number | boolean | null;
  additional_data: any;
}

export interface IGetAnswerSubmissionOffboardingRequest {
  form_id: number;
  submitted_by: number;
}
