import z from "zod";

export const leaveBalanceFormScheme = z
  .object({
    job_level_id: z.number().min(1, "Job level is required"),
    balance: z.number().min(1, "Job level is required"),
    reset_period_day: z.number().min(1, "Job level is required"),
    reset_period_month: z.number().min(1, "Job level is required"),
  });

export type LeaveBalanceType = z.infer<typeof leaveBalanceFormScheme>;
