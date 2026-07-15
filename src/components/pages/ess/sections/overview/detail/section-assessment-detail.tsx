import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getFields } from "@/services/form";
import {
  getEmployeeSelfAssessmentDetail,
  getEmployeeSelfAssessments,
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
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");

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

  const { data: listData } = useQuery({
    queryKey: ["employee-self-assessment"],
    queryFn: () => getEmployeeSelfAssessments(),
  });

  const ownStatus = React.useMemo(() => {
    return listData?.data?.find((row) => row.id === Number(assessmentId))
      ?.status;
  }, [listData?.data, assessmentId]);

  const isReadOnly =
    ownStatus === "Completed" || ownStatus === "Validated";

  const employeeSubmission = React.useMemo(() => {
    const submissions = assessmentDetail?.data;
    if (!submissions?.length) return undefined;
    return (
      submissions.find((s) => s.validated_for == null) ?? submissions[0]
    );
  }, [assessmentDetail?.data]);

  const { mutate: submitAssessment, isPending: isSubmitting } = useMutation({
    mutationFn: (data: IMutateEmployeeSelfAssessmentRequest) =>
      submitEmployeeSelfAssessment(Number(assessmentId), data),
    onSuccess: () => {
      toast.success(t("submitAssessmentSuccess"));
      router.push("/ess/assessment");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || t("submitAssessmentFailed"),
              );
            })
            .catch(() => {
              toast.error(t("submitAssessmentServerError"));
            });
        } catch {
          toast.error(t("submitAssessmentServerError"));
        }
      } else {
        toast.error(t("submitAssessmentFailed"));
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
          {t("employeeSelfAssessmentForm")}
        </h1>
        <p className="text-gray-500">
          {isReadOnly ? t("assessmentReadOnly") : t("fillFormBelow")}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 w-full">
        {formDetail?.data ? (
          <SurveyAssessmentForm
            fields={formDetail.data}
            onSubmit={isReadOnly ? undefined : submitAssessment}
            isSubmitting={isSubmitting}
            initialData={employeeSubmission}
            mode={isReadOnly ? "readonly" : "submit"}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            {t("noFormFields")}
          </div>
        )}
      </div>
    </div>
  );
};
