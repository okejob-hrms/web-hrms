import {
  exportSelfAssessmentExcel,
  getDetailSelfAssessment,
  updateSelfAssessment,
} from "@/services/employees/self-assessment";
import {
  IEmployeeAssessment,
  IFormAssignment,
  IMutateSelfAssessmentRequest,
} from "@/services/employees/self-assessment/types";
import { ApiErrorResponse } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import * as React from "react";
import { toast } from "sonner";

const SUBMITTED_STATUSES = new Set(["completed", "validated"]);

function buildRemainingFormAssignments(
  employees: IEmployeeAssessment[],
  assignmentIdToRemove: number,
): IFormAssignment[] | { error: string } {
  const target = employees.find(
    (employee) => employee.id === assignmentIdToRemove,
  );
  if (!target) {
    return { error: "Employee assignment not found" };
  }

  const status = (target.submission_status ?? "").toLowerCase();
  if (SUBMITTED_STATUSES.has(status)) {
    return { error: "Cannot delete an employee who has already submitted." };
  }

  const remaining = employees.filter(
    (employee) => employee.id !== assignmentIdToRemove,
  );
  const incompleteRemaining = remaining.filter(
    (employee) => employee.form_id == null || employee.user_id == null,
  );
  if (incompleteRemaining.length > 0) {
    return {
      error: "Cannot delete because some remaining assignments are incomplete.",
    };
  }

  const formMap = new Map<number, number[]>();

  for (const employee of remaining) {
    const users = formMap.get(employee.form_id) ?? [];
    users.push(employee.user_id);
    formMap.set(employee.form_id, users);
  }

  const forms: IFormAssignment[] = Array.from(formMap.entries()).map(
    ([form_id, users]) => ({ form_id, users }),
  );

  if (forms.length === 0) {
    return { error: "Cannot delete the last assigned employee." };
  }

  return forms;
}

function showDeleteError(error: unknown, fallback: string) {
  const err = error as {
    response?: { json: () => Promise<ApiErrorResponse> };
    message?: string;
  };

  if (err?.response) {
    err.response
      .json()
      .then((errorData) => {
        toast.error(errorData.message || fallback);
      })
      .catch(() => {
        toast.error(fallback);
      });
    return;
  }

  toast.error(err?.message || fallback);
}

export const useSelfAssessmentPeriodDetails = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    number | null
  >(null);
  const [isExporting, setIsExporting] = React.useState(false);

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

  const { mutate: updateAssessment, isPending: isDeleting } = useMutation({
    mutationFn: (payload: IMutateSelfAssessmentRequest) =>
      updateSelfAssessment(id!, payload),
    onSuccess: () => {
      toast.success("Employee deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedEmployeeId(null);
      queryClient.invalidateQueries({
        queryKey: ["self-assessment-detail", id],
      });
    },
    onError: (mutationError: unknown) => {
      showDeleteError(mutationError, "Failed to delete employee");
    },
  });

  const handleViewEmployee = (employeeId: number) => {
    router.push(`/performance/self-assessment/${id}/${employeeId}`);
  };

  const handleEdit = () => {
    router.push(`/performance/self-assessment/${id}/edit`);
  };

  const handleExport = React.useCallback(async () => {
    if (!id || isExporting) {
      return;
    }

    const detail = assessmentDetails?.data;
    setIsExporting(true);
    try {
      const blob = await exportSelfAssessmentExcel(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const period = detail?.assessment.assessment_period ?? "period";
      const year = detail?.assessment.year ?? "year";
      a.download = `self-assessment-${period}-${year}-${id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Self assessment exported successfully");
    } catch (exportError: unknown) {
      const message =
        exportError instanceof Error && exportError.message
          ? exportError.message
          : "Failed to export self assessment";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, [assessmentDetails?.data, id, isExporting]);

  const handleDelete = (assignmentId: number) => {
    if (isDeleting) return;

    const detail = assessmentDetails?.data;
    if (!detail) {
      toast.error("Assessment details are not available");
      return;
    }

    const forms = buildRemainingFormAssignments(detail.employees, assignmentId);
    if (!Array.isArray(forms)) {
      toast.error(forms.error);
      return;
    }

    const startDate = dayjs(detail.assessment.start_date);
    const endDate = dayjs(detail.assessment.end_date);
    if (!startDate.isValid() || !endDate.isValid()) {
      toast.error("Assessment dates are invalid");
      return;
    }

    const payload: IMutateSelfAssessmentRequest = {
      assessment_period: detail.assessment.assessment_period,
      year: detail.assessment.year,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
      forms,
    };

    updateAssessment(payload);
  };

  const handleDeleteModalOpen = (employeeId: number) => {
    if (isDeleting) return;
    setSelectedEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalChange = (open: boolean) => {
    if (!open && isDeleting) return;
    setIsDeleteModalOpen(open);
    if (!open) {
      setSelectedEmployeeId(null);
    }
  };

  return {
    assessmentDetails: assessmentDetails?.data,
    isLoading,
    isError,
    error,
    handleViewEmployee,
    handleEdit,
    handleExport,
    isExporting,
    handleDelete,
    handleDeleteModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen: handleDeleteModalChange,
    selectedEmployeeId,
    setSelectedEmployeeId,
    isDeleting,
  };
};
