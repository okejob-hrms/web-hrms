import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getShowFinalSalary } from "@/services/employees/offboardings/final-salary";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";
import { rupiahFormatter } from "@/lib/helpers";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { AssignPayrunsModal } from "./modals/assign-payruns-modal";
import { CancelPayrunsModal } from "./modals/cancel-payruns-modal";
import { SalaryAdjustmentModal } from "./modals/salary-adjustment-modal";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";
import { usePermissionStore } from "@/hooks/use-permission-store";
import {
  COMPENSATION_CENSORED_PLACEHOLDER,
  COMPENSATION_VIEW_PERMISSION,
} from "@/lib/compensation";

interface Props {
  offboarding_id: number;
  readOnly?: boolean;
}

export const FinalSalaryBenefits = React.memo(function FinalSalaryBenefits({
  offboarding_id,
  readOnly = false,
}: Props) {
  const t = useTranslations("offboarding");
  const tEmployee = useTranslations("employee");
  const locale = resolveLocale(useLocale());
  const canViewCompensation = usePermissionStore((state) =>
    state.can(COMPENSATION_VIEW_PERMISSION),
  );
  const { data: salary } = useQuery({
    queryKey: ["salary", offboarding_id],
    queryFn: () => getShowFinalSalary(offboarding_id),
    enabled: !!offboarding_id,
  });

  const formatAmount = (value: string | number | null | undefined) => {
    if (!canViewCompensation) {
      return COMPENSATION_CENSORED_PLACEHOLDER;
    }
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return rupiahFormatter(Number(value));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="border rounded-xl border-grayscale-20 shadow-sm shadow-[#1018281A] w-full">
        <div className="flex justify-between items-center p-4 gap-3 flex-wrap">
          <h4 className="font-semibold text-xl text-gray-900">
            {t("finalSalaryBenefits")}
          </h4>
          {!readOnly && canViewCompensation && (
            <SalaryAdjustmentModal offboarding_id={offboarding_id} />
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead
                className="text-text-secondary text-xs py-4 px-6"
                colSpan={2}
              >
                {t("component")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-4 px-6">{t("baseNettSalary")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.salary_nett)}
              </TableCell>
            </TableRow>
            {salary?.data?.salary_nett_prorated != null &&
              salary?.data?.proration &&
              Number(salary.data.proration.factor) < 1 && (
                <TableRow>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span>{t("baseNettSalaryProrated")}</span>
                      <span className="text-xs text-text-secondary font-normal">
                        {t("prorationHint", {
                          daysPayable: salary.data.proration.days_payable,
                          daysInMonth: salary.data.proration.days_in_month,
                          divisor: salary.data.proration.divisor,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {formatAmount(salary.data.salary_nett_prorated)}
                  </TableCell>
                </TableRow>
              )}
            <TableRow>
              <TableCell className="py-4 px-6">{t("overtime")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.overtime_amount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{tEmployee("allowance")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.allowance_amount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("bonus")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.bonus_amount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("reimbursement")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.reimbursement_amount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("deduction")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.deduction_amount)}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter className="bg-primary-background">
            <TableRow>
              <TableCell className="py-4 px-6">{t("totalGrossPay")}</TableCell>
              <TableCell className="py-4 px-6">
                {formatAmount(salary?.data?.total_amount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="grid items-start w-full gap-4">
        {salary?.data.assigned_payrun_date ? (
          <Alert className="flex items-center border border-primary-border bg-primary-background shadow-sm justify-between">
            <div>
              <AlertTitle className="text-primary font-semibold text-lg">
                {t("finalSalaryPayoutTitle")}
              </AlertTitle>
              <AlertDescription className="text-black">
                <span>
                  {t("finalSalaryPayoutAssigned", {
                    month: dayjs(salary.data.assigned_payrun_date)
                      .locale(locale)
                      .format("MMMM YYYY"),
                  })}
                </span>
              </AlertDescription>
            </div>
            <div className="self-start flex">
              {!readOnly && (
                <>
                  <AssignPayrunsModal isEdit offboarding_id={offboarding_id} />
                  <CancelPayrunsModal offboardingId={offboarding_id} />
                </>
              )}
            </div>
          </Alert>
        ) : (
          <Alert className="flex items-center border border-grayscale-20 shadow-sm justify-between">
            <div>
              <AlertTitle className="text-primary font-semibold text-lg">
                {t("finalSalaryPayoutTitle")}
              </AlertTitle>
              <AlertDescription className="text-black">
                {t("finalSalaryPayoutSetup")}
              </AlertDescription>
            </div>
            {!readOnly && (
              <AssignPayrunsModal offboarding_id={offboarding_id} />
            )}
          </Alert>
        )}
      </div>
      {!readOnly && (
        <div className="flex gap-4">
          <CompleteOffboardingModal offboardingId={offboarding_id} />
          <CancelOffboardingModal offboardingId={offboarding_id} />
        </div>
      )}
    </div>
  );
});
