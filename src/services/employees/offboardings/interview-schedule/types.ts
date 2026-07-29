import { z } from "zod";

export const InterviewScheduleRequestSchema = z.object({
  date: z.custom<string | Date>(
    (val) =>
      (typeof val === "string" && val.trim().length > 0) || val instanceof Date,
    { message: "Date is required" },
  ),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  participants: z
    .array(
      z.object({
        user_id: z.number(),
      }),
    )
    .min(1, "At least one participant is required"),
  notes: z.string().optional().default(""),
});

export type IInterviewScheduleRequest = z.infer<
  typeof InterviewScheduleRequestSchema
>;

export interface IInterviewScheduleParticipant {
  user_id: number;
  name: string | null;
  email?: string | null;
  employee_id?: number | null;
  employee_code?: string | null;
  photo_profile?: string | null;
  job_position?: string | null;
}

export interface IInterviewScheduleResponse {
  id: number;
  offboarding_id: number;
  date: string;
  start_time: string;
  end_time: string;
  participants: IInterviewScheduleParticipant[];
  updated_at: string;
  created_at: string;
  notes: string | null;
  status: number;
}
