import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, stringAvatar } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelfAssessment } from "./self-assessment";
import { AssessmentValidation } from "./assessment-validation";

dayjs.extend(localizedFormat);

interface Props {
  employeeDetails: IEmployeeDetailsResponse;
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

export function Tab() {
  const tabs = [
    {
      name: "Self Assessment",
      value: "self-assessment",
      content: <SelfAssessment />,
    },
    {
      name: "Assessment Validation",
      value: "assessment-validation",
      content: <AssessmentValidation />,
    },
  ];

  return (
    <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
      <TabsList className="p-1 w-full bg-secondary-background min-h-12 h-9">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-2.5 sm:px-3 text-secondary-hover",
              "data-[state=active]:bg-secondary data-[state=active]:text-white",
            )}
          >
            <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
              {tab.name}
            </code>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const EmployeeDetailsSection = React.memo(
  function EmployeeDetailsSection({ employeeDetails }: Props) {
    if (!employeeDetails) {
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
          <div className="flex flex-col items-center col-start-2">
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="size-20"
                src={`${process.env.NEXT_PUBLIC_FILE_URL}/${employeeDetails.photo_profile}`}
                alt={employeeDetails.user.name}
              />
              <AvatarFallback className="text-base font-medium">
                {stringAvatar(employeeDetails.user.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">
              {employeeDetails.user.name}
            </h3>
            <p className="text-sm">
              Employee ID{" "}
              <span className="font-semibold">{employeeDetails.id}</span>
            </p>
          </div>
          <h2 className="font-semibold text-lg md:col-span-3">
            Assessment Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Position</p>
            <p>{safeGet(employeeDetails.employment?.job_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{safeGet(employeeDetails.employment?.department?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Job Level</p>
            <p>{safeGet(employeeDetails.employment?.job_level?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Submitted On</p>
            <p>{safeGet(employeeDetails.phone_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Submission Status</p>
            <p>{safeGet(employeeDetails.id_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Supervisor</p>
            <p>{formatDate(employeeDetails.employment?.start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Validated On</p>
            <p>{formatDate(employeeDetails.employment?.end_date)}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>
        <Tab />
      </div>
    );
  },
);
