import { z } from "zod";

export const MutateOffboardingRequestsSchema = z.object({
  user_id: z.number(),
  effective_resignation_date: z
    .string()
    .min(1, "effective_resignation_date is required"),
  last_working_date: z.string().min(1, "last_working_date is required"),
  form_id: z.number(),
  approvers: z.array(z.number()).nonempty("At least one approver is required"),
});

export type IMutateOffboardingRequests = z.infer<
  typeof MutateOffboardingRequestsSchema
>;

export interface IOffboardingResponse {
  id: number;
  user_id: number;
  user_name: string;
  job_position_id: number | null;
  job_position: string | null;
  department_id: number | null;
  department: string | null;
  join_date: string;
  status_offboarding: "In Progress" | "Completed" | "Pending" | string;
}

export interface IOffboardingDetailResponse {
  id: number;
  user_id: number;
  status: number;
  effective_resignation_date: string;
  last_working_date: string;
  form_id: number;
  created_at: string;
  updated_at: string;
  status_label: string;
  user: {
    id: number;
    code: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    tenant_id: number;
    created_at: string;
    updated_at: string;
    is_first_login: boolean;
    first_login_at: string;
    deleted_at: string | null;
  };
  approvers: {
    id: number;
    offboarding_id: number;
    approver_id: number;
    status: number;
    comments: string | null;
    created_at: string;
    updated_at: string;
  }[];
}
export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OffboardingUserResponse {
  data: IOffboardingResponse[];
  meta: Meta;
}
