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

const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().nullable().optional());

export const MutateFinalSalaryRequestSchema = z.object({
  overtime_amount: nullableNumber,
  bonus_amount: nullableNumber,
  reimbursement_amount: nullableNumber,
  deduction_amount: nullableNumber,
  notes: z.string().nullable(),
  allowances: z
    .array(
      z.object({
        allowance_type_id: nullableNumber,
        amount: nullableNumber,
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
  allowances: [],
};
