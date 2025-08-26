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

  status: string; // e.g. "1"

  base_salary: number;
  salary_nett: number;

  allowances: {
    allowance_type_id: number;
    allowance_value: number;
  }[];

  bank_name: string;
  account_number: string;
  account_name: string;

  attachments: {
    type: string;
    path: string;
  }[];
}
