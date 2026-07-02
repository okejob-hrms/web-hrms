/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSupervisorAssessment,
  getSupervisorAssessmentDetail,
  updateAssessmentStatus,
} from "@/services/performances/supervisor-assessment";
import { getFormById } from "@/services/form";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

export const useSupervisorAssessmentDetails = (id: number) => {
  const [openCancelModal, setOpenCancelModal] = React.useState(false);
  const [openCompleteModal, setOpenCompleteModal] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const groups = forms?.data?.groups;
  const finalScore = employeeDetails?.data?.final_submission?.data.final_score;
  const finalSubmission = employeeDetails?.data?.final_submission;

  const mutateCancelAssessment = useMutation({
    mutationFn: () => deleteSupervisorAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assessments"] });
      toast.success("Supervisor assessment cancelled successfully");
      setOpenCancelModal(false);
      router.push("/performance/supervisor-assessment");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message ||
                  "Failed to cancel supervisor assessment.",
              );
            })
            .catch(() => {
              toast.error("Failed to cancel supervisor assessment: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to cancel supervisor assessment: Server error");
        }
      } else {
        toast.error(
          `Failed to cancel supervisor assessment: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const onCancelAssessment = () => {
    mutateCancelAssessment.mutate();
  };

  const mutateCompleteAssessment = useMutation({
    mutationFn: (status: number) => updateAssessmentStatus(id, status),
    onSuccess: () => {
      toast.success("Assessment process completed successfully");
      setOpenCompleteModal(false);
      router.push("/performance/supervisor-assessment");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || "Failed to submit assessment process.",
              );
            })
            .catch(() => {
              toast.error("Failed to submit assessment process: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to submit assessment process: Server error");
        }
      } else {
        toast.error(
          `Failed to submit assessment process: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const onCompleteAssessment = (status: number) => {
    mutateCompleteAssessment.mutate(status);
    setOpenCompleteModal(false);
  };

  return {
    employeeDetails,
    isLoadingEmployeeDetails,
    isErrorEmployeeDetails,
    forms,
    isLoadingForms,
    isErrorForms,
    groups,
    finalScore,
    finalSubmission,
    openCancelModal,
    setOpenCancelModal,
    onCancelAssessment,
    isCancellingAssessment: mutateCancelAssessment.isPending,
    openCompleteModal,
    setOpenCompleteModal,
    onCompleteAssessment,
  };
};
