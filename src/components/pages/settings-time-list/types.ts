import z from "zod";

export const lateDeductionFormScheme = z
  .object({
    shift_id: z.array(z.string()).min(1, "At least one shift is required"),
    duration_type: z.string(),
    min_minutes: z.number().min(1, "Minimum minutes must be greater than 0"),
    payroll_amount: z.number().optional(),
    leave_impact: z.string(),
    is_payroll_deduction: z.boolean(),
    is_leave_impact: z.boolean(),
    priority: z.number().int().min(1),
    is_active: z.boolean(),
    starts_on: z.string().optional(),
    ends_on: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => !data.is_payroll_deduction || data.payroll_amount !== undefined,
    {
      message: "Payroll amount is required when payroll deduction is enabled",
      path: ["payroll_amount"],
    },
  )
  .refine((data) => !data.is_leave_impact || !!data.leave_impact, {
    message: "Leave impact is required when leave impact is enabled",
    path: ["leave_impact"],
  });

export type LateDeductionValues = z.infer<typeof lateDeductionFormScheme>;
