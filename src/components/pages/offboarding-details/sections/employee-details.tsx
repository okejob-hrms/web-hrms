import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { getEmployeeDetail } from "@/services/employees";
import { OffboardingTab } from "./offboarding-tab";

dayjs.extend(localizedFormat);

interface Props {
  data: IEmployeeDetailsResponse;
  offboarding_id: number;
}

interface DirectReportEmployee {
  id: number;
  name: string;
  position: string;
  department: string;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    const formatted = dayjs(date).format("LL");
    return formatted === "Invalid date" ? "-" : formatted;
  } catch {
    return "-";
  }
};

const safeGet = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).trim() || "-";
};

export const EmployeeDetailsSection = React.memo(
  function EmployeeDetailsSection({ data, offboarding_id }: Props) {
    const [primaryDirectReports, setPrimaryDirectReports] = React.useState<
      DirectReportEmployee[]
    >([]);
    const [additionalDirectReports, setAdditionalDirectReports] =
      React.useState<DirectReportEmployee[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      const fetchDirectReports = async () => {
        try {
          setIsLoading(true);
          setError(null);

          if (
            !data?.reporting_relationships ||
            data.reporting_relationships.length === 0
          ) {
            setIsLoading(false);
            return;
          }

          const primaryRelationships = data.reporting_relationships.filter(
            (item) => item?.relationship_type === "primary",
          );
          const secondaryRelationships = data.reporting_relationships.filter(
            (item) => item?.relationship_type === "secondary",
          );

          const primaryReportsPromises = primaryRelationships.map(
            async (relationship) => {
              try {
                if (!relationship?.direct_report_id) return null;

                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );

                const employee = employeeResponse?.data;
                if (!employee) return null;

                return {
                  id: employee.id || 0,
                  name: employee.user?.name || "Unknown",
                  position:
                    employee.employment?.job_position?.name ||
                    "Unknown Position",
                  department:
                    employee.employment?.department?.name ||
                    "Unknown Department",
                };
              } catch (error) {
                console.error(
                  `Failed to fetch employee ${relationship.direct_report_id}:`,
                  error,
                );
                return null;
              }
            },
          );

          const additionalReportsPromises = secondaryRelationships.map(
            async (relationship) => {
              try {
                if (!relationship?.direct_report_id) return null;

                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );

                const employee = employeeResponse?.data;
                if (!employee) return null;

                return {
                  id: employee.id || 0,
                  name: employee.user?.name || "Unknown",
                  position:
                    employee.employment?.job_position?.name ||
                    "Unknown Position",
                  department:
                    employee.employment?.department?.name ||
                    "Unknown Department",
                };
              } catch (error) {
                console.error(
                  `Failed to fetch employee ${relationship.direct_report_id}:`,
                  error,
                );
                return null;
              }
            },
          );

          const [primaryResults, additionalResults] = await Promise.all([
            Promise.all(primaryReportsPromises),
            Promise.all(additionalReportsPromises),
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
          setError("Failed to load direct reports");
        } finally {
          setIsLoading(false);
        }
      };

      if (
        data?.reporting_relationships &&
        data.reporting_relationships.length > 0
      ) {
        fetchDirectReports();
      }
    }, [data?.reporting_relationships]);

    if (!data) {
      return (
        <div className="flex flex-col w-full gap-4 p-2">
          <div className="text-center text-gray-500">
            No employee data available
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Employee Details
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee Name</p>
            <p>{safeGet(data.user.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee ID</p>
            <p>{safeGet(data.user.id)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Email</p>
            <p>{safeGet(data.user.email)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Phone Number</p>
            <p>{safeGet(data.phone_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">ID Number</p>
            <p>{safeGet(data.id_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Taxpayer ID Number (NPWP)
            </p>
            <p>{safeGet(data.npwp)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Position</p>
            <p>{safeGet(data.employment?.job_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{safeGet(data.employment?.department?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Job Level</p>
            <p>{safeGet(data.employment?.job_level?.name)}</p>
          </div>
          <div className="flex flex-col md:col-span-2">
            <p className="text-sm text-text-disabled">Primary Direct Report</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Failed to load</p>
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
              Additional Direct Report
            </p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Failed to load</p>
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
            <p className="text-sm text-text-disabled">Employee Start Date</p>
            <p>{formatDate(data.employment?.start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Effective Resign Date</p>
            <p>{formatDate(data.employment?.end_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Last Working Date</p>
            <p>{formatDate(data.employment?.end_date)}</p>
          </div>
          <div className="flex flex-col md:col-span-3">
            <p className="text-sm text-text-disabled">Assigned Approver</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Failed to load</p>
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
        {/* <OffboardingTab offboarding_id={offboarding_id} /> */}
      </div>
    );
  },
);
