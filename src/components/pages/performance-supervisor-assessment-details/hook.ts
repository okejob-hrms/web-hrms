import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupervisorAssessmentDetail } from "@/services/performances/supervisor-assessment";
import { getFormById } from "@/services/form";

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

  const {
    data: forms,
    isLoading: isLoadingForms,
    isError: isErrorForms,
  } = useQuery({
    queryKey: ["form", employeeDetails?.data.form.id],
    queryFn: () => {
      if (!employeeDetails?.data.form.id) {
        throw new Error("Form ID not available");
      }
      return getFormById(employeeDetails?.data.form.id);
    },
    enabled: !!employeeDetails?.data.form.id,
  });

  React.useEffect(() => {
    console.log(forms?.data);
  }, [forms]);

  const groups = forms?.data?.groups;

  return {
    employeeDetails,
    isLoadingEmployeeDetails,
    isErrorEmployeeDetails,
    forms,
    isLoadingForms,
    isErrorForms,
    groups,
  };
};
