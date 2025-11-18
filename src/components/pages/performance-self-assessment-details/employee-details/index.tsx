import * as React from "react";
import { EmployeeDetailsSection } from "./sections/employee-details";
import { useSelfAssessmentEmployeeDetails } from "./hook";
import AppSkeleton from "@/components/partials/app-skeleton";

export const SelfAssessmentEmployeeDetails = () => {
  const { employeeDetails, isLoadingEmployeeDetails, isErrorEmployeeDetails } =
    useSelfAssessmentEmployeeDetails();

  if (isLoadingEmployeeDetails) {
    return <AppSkeleton />;
  }

  if (isErrorEmployeeDetails || !employeeDetails) {
    return <div>Assessment Information not found</div>;
  }

  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <EmployeeDetailsSection employeeDetails={employeeDetails?.data} />
    </div>
  );
};
