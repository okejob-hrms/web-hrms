"use client";
import * as React from "react";
import { EmployeeDetailsSection } from "@/components/pages/offboarding-details/sections/employee-details";
import AppSkeleton from "@/components/partials/app-skeleton";
import { getEmployeeDetailByUserId } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { SalaryAdjustmentForm } from "@/components/pages/offboarding-details/sections/salary-adjustment-form";
import { getDetailOffboarding } from "@/services/employees/offboardings";
import { useTranslations } from "next-intl";

export default function OffboardingSalaryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const t = useTranslations("offboarding");
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
    queryKey: ["employee-detail", offboardingDetails?.data?.user_id],
    queryFn: () =>
      getEmployeeDetailByUserId(offboardingDetails?.data?.user_id as number),
    enabled: !!offboardingDetails?.data?.user_id,
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
    return <div>{t("dataNotFound")}</div>;
  }

  return (
    <div className="font-sans min-h-screen space-y-4">
      <EmployeeDetailsSection
        offboardingDetails={offboardingDetails.data}
        employeeDetails={employeeDetails.data}
      />
      <SalaryAdjustmentForm offboarding_id={id} />
    </div>
  );
}
