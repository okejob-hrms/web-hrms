import { IContactOfReference, IWorkExperience } from "@/lib/types";
import { IEducationResponse } from "./educations/types";
import { IFamilyResponse } from "./families/types";

export interface IEmployeeResponse {
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

export interface ICreateEmployeeResponse {
  user_id: number;
  phone_number: number;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  marital_status: number;
  blood_type: string;
  height: string;
  weight: string;
  id_number: string;
  npwp: string;
  bpjs: string;
  citizen_id_address: string;
  residential_address: string;
  hobby: string;
  achievement: string;
  personal_description: string;
  updated_at: string;
  created_at: string;
  id: number;
  marital_status_label: string;
}

export interface ICreateEmployeeRequest {
  name: string;
  email: string;
  role_id: number;
  phone_number: number;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  marital_status: string;
  blood_type: string;
  height: number;
  weight: number;
  id_number: string;
  npwp: string;
  bpjs: string;
  citizen_id_address: string;
  residential_address: string;
  hobby: string;
  achievement: string;
  personal_description: string;
  photo_profile: string;

  social_media_accounts: {
    type: string;
    url: string;
  }[];

  job_position_id: number;
  job_level_id: number;
  department_id: number;

  direct_reports: {
    direct_report_id: number;
    relationship_type: string;
  }[];

  team_members: {
    team_id: number;
  }[];

  start_date: string;
  end_date: string | null;

  status: string;

  base_salary: number;
  salary_nett: number;

  allowances: {
    allowance_type_id: number;
    allowance_value: number;
  }[];

  bank_id: number;
  account_number: string;
  account_name: string;

  attachments: {
    type: string;
    path: string;
  }[];
}

export interface IEmployeeDetailsResponse {
  id: number;
  user_id: number;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  marital_status: number;
  blood_type: string;
  height: string;
  weight: string;
  id_number: string;
  npwp: string;
  bpjs: string;
  citizen_id_address: string;
  residential_address: string;
  hobby: string;
  achievement: string;
  personal_description: string;
  photo_profile: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  code: string;
  marital_status_label: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    tenant_id: number;
    created_at: string;
    updated_at: string;
    is_first_login: boolean;
    first_login_at: string | null;
  };
  employment: {
    id: number;
    employee_profile_id: number;
    department_id: number;
    job_level_id: number;
    job_position_id: number;
    start_date: string;
    end_date: string;
    base_salary: string;
    salary_nett: string;
    status: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    department: {
      id: number;
      name: string;
      description: string;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
    };
    job_level: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    job_position: {
      id: number;
      name: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
  };
  social_media_accounts: {
    id: number;
    employee_profile_id: number;
    type: string;
    url: string;
    created_at: string;
    updated_at: string;
  }[];
  bank_account: {
    id: number;
    employee_profile_id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  team_members: {
    id: number;
    employee_profile_id: number;
    team_id: number;
    role_in_team: string | null;
    joined_at: string;
    left_at: string | null;
    created_at: string;
    updated_at: string;
  }[];
  reporting_relationships: {
    id: number;
    employee_profile_id: number;
    direct_report_id: number;
    relationship_type: string;
    start_date: string;
    end_date: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  }[];
  work_experiences: IWorkExperience[];
  educations: IEducationResponse[];
  families: IFamilyResponse[];
  contact_refferences: IContactOfReference[];
  employee_documents: {
    id: number;
    employee_profile_id: number;
    type: string;
    filename: string;
    mime_type: string;
    size: number;
    path: string;
    disk: string;
    uploaded_by: number;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
  }[];
}
