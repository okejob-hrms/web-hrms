import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeDetailByUserId } from "@/services/employees";

export const useSupervisorAssessmentDetails = (userId: number) => {
  const {
    data: employeeDetails,
    isLoading: isLoadingEmployeeDetails,
    isError: isErrorEmployeeDetails,
  } = useQuery({
    queryKey: ["employee-detail", userId],
    queryFn: () => getEmployeeDetailByUserId(userId),
    enabled: !!userId,
  });

  return {
    employeeDetails,
    isLoadingEmployeeDetails,
    isErrorEmployeeDetails,
  };
};
