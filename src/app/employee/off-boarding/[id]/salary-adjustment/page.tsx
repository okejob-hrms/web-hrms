"use client";
import * as React from "react";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetail } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { SalaryAdjustmentForm } from "@/components/pages/offboarding-details/sections/salary-adjustment-form";
import { getDetailOffboarding } from "@/services/employees/offboardings";

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
    queryKey: ["employee-detail", offboardingDetails!.user_id],
    queryFn: () => getEmployeeDetail(offboardingDetails!.user_id),
    enabled: !!offboardingDetails!.user_id,
  });

  if (isLoadingOffboardingDetails || isLoadingEmployeeDetails) {
    return <AppSkeleton />;
  }

  if (
    isErrorOffboardingDetails ||
    isErrorEmployeeDetails ||
    !employeeDetails ||
    !offboardingDetails
  ) {
    return <div>Data not found</div>;
  }

  return (
    <div className="font-sans min-h-screen space-y-4">
      <EmployeeDetailsSection
        offboardingDetails={offboardingDetails}
        employeeDetails={employeeDetails.data}
      />
      <SalaryAdjustmentForm offboarding_id={id} />
    </div>
  );
}
