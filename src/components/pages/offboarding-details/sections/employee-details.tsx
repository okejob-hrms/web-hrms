import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useLocale, useTranslations } from "next-intl";
import { getEmployeeDetail } from "@/services/employees";
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

    const [primaryDirectReports, setPrimaryDirectReports] = React.useState<
      DirectReportEmployee[]
    >([]);
    const [additionalDirectReports, setAdditionalDirectReports] =
      React.useState<DirectReportEmployee[]>([]);
    const [isLoadingReports, setIsLoadingReports] = React.useState(false);
    const [reportsError, setReportsError] = React.useState<string | null>(null);

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

    const safeGet = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined || value === "") return "-";
      return String(value).trim() || "-";
    };

    React.useEffect(() => {
      const fetchDirectReports = async () => {
        try {
          setIsLoadingReports(true);
          setReportsError(null);

          const relationships = employeeDetails?.reporting_relationships ?? [];
          if (relationships.length === 0) {
            setPrimaryDirectReports([]);
            setAdditionalDirectReports([]);
            return;
          }

          const primaryRelationships = relationships.filter(
            (item) => item?.relationship_type === "primary",
          );
          const secondaryRelationships = relationships.filter(
            (item) => item?.relationship_type === "secondary",
          );

          const mapRelationship = async (relationship: {
            direct_report_id: number;
          }): Promise<DirectReportEmployee | null> => {
            try {
              if (!relationship?.direct_report_id) return null;

              const employeeResponse = await getEmployeeDetail(
                relationship.direct_report_id,
              );
              const employee = employeeResponse?.data;
              if (!employee) return null;

              return {
                id: employee.id || 0,
                name: employee.user?.name || t("unknown"),
                position:
                  employee.employment?.job_position?.name ||
                  t("unknownPosition"),
                department:
                  employee.employment?.department?.name ||
                  t("unknownDepartment"),
              };
            } catch (error) {
              console.error(
                `Failed to fetch employee ${relationship.direct_report_id}:`,
                error,
              );
              return null;
            }
          };

          const [primaryResults, additionalResults] = await Promise.all([
            Promise.all(primaryRelationships.map(mapRelationship)),
            Promise.all(secondaryRelationships.map(mapRelationship)),
          ]);

          setPrimaryDirectReports(
            primaryResults.filter(
              (item): item is DirectReportEmployee => item !== null,
            ),
          );
          setAdditionalDirectReports(
            additionalResults.filter(
              (item): item is DirectReportEmployee => item !== null,
            ),
          );
        } catch (error) {
          console.error("Error fetching direct reports:", error);
          setReportsError(t("failedToLoad"));
        } finally {
          setIsLoadingReports(false);
        }
      };

      void fetchDirectReports();
    }, [employeeDetails?.reporting_relationships, t]);

    if (!employeeDetails || !offboardingDetails) {
      return (
        <div className="flex flex-col w-full gap-4 p-2">
          <div className="text-center text-gray-500">
            {t("noEmployeeData")}
          </div>
        </div>
      );
    }

    const renderDirectReports = (reports: DirectReportEmployee[]) => {
      if (isLoadingReports) {
        return <p className="text-sm text-gray-500">{tCommon("loading")}</p>;
      }
      if (reportsError) {
        return <p className="text-sm text-red-500">{reportsError}</p>;
      }
      if (reports.length === 0) {
        return <p className="text-sm text-gray-500">-</p>;
      }

      return (
        <div className="space-y-1">
          {reports.map((employee) => (
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
      );
    };

    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            {t("employeeDetails")}
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              {tOffboarding("employeeName")}
            </p>
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
            <p className="text-sm text-text-disabled">
              {t("primaryDirectReport")}
            </p>
            <div>{renderDirectReports(primaryDirectReports)}</div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              {t("additionalDirectReport")}
            </p>
            <div>{renderDirectReports(additionalDirectReports)}</div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("employeeStartDate")}</p>
            <p>{formatDate(employeeDetails.employment?.start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              {tOffboarding("effectiveResignDate")}
            </p>
            <p>{formatDate(offboardingDetails.effective_resignation_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">{t("lastWorkingDate")}</p>
            <p>{formatDate(offboardingDetails.last_working_date)}</p>
          </div>
          <div className="flex flex-col md:col-span-3">
            <p className="text-sm text-text-disabled">
              {tOffboarding("assignedApprover")}
            </p>
            <div>
              {offboardingDetails.approvers?.length > 0 ? (
                <div className="space-y-1">
                  {offboardingDetails.approvers.map((approver) => (
                    <div key={approver.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {safeGet(approver.name)}
                      </span>
                      {approver.email ? (
                        <span className="text-text-disabled text-base">
                          {" "}
                          ({approver.email})
                        </span>
                      ) : null}
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
