import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupervisorAssessmentDetail } from "@/services/performances/supervisor-assessment";

export const useSupervisorAssessmentDetails = (id: number) => {
  const {
    data: employeeDetails,
    isLoading: isLoadingEmployeeDetails,
    isError: isErrorEmployeeDetails,
  } = useQuery({
    queryKey: ["supervisor-assessment-detail", id],
    queryFn: () => getSupervisorAssessmentDetail(id),
    enabled: !!id,
  });

  return {
    employeeDetails,
    isLoadingEmployeeDetails,
    isErrorEmployeeDetails,
  };
};
