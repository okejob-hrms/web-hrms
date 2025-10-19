import { IEducationResponse } from "./educations/types";
import { IFamilyResponse } from "./families/types";
import { IResponseWorkExperience } from "./work-experiences/types";
import { IContactReferenceResponse } from "./contact-references/types";
import { IDocument } from "@/lib/types";

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
  photo_profile_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch: IBranchData;
}

export interface IBranchData {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  address: string; 
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

export interface IMutateEmployeeRequests {
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
  npwp?: string | null;
  bpjs?: string | null;
  citizen_id_address: string;
  residential_address: string;
  hobby: string;
  achievement: string;
  personal_description: string;
  photo_profile?: string | null;
  social_media_accounts?: {
    type: string;
    url: string;
  }[];
  job_position_id: number;
  job_level_id: number;
  department_id: number;
  primary_direct_report_id?: number | null;
  additional_direct_report_id?: number | null;
  team_members: {
    team_id: number;
  }[];
  start_date: string;
  end_date?: string;
  status: string;
  base_salary: number | null;
  salary_nett: number;
  allowances?: {
    allowance_type_id: number;
    allowance_value: number;
  }[];
  bank_id: number;
  account_number: string;
  account_name: string;

  attachments: {
    type?: string;
    path?: string;
  }[];
  work_experiences?: {
    id: number;
  }[];
  educations?: {
    id: number;
  }[];
  families?: {
    id: number;
  }[];
  contact_refferences?: {
    id: number;
  }[];
  // employee_documents?: {
  //   id: number;
  // }[];
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
    allowances: {
      id: number;
      employment_id: number;
      allowance_type_id: number;
      allowance_value: string;
      deleted_at: string | null;
      created_at: string;
      updated_at: string | null;
    }[];
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
    bank_id: number;
    account_number: string;
    account_name: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    bank: {
      id: number;
      bank_name: string;
      code: string;
      created_at: string;
      updated_at: string;
    };
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
  work_experiences: IResponseWorkExperience[];
  educations: IEducationResponse[];
  families: IFamilyResponse[];
  contact_refferences: IContactReferenceResponse[];
  employee_documents: IDocument[];
}

export interface IEmployeeOrganizationStructure {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  photo_profile: string;
  department_id: string;
  department: string;
  job_position_id: number;
  job_position: string;
  job_level_id: number;
  job_level: string;
  user_id: number;
  status: number;
  start_date: string;
  end_date: string | null;
  photo_profile_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  primary_direct_report: {
    id: number;
    name: string;
  }[];
  secondary_direct_report: {
    id: number;
    name: string;
  }[];
  team_members: {
    id: number;
    name: string;
    description: string;
    deleted_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  }[];
  relationship_type: string | null;
  children: IEmployeeOrganizationStructure[];
}

export interface DirectReport {
  id: number;
  name: string;
}

export interface IGroupedEmployee {
  id: number;
  employee_id: number;
  code: string;
  photo_profile: string;
  photo_profile_url: string | null;
  name: string;
  email: string;
  roles: string[];
  department: string;
  job_level: string;
  job_position: string;
  created_at: string;
  updated_at: string;
}

export interface IJobLevelGroup {
  job_level_id: number;
  job_level_name: string;
  description: string;
  employees: IGroupedEmployee[];
  employees_count: number;
}

export interface IAssignManagerResponse {
  id: number;
  employee_profile_id: number;
  direct_report_id: number;
  relationship_type: string;
  start_date: string | null;
  end_date: string | null;
  created_date: string | null;
  updated_date: string | null;
}
