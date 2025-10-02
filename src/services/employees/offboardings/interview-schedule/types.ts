import { z } from "zod";

export const InterviewScheduleRequestSchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  participants: z
    .array(
      z.object({
        user_id: z.number(),
      }),
    )
    .min(1, "At least one participant is required"),
  notes: z.string(),
});

export type IInterviewScheduleRequest = z.infer<
  typeof InterviewScheduleRequestSchema
>;

export interface IInterviewScheduleResponse {
  id: number;
  offboarding_id: number;
  date: string;
  start_time: string;
  end_time: string;
  participants: {
    user_id: number;
  }[];
  updated_at: string;
  created_at: string;
  notes: string | null;
  status: number;
}
