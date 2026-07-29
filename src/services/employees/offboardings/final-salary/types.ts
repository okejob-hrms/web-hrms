export interface IFinalSalaryAllowance {
  allowance_type_id: number;
  amount: number;
}

export interface IFinalSalaryResponse {
  id: number | null;
  offboarding_id: number | null;
  base_salary: string;
  salary_nett: string;
  salary_nett_prorated?: string | null;
  proration?: {
    divisor: number;
    days_in_month: number;
    days_payable: number;
    payable_hours: number;
    factor: number;
    last_working_date: string | null;
  } | null;
  overtime_amount: string;
  allowance_amount: string;
  allowances_count: number;
  allowances?: IFinalSalaryAllowance[];
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
        allowance_type_id: z.number().nullable(),
        amount: z.number().nullable(),
      }),
    )
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
  allowances: [],
};
