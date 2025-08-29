export interface IRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: IPermissionModule[]
}

export interface IRolesResponse {
  current_page: number;
  current_page_url: string;
  data: IRole[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}

export interface IRoleDetailResponse {
  status: string;
  message: string;
  data: IRole;
}

export interface IPermissionAction {
  id: number;
  name: string;
  granted: boolean;
}

export type IPermissionActionKey =
  | "view"
  | "create"
  | "edit"
  | "assign"
  | "deactivate"
  | "delete"
  | "export"

export type IPermissionActions = Record<IPermissionActionKey, IPermissionAction>

export interface IPermissionRow {
  key: string
  actions: IPermissionActions
}

export interface IPermissionModule {
  module: string
  columns: IPermissionActionKey[]
  rows: IPermissionRow[]
}

export interface IPermissionResponse {
  data: IPermissionModule[]
}

export interface IEmployee {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  department: string;
  department_id: number;
  job_level: string;
  job_level_id: number;
  job_position: string;
  job_position_id: number;
  status: number;
  start_date: string;
  end_date: string | null;
  photo_profile: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IEmployeePagination {
  current_page: number;
  current_page_url: string;
  data: IEmployee[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}

export interface IEmployeeModule {
  status: string;
  message: string;
  data: IEmployeePagination;
}

export interface ICreateRolePayload {
  name: string;
  guard_name: string;
  permissions: number[];
  users: number[];
}

export interface ICreateRoleResponse {
  status: string;
  message: string;
  data: {
    id: number;
    guard_name: string;
    name: string;
  };
}