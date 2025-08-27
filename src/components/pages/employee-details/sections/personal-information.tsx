import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { rupiahFormatter } from "@/lib/helpers";
import { FamilyInformationSection } from "../../employee-management-form/sections/family-information-section";
import { FormalEducationSection } from "../../employee-management-form/sections/formal-education-section";
import { NonFormalEducationSection } from "../../employee-management-form/sections/non-formal-education-section";
import { WorkExperienceSection } from "../../employee-management-form/sections/work-experience-section";
import { ContactOfReferenceSection } from "../../employee-management-form/sections/contact-reference-section";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { getEmployeeDetail } from "@/services/employees";

dayjs.extend(localizedFormat);

interface Props {
  data: IEmployeeDetailsResponse;
}

interface DirectReportEmployee {
  id: number;
  name: string;
  position: string;
  department: string;
}

export const PersonalInformationDetail = React.memo(
  function PersonalInformationDetail({ data }: Props) {
    const [primaryDirectReports, setPrimaryDirectReports] = React.useState<
      DirectReportEmployee[]
    >([]);
    const [additionalDirectReports, setAdditionalDirectReports] =
      React.useState<DirectReportEmployee[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
      const fetchDirectReports = async () => {
        try {
          setIsLoading(true);
          const primaryRelationships = data.reporting_relationships.filter(
            (item) => item.relationship_type === "primary",
          );
          const secondaryRelationships = data.reporting_relationships.filter(
            (item) => item.relationship_type === "secondary",
          );
          const primaryReportsPromises = primaryRelationships.map(
            async (relationship) => {
              try {
                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );
                const employee = employeeResponse.data;
                return {
                  id: employee.id,
                  name: employee.user.name,
                  position: employee.employment.job_position.name,
                  department: employee.employment.department.name,
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
                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );
                const employee = employeeResponse.data;
                return {
                  id: employee.id,
                  name: employee.user.name,
                  position: employee.employment.job_position.name,
                  department: employee.employment.department.name,
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
        } finally {
          setIsLoading(false);
        }
      };

      if (data.reporting_relationships.length > 0) {
        fetchDirectReports();
      }
    }, [data.reporting_relationships]);

    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Personal Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">User Role</p>
            <p>{data.employment.job_level.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Email</p>
            <p>{data.user.email}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Phone Number</p>
            <p>{data.phone_number}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Gender</p>
            <p>{data.gender}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Place of Birth</p>
            <p>{data.place_of_birth}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Born Date</p>
            <p>{dayjs(data.date_of_birth).format("LL")}</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Marital Status</p>
              <p>{data.marital_status_label}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Blood Type</p>
              <p>{data.blood_type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Height</p>
              <p>{data.height}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Weight</p>
              <p>{data.weight}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">ID Number</p>
            <p>{data.id_number}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Taxpayer ID Number (NPWP)
            </p>
            <p>{data.npwp}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Health Insurance Number (BPJS)
            </p>
            <p>{data.bpjs}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Hobby</p>
            <p>{data.hobby}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Citizen ID Address</p>
            <p>{data.citizen_id_address}</p>
          </div>
          <div className="flex flex-col col-start-1">
            <p className="text-sm text-text-disabled">Residental Address</p>
            <p>{data.residential_address}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Achievement</p>
            <p>{data.achievement}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Personal Description</p>
            <p>{data.personal_description}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Social Media</p>
            <p>
              {data.social_media_accounts.map((item) => item.url).join(", ")}
            </p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Employee Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Position</p>
            <p>{data.employment.job_position.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{data.employment.department.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Job Level</p>
            <p>{data.employment.job_level.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Primary Direct Report</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
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
            <p className="text-sm text-text-disabled">Team</p>
            <p>{data.team_members.map((item) => item.team_id).join(", ")}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee Start Date</p>
            <p>{dayjs(data.employment.start_date).format("LL")}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee End Date</p>
            <p>
              {data.employment.end_date
                ? dayjs(data.employment.end_date).format("LL")
                : "-"}
            </p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Salary Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Base Salary</p>
            <p>{rupiahFormatter(Number(data.employment.base_salary))}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Salary (Nett)</p>
            <p>{rupiahFormatter(Number(data.employment.salary_nett))}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Bank Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Bank</p>
            <p>{data.bank_account.bank_name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Number</p>
            <p>{data.bank_account.account_number}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Name</p>
            <p>{data.bank_account.account_name}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>
        <FamilyInformationSection
          employee_profile_id={data.employment.employee_profile_id}
        />
        <FormalEducationSection
          employee_profile_id={data.employment.employee_profile_id}
        />
        <NonFormalEducationSection
          employee_profile_id={data.employment.employee_profile_id}
        />
        <WorkExperienceSection />
        <ContactOfReferenceSection />
      </div>
    );
  },
);
