"use client";
import * as React from "react";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetailByUserId } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { getDetailOffboarding } from "@/services/employees/offboardings";
import { OffboardingTab } from "@/components/pages/offboarding-details/sections/offboarding-tab";

export default function OffboardingSalaryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);
  const numericId = Number(id);

  const {
    data: offboardingDetails,
    isLoading: isLoadingOffboardingDetails,
    isError: isErrorOffboardingDetails,
  } = useQuery({
    queryKey: ["offboarding-detail", numericId],
    queryFn: () => getDetailOffboarding(numericId),
    enabled: !!numericId,
  });

  const {
    data: employeeDetails,
    isLoading: isLoadingEmployeeDetails,
    isError: isErrorEmployeeDetails,
  } = useQuery({
    queryKey: ["employee-detail", offboardingDetails?.data.user_id],
    queryFn: () => getEmployeeDetailByUserId(offboardingDetails!.data.user_id),
    enabled: !!offboardingDetails?.data.user_id,
  });
  
  if (isLoadingOffboardingDetails) {
    return <AppSkeleton />;
  }

  if (isErrorOffboardingDetails || !offboardingDetails) {
    return <div>Offboarding data not found</div>;
  }

  if (isLoadingEmployeeDetails) {
    return <AppSkeleton />;
  }

  if (isErrorEmployeeDetails || !employeeDetails) {
    return <div>Employee data not found</div>;
  }

  return (
    <div className="font-sans min-h-screen space-y-4 p-4 md:p-6">
      <EmployeeDetailsSection
        offboardingDetails={offboardingDetails.data}
        employeeDetails={employeeDetails.data}
      />
      <OffboardingTab offboarding_id={id} />
    </div>
  );
}
