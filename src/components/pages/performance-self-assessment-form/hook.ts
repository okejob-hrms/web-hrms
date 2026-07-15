/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { getAllForm } from "@/services/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter, useParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  createSelfAssessment,
  getDetailSelfAssessment,
  updateSelfAssessment,
} from "@/services/employees/self-assessment";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

export interface Filters {
  search?: string;
}

export interface AssessmentFormItem {
  id: string;
  formId?: string;
  selectedParticipants: string[];
}

export const usePerformanceSelfAssessmentForm = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const form = useForm();
  const [assessmentForms, setAssessmentForms] = React.useState<
    AssessmentFormItem[]
  >([{ id: "1", selectedParticipants: [] }]);
  const [currentFormIndex, setCurrentFormIndex] = React.useState<number | null>(
    null,
  );

  const periodId = params?.period ? Number(params.period) : null;
  const isEditMode = periodId !== null;

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<Filters>({
    search: "",
  });

  const debouncedFilters = useDebounce(filters, 300);
  const queryParams = React.useMemo(
    () => ({
      ...debouncedFilters,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      status: "1",
    }),
    [debouncedFilters, pagination],
  );

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", queryParams],
    queryFn: () => getEmployees(queryParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["self-assessment-detail", periodId],
    queryFn: () => getDetailSelfAssessment(periodId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isEditMode,
  });

  const { data: assessmentForm } = useQuery({
    queryKey: ["assessment-form"],
    queryFn: () => getAllForm(),
  });

  const [isParticipantModalOpen, setIsParticipantModalOpen] =
    React.useState(false);

  const handleOpenParticipant = (index: number) => {
    setCurrentFormIndex(index);
    setIsParticipantModalOpen(true);
  };

  const handleCloseParticipant = () => {
    setIsParticipantModalOpen(false);
    setCurrentFormIndex(null);
  };

  const handleAddAssessmentForm = () => {
    setAssessmentForms((prev) => [
      ...prev,
      { id: `${prev.length + 1}`, selectedParticipants: [] },
    ]);
  };

  const handleDeleteAssessmentForm = (index: number) => {
    setAssessmentForms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpdateSelectedParticipants = (participantIds: string[]) => {
    if (currentFormIndex !== null) {
      setAssessmentForms((prev) =>
        prev.map((item, index) =>
          index === currentFormIndex
            ? { ...item, selectedParticipants: participantIds }
            : item,
        ),
      );
    }
  };

  const totalSelectedParticipants = React.useMemo(() => {
    const uniqueParticipants = new Set<string>();
    assessmentForms.forEach((form) => {
      form.selectedParticipants.forEach((id) => uniqueParticipants.add(id));
    });
    return uniqueParticipants.size;
  }, [assessmentForms]);

  const periodOptions = [
    { label: "Q1", value: "Q1" },
    { label: "Q2", value: "Q2" },
    { label: "Q3", value: "Q3" },
    { label: "Q4", value: "Q4" },
  ];

  const sendReminderOptions = React.useMemo(
    () => [
      { label: t("reminderOneWeekAfterStart"), value: "1_week_after_start" },
      { label: t("reminderOneDayBeforeEnd"), value: "1_days_before_end" },
      { label: t("reminderTwoDaysBeforeEnd"), value: "2_days_before_end" },
      { label: t("reminderFiveDaysBeforeEnd"), value: "5_days_before_end" },
      { label: t("reminderFiveDaysBefore"), value: "5_days_before" },
    ],
    [t],
  );

  const assessmentFormOptions = React.useMemo(() => {
    if (assessmentForm?.data) {
      return assessmentForm.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [assessmentForm?.data]);

  const handlePaginationChange = React.useCallback((updater: any) => {
    setPagination(updater);
  }, []);

  const handleSearchChange = React.useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination({ pageIndex: 0, pageSize: 10 }); // Reset to first page on search
  }, []);

  const { mutate: createAssessment, isPending: isPendingAddAssessment } =
    useMutation({
      mutationFn: createSelfAssessment,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["self-assessment-detail", periodId],
        });
        toast.success(t("selfAssessmentCreatedSuccess"));
        router.push("/performance/self-assessment");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(
                  errorData.message || t("selfAssessmentCreateFailed"),
                );
              })
              .catch(() => {
                toast.error(tCommon("saveFailed", { message: "Server error" }));
              });
          } catch {
            toast.error(tCommon("saveFailed", { message: "Server error" }));
          }
        } else {
          toast.error(
            tCommon("saveFailed", {
              message: error.message || "Unknown error",
            }),
          );
        }
      },
    });

  const { mutate: updateAssessment, isPending: isPendingUpdateAssessment } =
    useMutation({
      mutationFn: (params: any) => updateSelfAssessment(periodId!, params),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["self-assessment-detail", periodId],
        });
        toast.success(t("selfAssessmentUpdatedSuccess"));
        router.push("/performance/self-assessment");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(
                  errorData.message || t("selfAssessmentUpdateFailed"),
                );
              })
              .catch(() => {
                toast.error(tCommon("saveFailed", { message: "Server error" }));
              });
          } catch {
            toast.error(tCommon("saveFailed", { message: "Server error" }));
          }
        } else {
          toast.error(
            tCommon("saveFailed", {
              message: error.message || "Unknown error",
            }),
          );
        }
      },
    });

  React.useEffect(() => {
    if (!isEditMode || !details?.data) return;

    const assessment = details.data.assessment;
    const employees = details.data.employees ?? [];

    const parseAssessmentDate = (value: string) => {
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.toDate() : undefined;
    };

    const formGroups = employees.reduce((acc: any, employee: any) => {
      const formKey =
        employee.form_id != null
          ? `id:${employee.form_id}`
          : `name:${employee.form_name ?? ""}`;
      if (!acc[formKey]) {
        acc[formKey] = {
          formId:
            employee.form_id != null ? employee.form_id.toString() : null,
          formName: employee.form_name,
          participants: [],
        };
      }
      const participantId = (
        employee.user_id ?? employee.id
      )?.toString();
      if (participantId) {
        acc[formKey].participants.push(participantId);
      }
      return acc;
    }, {});

    const reconstructedForms = Object.values(formGroups).map(
      (data: any, index) => {
        let formId = data.formId || "";
        if (!formId && assessmentForm?.data && data.formName) {
          const matchingForm = assessmentForm.data.find(
            (f) => f.name === data.formName,
          );
          formId = matchingForm?.id.toString() || "";
        }

        return {
          id: `${index + 1}`,
          formId,
          selectedParticipants: data.participants,
        };
      },
    );

    if (reconstructedForms.length > 0) {
      setAssessmentForms(reconstructedForms);
    }

    const normalizedPeriod = assessment.assessment_period?.toUpperCase?.()
      ? assessment.assessment_period.toUpperCase()
      : assessment.assessment_period;
    const matchedPeriod = periodOptions.find(
      (p) => p.value === normalizedPeriod,
    );

    const formValues: Record<string, any> = {
      period: matchedPeriod
        ? matchedPeriod.value
        : assessment.assessment_period,
      year: assessment.year,
      start_date: parseAssessmentDate(assessment.start_date),
      end_date: parseAssessmentDate(assessment.end_date),
    };

    reconstructedForms.forEach((formItem) => {
      if (formItem.formId) {
        formValues[`assessment_form_${formItem.id}`] = formItem.formId;
      }
    });

    setTimeout(() => {
      form.reset(formValues);
    }, 0);
  }, [isEditMode, details, assessmentForm, form]);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const formValues = form.getValues();
      if (
        !formValues.period ||
        !formValues.year ||
        !formValues.start_date ||
        !formValues.end_date
      ) {
        toast.error(t("fillRequiredFields"));
        return;
      }
      const hasValidAssessmentForm = assessmentForms.some((item, index) => {
        const formId = formValues[`assessment_form_${item.id}`];
        return formId && item.selectedParticipants.length > 0;
      });

      if (!hasValidAssessmentForm) {
        toast.error(t("selectFormAndParticipants"));
        return;
      }

      const forms = assessmentForms
        .filter((item, index) => {
          const formId = formValues[`assessment_form_${item.id}`];
          return formId && item.selectedParticipants.length > 0;
        })
        .map((item) => ({
          form_id: parseInt(formValues[`assessment_form_${item.id}`]),
          users: item.selectedParticipants.map((id) => parseInt(id)),
        }));

      const payload = {
        assessment_period: formValues.period,
        year: formValues.year,
        start_date: dayjs(formValues.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(formValues.end_date).format("YYYY-MM-DD"),
        forms,
      };

      if (isEditMode) {
        updateAssessment(payload);
      } else {
        createAssessment(payload);
      }
      queryClient.invalidateQueries({ queryKey: ["self-assessments"] });
    },
    [form, assessmentForms, createAssessment, updateAssessment, isEditMode, t, queryClient],
  );

  const handleCancel = () => router.push("/performance/self-assessment");

  return {
    form,
    periodOptions,
    sendReminderOptions,
    assessmentFormOptions,
    isParticipantModalOpen,
    handleOpenParticipant,
    handleCloseParticipant,
    employeeList: employees?.data,
    isLoadingEmployees,
    pagination,
    handlePaginationChange,
    handleSearchChange,
    filters,
    assessmentForm,
    assessmentForms,
    handleAddAssessmentForm,
    handleDeleteAssessmentForm,
    handleUpdateSelectedParticipants,
    handleCancel,
    currentFormIndex,
    totalSelectedParticipants,
    totalEmployees: employees?.data.total,
    handleSubmit,
    isPendingAddAssessment: isPendingAddAssessment || isPendingUpdateAssessment,
    isEditMode,
    isLoadingDetails,
  };
};
