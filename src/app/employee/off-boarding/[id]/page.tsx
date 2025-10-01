"use client";
import * as React from "react";
import { OffboardingDetail } from "@/components/pages/offboarding-details";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetail } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";

export default function OffboardingDetailPage({
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
    <div className="font-sans min-h-screen">
      <EmployeeDetailsSection data={employeeDetails.data} offboarding_id={id} />
      <OffboardingDetail id={id} />
    </div>
  );
}
