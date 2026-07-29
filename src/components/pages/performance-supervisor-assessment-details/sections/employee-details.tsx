import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ISupervisorAssessmentResponse } from "@/services/performances/supervisor-assessment/types";
import { getEmployeeDetailByUserId } from "@/services/employees";

dayjs.extend(localizedFormat);

interface Props {
  data: ISupervisorAssessmentResponse;
}

interface DirectReportEmployee {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface AssessorEmployee {
  id: number;
  name: string;
  position: string;
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

const safeGet = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).trim() || "-";
};

export const EmployeeDetailsSection = React.memo(
  function EmployeeDetailsSection({ data }: Props) {
    const [primaryDirectReports, setPrimaryDirectReports] = React.useState<
      DirectReportEmployee[]
    >([]);
    const [additionalDirectReports, setAdditionalDirectReports] =
      React.useState<DirectReportEmployee[]>([]);
    const [assessors, setAssessors] = React.useState<AssessorEmployee[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingAssessors, setIsLoadingAssessors] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [assessorError, setAssessorError] = React.useState<string | null>(
      null,
    );

    // React.useEffect(() => {
    //   const fetchDirectReports = async () => {
    //     try {
    //       setIsLoading(true);
    //       setError(null);

    //       if (
    //         !data?.reporting_relationships ||
    //         data.reporting_relationships.length === 0
    //       ) {
    //         setIsLoading(false);
    //         return;
    //       }

    //       const primaryRelationships = data.reporting_relationships.filter(
    //         (item) => item?.relationship_type === "primary",
    //       );
    //       const secondaryRelationships = data.reporting_relationships.filter(
    //         (item) => item?.relationship_type === "secondary",
    //       );

    //       const primaryReportsPromises = primaryRelationships.map(
    //         async (relationship) => {
    //           try {
    //             if (!relationship?.direct_report_id) return null;

    //             const employeeResponse = await getEmployeeDetail(
    //               relationship.direct_report_id,
    //             );

    //             const employee = employeeResponse?.data;
    //             if (!employee) return null;

    //             return {
    //               id: employee.id || 0,
    //               name: employee.user?.name || "Unknown",
    //               position:
    //                 employee.employment?.job_position?.name ||
    //                 "Unknown Position",
    //               department:
    //                 employee.employment?.department?.name ||
    //                 "Unknown Department",
    //             };
    //           } catch (error) {
    //             console.error(
    //               `Failed to fetch employee ${relationship.direct_report_id}:`,
    //               error,
    //             );
    //             return null;
    //           }
    //         },
    //       );

    //       const additionalReportsPromises = secondaryRelationships.map(
    //         async (relationship) => {
    //           try {
    //             if (!relationship?.direct_report_id) return null;

    //             const employeeResponse = await getEmployeeDetail(
    //               relationship.direct_report_id,
    //             );

    //             const employee = employeeResponse?.data;
    //             if (!employee) return null;

    //             return {
    //               id: employee.id || 0,
    //               name: employee.user?.name || "Unknown",
    //               position:
    //                 employee.employment?.job_position?.name ||
    //                 "Unknown Position",
    //               department:
    //                 employee.employment?.department?.name ||
    //                 "Unknown Department",
    //             };
    //           } catch (error) {
    //             console.error(
    //               `Failed to fetch employee ${relationship.direct_report_id}:`,
    //               error,
    //             );
    //             return null;
    //           }
    //         },
    //       );

    //       const [primaryResults, additionalResults] = await Promise.all([
    //         Promise.all(primaryReportsPromises),
    //         Promise.all(additionalReportsPromises),
    //       ]);

    //       setPrimaryDirectReports(
    //         primaryResults.filter(
    //           (item): item is DirectReportEmployee => item !== null,
    //         ),
    //       );
    //       setAdditionalDirectReports(
    //         additionalResults.filter(
    //           (item): item is DirectReportEmployee => item !== null,
    //         ),
    //       );
    //     } catch (error) {
    //       console.error("Error fetching direct reports:", error);
    //       setError("Failed to load direct reports");
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };

    //   if (
    //     data?.reporting_relationships &&
    //     data.reporting_relationships.length > 0
    //   ) {
    //     fetchDirectReports();
    //   }
    // }, [data?.reporting_relationships]);

    React.useEffect(() => {
      const fetchAssessors = async () => {
        try {
          setIsLoadingAssessors(true);
          setAssessorError(null);

          if (!data?.assessors || data.assessors.length === 0) {
            setAssessors([]);
            setIsLoadingAssessors(false);
            return;
          }

          // Prefer assessor.user from the detail API when available.
          const fromPayload = data.assessors
            .map((assessor) => {
              if (!assessor?.user?.name) return null;
              return {
                id: assessor.id,
                name: assessor.user.name,
                position: assessor.user.job_position || "Unknown Position",
              };
            })
            .filter((item): item is AssessorEmployee => item !== null);

          if (fromPayload.length === data.assessors.length) {
            setAssessors(fromPayload);
            setIsLoadingAssessors(false);
            return;
          }

          const assessorPromises = data.assessors.map(async (assessor) => {
            try {
              if (!assessor?.user_id) return null;

              const employeeResponse = await getEmployeeDetailByUserId(
                assessor.user_id,
              );

              const employee = employeeResponse?.data;
              if (!employee) return null;

              return {
                id: assessor.id,
                name: employee.user?.name || "Unknown",
                position:
                  employee.employment?.job_position?.name || "Unknown Position",
              };
            } catch (error) {
              console.error(
                `Failed to fetch assessor ${assessor.user_id}:`,
                error,
              );
              return null;
            }
          });

          const results = await Promise.all(assessorPromises);
          setAssessors(
            results.filter((item): item is AssessorEmployee => item !== null),
          );
        } catch (error) {
          console.error("Error fetching assessors:", error);
          setAssessorError("Failed to load assessors");
        } finally {
          setIsLoadingAssessors(false);
        }
      };

      if (data?.assessors && data.assessors.length > 0) {
        fetchAssessors();
      } else {
        setAssessors([]);
      }
    }, [data?.assessors]);

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
            <p className="text-sm text-text-disabled">Current Position</p>
            <p>{safeGet(data.current_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{safeGet(data.current_department?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Current Job Level</p>
            <p>{safeGet(data.current_level?.name)}</p>
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
            <p>{formatDate(data.employee_start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Target Position</p>
            <p>{safeGet(data.target_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Target Job Level</p>
            <p>{safeGet(data.target_level?.name)}</p>
          </div>
          <div className="flex flex-col md:col-span-3">
            <p className="text-sm text-text-disabled">Assigned Assessor</p>
            <div>
              {isLoadingAssessors ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : assessorError ? (
                <p className="text-sm text-red-500">Failed to load</p>
              ) : assessors.length > 0 ? (
                <div className="space-y-1">
                  {assessors.map((assessor) => (
                    <div key={assessor.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {assessor.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({assessor.position})
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
