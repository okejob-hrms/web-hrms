import { IEmployeeResponse } from "../../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IWorkAndHandoverResponse {
  id: number;
  offboarding_id: number;
  category: string;
  name: string;
  notes: string;
  status: number;
  expected_return_date: string | null;
  received_at: string | null;
  meta: {
    project_name: string;
    priority: string;
    deadline: string;
    client_count: number;
    active_projects: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  recipients: IEmployeeResponse[];
}
