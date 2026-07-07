"use client";

import { rupiahFormatter } from "@/lib/helpers";
import { IPenaltyResponse } from "@/services/employees/penalties/types";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export function usePenaltyLabels() {
  const t = useTranslations("employee");
  const locale = useLocale();

  return useMemo(
    () => ({
      getTriggerLabel: (value?: string) => {
        if (!value) return "-";
        const labels: Record<string, string> = {
          late: t("penaltyTriggerLate"),
          early_leave: t("penaltyTriggerEarlyLeave"),
          both: t("penaltyTriggerBoth"),
        };
        return labels[value] ?? value;
      },
      getConditionLabel: (value?: string) => {
        if (!value) return "-";
        const labels: Record<string, string> = {
          per_occurrence: t("perOccurrence"),
          monthly_aggregate: t("monthlyAggregate"),
        };
        return labels[value] ?? value;
      },
      getImpactLabel: (value?: string) => {
        if (!value) return "-";
        const labels: Record<string, string> = {
          base_salary: t("baseSalary"),
          allowance: t("allowance"),
        };
        return labels[value] ?? value;
      },
      getValueTypeLabel: (value?: string) => {
        if (!value) return "-";
        const labels: Record<string, string> = {
          fixed: t("penaltyValueFixed"),
          percentage: t("penaltyValuePercentage"),
          amount: t("penaltyValueAmount"),
        };
        return labels[value] ?? value;
      },
      formatPeriod: (period?: string) => {
        if (!period) return "-";
        const [year, month] = period.split("-").map(Number);
        if (!year || !month) return period;
        return new Date(year, month - 1).toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
        });
      },
      formatConfiguredValue: (amount?: number, valueType?: string) => {
        if (amount === undefined || amount === null) return "-";
        if (valueType === "percentage") return `${amount}%`;
        return rupiahFormatter(amount);
      },
      getAppliedAmount: (penalty: IPenaltyResponse) =>
        Number(penalty.amount ?? 0),
      isDispensation: (penalty: IPenaltyResponse) =>
        Number(penalty.amount ?? 0) === 0,
    }),
    [t, locale],
  );
}
