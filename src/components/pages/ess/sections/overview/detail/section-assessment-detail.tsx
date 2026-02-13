import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFields } from "@/services/form";
import {
  getEmployeeSelfAssessmentDetail,
  submitEmployeeSelfAssessment,
} from "@/services/employees/self-assessment";
import { Loader2 } from "lucide-react";
import { SurveyAssessmentForm } from "./survey-assessment-form";
import { toast } from "sonner";
import { IMutateEmployeeSelfAssessmentRequest } from "@/services/employees/self-assessment/types";
import { ApiErrorResponse } from "@/lib/types";

interface SectionAssessmentDetailProps {
  assessmentId: string | number;
  formId?: number;
}

export const SectionAssessmentDetail: React.FC<
  SectionAssessmentDetailProps
> = ({ assessmentId, formId }) => {
  const router = useRouter();
  const { data: formDetail, isLoading: isLoadingForm } = useQuery({
    queryKey: ["form-detail", formId],
    queryFn: () => getFields({ form_id: formId! }),
    enabled: !!formId,
  });

  const { data: assessmentDetail, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ["assessment-detail", Number(assessmentId)],
    queryFn: () => getEmployeeSelfAssessmentDetail(Number(assessmentId)),
    enabled: !!assessmentId,
  });

  const { mutate: submitAssessment, isPending: isSubmitting } = useMutation({
    mutationFn: (data: IMutateEmployeeSelfAssessmentRequest) =>
      submitEmployeeSelfAssessment(Number(assessmentId), data),
    onSuccess: () => {
      toast.success("Assessment submitted successfully");
      router.push("/ess/assessment");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to submit assessment");
            })
            .catch(() => {
              toast.error("Failed to submit assessment: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to submit assessment: Server error");
        }
      } else {
        toast.error(
          `Failed to delete leave request: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  if (isLoadingForm || isLoadingAssessment) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 mx-auto space-y-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Self Assessment Form
        </h1>
        <p className="text-gray-500">Please fill out the form below.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 w-full">
        {formDetail?.data ? (
          <SurveyAssessmentForm
            fields={formDetail.data}
            onSubmit={submitAssessment}
            isSubmitting={isSubmitting}
            initialData={
              assessmentDetail?.data ? assessmentDetail.data[0] : undefined
            }
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            No fields found for this form.
          </div>
        )}
      </div>
    </div>
  );
};
