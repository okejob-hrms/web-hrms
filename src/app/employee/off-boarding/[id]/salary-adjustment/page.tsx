"use client";
import * as React from "react";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetail } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { SalaryAdjustmentForm } from "@/components/pages/offboarding-details/sections/salary-adjustment-form";

export default function OffboardingSalaryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);

  const numericId = Number(id);

  const {
    data: employeeDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employee-detail", numericId],
    queryFn: () => getEmployeeDetail(numericId),
    enabled: !!numericId,
  });

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (isError || !employeeDetails) {
    return <div>Data not found</div>;
  }

  return (
    <div className="font-sans min-h-screen space-y-4">
      <EmployeeDetailsSection data={employeeDetails.data} offboarding_id={id} />
      <SalaryAdjustmentForm offboarding_id={id} />
    </div>
  );
}
