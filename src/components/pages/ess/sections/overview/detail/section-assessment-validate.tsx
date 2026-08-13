"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFormById } from "@/services/form";
import {
  getEmployeeSelfAssessmentDetail,
  getEmployeeSelfAssessments,
  validateEmployeeSelfAssessment,
} from "@/services/employees/self-assessment";
import {
  IAssessmentSubmission,
  IMutateEmployeeSelfAssessmentRequest,
  ITeamMember,
} from "@/services/employees/self-assessment/types";
import { ApiErrorResponse } from "@/lib/types";
import { SurveyAssessmentForm } from "./survey-assessment-form";
import { flattenFormGroupsInTemplateOrder } from "@/lib/form-field-order";

interface SectionAssessmentValidateProps {
  memberEsaId: string | number;
  formId?: number;
}

function pickSubmission(
  submissions: IAssessmentSubmission[] | undefined,
  preferValidated: boolean,
): IAssessmentSubmission | undefined {
  if (!submissions?.length) return undefined;
  if (preferValidated) {
    return (
      [...submissions].reverse().find((s) => s.validated_for != null) ??
      undefined
    );
  }
  return submissions.find((s) => s.validated_for == null) ?? submissions[0];
}

export const SectionAssessmentValidate: React.FC<
  SectionAssessmentValidateProps
> = ({ memberEsaId, formId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");

  const { data: listData } = useQuery({
    queryKey: ["employee-self-assessment"],
    queryFn: () => getEmployeeSelfAssessments(),
    staleTime: 0,
  });

  const member = React.useMemo((): ITeamMember | undefined => {
    const rows = listData?.data ?? [];
    for (const row of rows) {
      const found = row.team_member?.find(
        (m) => m.id === Number(memberEsaId),
      );
      if (found) return found;
    }
    return undefined;
  }, [listData?.data, memberEsaId]);

  const resolvedFormId = formId ?? member?.form_id;

  const { data: formDetail, isLoading: isLoadingForm } = useQuery({
    queryKey: ["form-detail", resolvedFormId],
    queryFn: () => getFormById(resolvedFormId!),
    enabled: !!resolvedFormId,
    staleTime: 0,
  });

  const formFields = React.useMemo(
    () => flattenFormGroupsInTemplateOrder(formDetail?.data?.groups),
    [formDetail?.data?.groups],
  );

  const { data: assessmentDetail, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ["assessment-detail", Number(memberEsaId)],
    queryFn: () => getEmployeeSelfAssessmentDetail(Number(memberEsaId)),
    enabled: !!memberEsaId,
    staleTime: 0,
  });

  const isValidated =
    member?.status_label === "Validated" || !!member?.validated_at;

  const employeeSubmission = pickSubmission(assessmentDetail?.data, false);
  const validationSubmission = pickSubmission(assessmentDetail?.data, true);

  const { mutate: submitValidation, isPending: isSubmitting } = useMutation({
    mutationFn: (data: IMutateEmployeeSelfAssessmentRequest) =>
      validateEmployeeSelfAssessment(Number(memberEsaId), data),
    onSuccess: async () => {
      toast.success(t("validateAssessmentSuccess"));
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["employee-self-assessment"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["assessment-detail", Number(memberEsaId)],
        }),
      ]);
      router.push("/ess/assessment");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || t("validateAssessmentFailed"),
              );
            })
            .catch(() => {
              toast.error(t("validateAssessmentServerError"));
            });
        } catch {
          toast.error(t("validateAssessmentServerError"));
        }
      } else {
        toast.error(t("validateAssessmentFailed"));
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
          {t("assessmentValidation")}
        </h1>
        <p className="text-gray-500">{t("reviewAndValidateTeamMember")}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">{t("teamMember")}</p>
          <p className="font-medium">{member?.user_name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("position")}</p>
          <p className="font-medium">{member?.job_position_name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{tCommon("status")}</p>
          <p className="font-medium">{member?.status_label ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("department")}</p>
          <p className="font-medium">{member?.department_name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("jobLevel")}</p>
          <p className="font-medium">{member?.job_level_name ?? "-"}</p>
        </div>
      </div>

      {!formFields.length ? (
        <div className="text-center text-gray-500 py-8">{t("noFormFields")}</div>
      ) : (
        <Tabs defaultValue="self" className="w-full">
          <TabsList>
            <TabsTrigger value="self">{t("selfAssessment")}</TabsTrigger>
            <TabsTrigger value="validation">
              {t("assessmentValidation")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="self" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm border p-6 w-full">
              <SurveyAssessmentForm
                fields={formFields}
                mode="readonly"
                initialData={employeeSubmission}
              />
            </div>
          </TabsContent>
          <TabsContent value="validation" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm border p-6 w-full">
              {isValidated && (
                <p className="text-sm text-gray-500 mb-4">
                  {t("validationCompletedReadOnly")}
                </p>
              )}
              <SurveyAssessmentForm
                fields={formFields}
                mode={isValidated ? "readonly" : "validate"}
                initialData={
                  validationSubmission ??
                  (isValidated ? undefined : employeeSubmission)
                }
                onSubmit={isValidated ? undefined : submitValidation}
                isSubmitting={isSubmitting}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
