import { getDetailSelfAssessment } from "@/services/employees/self-assessment";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import * as React from "react";
import { useRouter } from "next/navigation";

export const useSelfAssessmentPeriodDetails = () => {
  const params = useParams();
  const router = useRouter();

  const id = React.useMemo(() => {
    const periodParam = params?.period;
    if (periodParam && !isNaN(Number(periodParam))) {
      return Number(periodParam);
    }
    return null;
  }, [params]);

  const {
    data: assessmentDetails,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["self-assessment-detail", id],
    queryFn: () => getDetailSelfAssessment(id!),
    enabled: !!id,
  });

  const handleViewEmployee = (employeeId: number) => {
    router.push(`/performance/self-assessment/${id}/${employeeId}`);
  };

  return {
    assessmentDetails: assessmentDetails?.data,
    isLoading,
    isError,
    error,
    handleViewEmployee,
  };
};
