import { getDetailEmployeeAssessment } from "@/services/employees/self-assessment";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import * as React from "react";

export const useSelfAssessmentEmployeeDetails = () => {
  const pathname = usePathname();

  const id = React.useMemo(() => {
    const segments = pathname.split("/");
    const idSegment = segments[segments.length - 1];
    return idSegment && !isNaN(Number(idSegment)) ? Number(idSegment) : null;
  }, [pathname]);

  const {
    data: employeeDetails,
    isLoading: isLoadingEmployeeDetails,
    isError: isErrorEmployeeDetails,
  } = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => getDetailEmployeeAssessment(id!),
    enabled: !!id,
  });

  return {
    employeeDetails,
    isLoadingEmployeeDetails,
    isErrorEmployeeDetails,
  };
};
