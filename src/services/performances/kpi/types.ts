/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IKPI {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  frequency: number;
  format: number;
  job_position_ids: number[];
  job_level_ids: number[];
  target: number;
  direction: number;
  aggregation: number;
  created_at: string;
  updated_at: string;
}

export interface IKPIParam {
  page?: string;
  per_page?: string;
  search?: string;
}

export interface IMutateKPIRequest {
  aggregation: number;
  description: string;
  direction: number;
  format: number;
  frequency: number;
  job_level_ids: number[];
  job_position_ids: number[];
  name: string;
  target: number;
}

export interface IKPIDetails {
  aggregation: number;
  created_at: string;
  description: null;
  direction: number;
  format: number;
  frequency: number;
  id: number;
  job_levels: JobLevel[];
  job_level_ids: number[] | null;
  job_positions: JobPosition[];
  job_position_ids: number[] | null;
  name: string;
  target: number;
  tenant_id: number;
  updated_at: string;
}

export interface JobLevel {
  created_at: string;
  deleted_at: null;
  description: string;
  id: number;
  name: string;
  updated_at: string;
  [property: string]: any;
}

export interface JobPosition {
  created_at: string;
  deleted_at: null;
  description: string;
  id: number;
  is_root: boolean;
  name: string;
  status: string;
  updated_at: string;
  [property: string]: any;
}
