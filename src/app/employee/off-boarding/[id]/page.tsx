"use client";
import * as React from "react";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetail } from "@/services/employees";
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
    queryKey: ["employee-detail", offboardingDetails?.user_id],
    queryFn: () => getEmployeeDetail(offboardingDetails!.user_id),
    enabled: !!offboardingDetails?.user_id,
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
    <div className="font-sans min-h-screen space-y-4">
      <EmployeeDetailsSection
        offboardingDetails={offboardingDetails}
        employeeDetails={employeeDetails.data}
      />
      <OffboardingTab offboarding_id={id} />
    </div>
  );
}
