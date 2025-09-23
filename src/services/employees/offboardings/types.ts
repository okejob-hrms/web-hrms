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
