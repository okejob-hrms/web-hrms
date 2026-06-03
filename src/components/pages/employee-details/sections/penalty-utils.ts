import { rupiahFormatter } from "@/lib/helpers";
import { IPenaltyResponse } from "@/services/employees/penalties/types";

export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  late: "Terlambat",
  early_leave: "Pulang Cepat",
  both: "Terlambat / Pulang Cepat",
};

export const CONDITION_TYPE_LABELS: Record<string, string> = {
  per_occurrence: "Per Kejadian",
  monthly_aggregate: "Akumulasi Bulanan",
};

export const IMPACT_TYPE_LABELS: Record<string, string> = {
  base_salary: "Gaji Pokok",
  allowance: "Tunjangan",
};

export const VALUE_TYPE_LABELS: Record<string, string> = {
  fixed: "Nominal Tetap",
  percentage: "Persentase",
  amount: "Nominal",
};

export const getTriggerLabel = (value?: string) =>
  value ? (TRIGGER_TYPE_LABELS[value] ?? value) : "-";

export const getConditionLabel = (value?: string) =>
  value ? (CONDITION_TYPE_LABELS[value] ?? value) : "-";

export const getImpactLabel = (value?: string) =>
  value ? (IMPACT_TYPE_LABELS[value] ?? value) : "-";

export const getValueTypeLabel = (value?: string) =>
  value ? (VALUE_TYPE_LABELS[value] ?? value) : "-";

/** Format "2026-05" -> "Mei 2026" */
export const formatPeriod = (period?: string) => {
  if (!period) return "-";
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;
  return new Date(year, month - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

/** Format the configured value of a rule, respecting its value type. */
export const formatConfiguredValue = (
  amount?: number,
  valueType?: string,
): string => {
  if (amount === undefined || amount === null) return "-";
  if (valueType === "percentage") return `${amount}%`;
  return rupiahFormatter(amount);
};

/** The actual penalty amount applied (string like "10000.00"). */
export const getAppliedAmount = (penalty: IPenaltyResponse): number =>
  Number(penalty.amount ?? 0);

/** A penalty with amount 0 is a dispensation / no deduction. */
export const isDispensation = (penalty: IPenaltyResponse): boolean =>
  getAppliedAmount(penalty) === 0;
