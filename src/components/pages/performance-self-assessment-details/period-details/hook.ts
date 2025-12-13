import {
  getDetailSelfAssessment,
  updateSelfAssessment,
} from "@/services/employees/self-assessment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useSelfAssessmentPeriodDetails = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    number | null
  >(null);

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

  const forms = assessmentDetails?.data.employees.map(
    (employee) => employee.form_name,
  );

  const { mutate: updateAssessment } = useMutation({
    mutationFn: (params: any) => updateSelfAssessment(id!, params),
    onSuccess: () => {
      toast.success("Employee deleted successfully!");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["self-assessment-detail", id],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete employee");
    },
  });

  const handleViewEmployee = (employeeId: number) => {
    router.push(`/performance/self-assessment/${id}/${employeeId}`);
  };

  const handleEdit = () => {
    router.push(`/performance/self-assessment/${id}/edit`);
  };

  const handleDelete = (employeeId: number) => {
    updateAssessment({
      employee_id: employeeId,
      status: "Deleted",
    });
  };

  const handleDeleteModalOpen = (employeeId: number) => {
    setIsDeleteModalOpen(true);
  };

  return {
    assessmentDetails: assessmentDetails?.data,
    isLoading,
    isError,
    error,
    handleViewEmployee,
    handleEdit,
    handleDelete,
    handleDeleteModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedEmployeeId,
    setSelectedEmployeeId,
  };
};
