import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useLocale, useTranslations } from "next-intl";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { IOffboardingDetailResponse } from "@/services/employees/offboardings/types";
import { resolveLocale } from "@/lib/i18n/locale";

dayjs.extend(localizedFormat);

interface Props {
  offboardingDetails: IOffboardingDetailResponse;
  employeeDetails: IEmployeeDetailsResponse;
}

interface DirectReportEmployee {
  id: number;
  name: string;
  position: string;
  department: string;
}

export const EmployeeDetailsSection = React.memo(
  function EmployeeDetailsSection({
    offboardingDetails,
    employeeDetails,
  }: Props) {
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const tOffboarding = useTranslations("offboarding");
    const locale = resolveLocale(useLocale());

    const formatDate = React.useCallback(
      (date: string | null | undefined): string => {
        if (!date) return "-";
        try {
          const formatted = dayjs(date).locale(locale).format("LL");
          return formatted === "Invalid date" ? "-" : formatted;
        } catch {
          return "-";
        }
      },
      [locale],
    );

    const safeGet = (value: string | number): string => {
      if (value === null || value === undefined || value === "") return "-";
      return String(value).trim() || "-";
    };

    const [primaryDirectReports] = React.useState<DirectReportEmployee[]>([]);
    const [additionalDirectReports] = React.useState<DirectReportEmployee[]>(
      [],
    );
    const [isLoading] = React.useState(false);
    const [error] = React.useState<string | null>(null);

    if (!employeeDetails || !offboardingDetails) {
      return (
        <div className="flex flex-col w-full gap-4 p-2">
          <div className="text-center text-gray-500">
            {t("noEmployeeData")}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            {t("employeeDetails")}
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{tOffboarding("employeeName")}</p>
            <p>{safeGet(offboardingDetails.user.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("employeeId")}</p>
            <p>{safeGet(offboardingDetails.user.code)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{tCommon("email")}</p>
            <p>{safeGet(offboardingDetails.user.email)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("phoneNumber")}</p>
            <p>{safeGet(employeeDetails.phone_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("idNumber")}</p>
            <p>{safeGet(employeeDetails.id_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("npwp")}</p>
            <p>{safeGet(employeeDetails.npwp)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{tCommon("position")}</p>
            <p>{safeGet(employeeDetails.employment?.job_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{tCommon("department")}</p>
            <p>{safeGet(employeeDetails.employment?.department?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("jobLevel")}</p>
            <p>{safeGet(employeeDetails.employment?.job_level?.name)}</p>
          </div>
          <div className="flex flex-col md:col-span-2">
            <p className="text-sm text-text-disabled">{t("primaryDirectReport")}</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">{tCommon("loading")}</p>
              ) : error ? (
                <p className="text-sm text-red-500">{t("failedToLoad")}</p>
              ) : primaryDirectReports.length > 0 ? (
                <div className="space-y-1">
                  {primaryDirectReports.map((employee) => (
                    <div key={employee.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {employee.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({employee.position})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              {t("additionalDirectReport")}
            </p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">{tCommon("loading")}</p>
              ) : error ? (
                <p className="text-sm text-red-500">{t("failedToLoad")}</p>
              ) : additionalDirectReports.length > 0 ? (
                <div className="space-y-1">
                  {additionalDirectReports.map((employee) => (
                    <div key={employee.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {employee.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({employee.position})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("employeeStartDate")}</p>
            <p>{formatDate(employeeDetails.employment?.start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{tOffboarding("effectiveResignDate")}</p>
            <p>{formatDate(employeeDetails.employment?.end_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("lastWorkingDate")}</p>
            <p>{formatDate(employeeDetails.employment?.end_date)}</p>
          </div>
          <div className="flex flex-col md:col-span-3">
            <p className="text-sm text-text-disabled">{tOffboarding("assignedApprover")}</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">{tCommon("loading")}</p>
              ) : error ? (
                <p className="text-sm text-red-500">{t("failedToLoad")}</p>
              ) : primaryDirectReports.length > 0 ? (
                <div className="space-y-1">
                  {primaryDirectReports.map((employee) => (
                    <div key={employee.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {employee.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({employee.position})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <Separator className="md:col-span-3" />
        </div>
      </div>
    );
  },
);
