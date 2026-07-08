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
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";

interface Props {
  offboarding_id: number;
}

export const FinalSalaryBenefits = React.memo(function FinalSalaryBenefits({
  offboarding_id,
}: Props) {
  const t = useTranslations("offboarding");
  const tEmployee = useTranslations("employee");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const router = useRouter();
  const { data: salary } = useQuery({
    queryKey: ["salary", offboarding_id],
    queryFn: () => getShowFinalSalary(offboarding_id),
    enabled: !!offboarding_id,
  });


  return (
    <div className="space-y-4 w-full">
      <div className="border rounded-xl border-grayscale-20 shadow-sm shadow-[#1018281A] w-full">
        <div className="flex justify-between items-center p-4">
          <h4 className="font-semibold text-xl text-gray-900">
            {t("finalSalaryBenefits")}
          </h4>
          <Button
            className="font-semibold text-white text-sm hover:text-white"
            onClick={() =>
              router.push(
                `/employee/off-boarding/${offboarding_id}/salary-adjustment`,
              )
            }
          >
            <Image src="/icons/edit.svg" width={24} height={24} alt={tCommon("edit")} />{" "}
            {t("salaryAdjustment")}
          </Button>
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
                {salary?.data?.salary_nett
                  ? `${rupiahFormatter(Number(salary?.data?.salary_nett))}`
                  : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("overtime")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.overtime_amount
                  ? `${rupiahFormatter(Number(salary?.data?.overtime_amount))}`
                  : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{tEmployee("allowance")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.allowance_amount
                  ? `${rupiahFormatter(Number(salary?.data?.allowance_amount))}`
                  : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("bonus")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.bonus_amount
                  ? `${rupiahFormatter(Number(salary?.data?.bonus_amount))}`
                  : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("reimbursement")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.reimbursement_amount
                  ? `${rupiahFormatter(Number(salary?.data?.reimbursement_amount))}`
                  : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">{t("deduction")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.deduction_amount
                  ? `${rupiahFormatter(Number(salary?.data?.deduction_amount))}`
                  : "-"}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter className="bg-primary-background">
            <TableRow>
              <TableCell className="py-4 px-6">{t("totalGrossPay")}</TableCell>
              <TableCell className="py-4 px-6">
                {salary?.data?.total_amount
                  ? `${rupiahFormatter(Number(salary?.data?.total_amount))}`
                  : "-"}
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
              <AssignPayrunsModal isEdit offboarding_id={offboarding_id} />
              <CancelPayrunsModal offboardingId={offboarding_id} />
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
            <AssignPayrunsModal offboarding_id={offboarding_id} />
          </Alert>
        )}
      </div>
      <div className="flex gap-4">
        <CompleteOffboardingModal offboardingId={offboarding_id} />
        <CancelOffboardingModal offboardingId={offboarding_id} />
      </div>
    </div>
  );
});
