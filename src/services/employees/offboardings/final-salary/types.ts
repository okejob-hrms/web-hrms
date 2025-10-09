export interface IFinalSalaryResponse {
  id: number | null;
  offboarding_id: number | null;
  base_salary: string;
  salary_nett: string;
  overtime_amount: string;
  allowance_amount: string;
  allowances_count: number;
  bonus_amount: string;
  reimbursement_amount: string;
  deduction_amount: string;
  total_amount: string;
  assigned_payrun_date: string | null;
  status: string | number | null;
  status_label: string;
  notes: string | null;
}

import { z } from "zod";

export const MutateFinalSalaryRequestSchema = z.object({
  overtime_amount: z.number().nullable(),
  bonus_amount: z.number().nullable(),
  reimbursement_amount: z.number().nullable(),
  deduction_amount: z.number().nullable(),
  notes: z.string().nullable(),
  allowances: z
    .array(
      z.object({
        allowance_type_id: z.number().optional().nullable(),
        amount: z.number().optional().nullable(),
      }),
    )
    .optional()
    .nullable(),
});

export type IMutateFinalSalaryRequest = z.infer<
  typeof MutateFinalSalaryRequestSchema
>;

export const defaultFinalSalaryAdjustmentForm: IMutateFinalSalaryRequest = {
  overtime_amount: null,
  bonus_amount: null,
  reimbursement_amount: null,
  deduction_amount: null,
  notes: null,
  allowances: null,
};
