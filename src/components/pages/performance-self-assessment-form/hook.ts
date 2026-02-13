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
    queryFn: getAllForm,
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

  const sendReminderOptions = [
    { label: "1 Week After Start", value: "1_week_after_start" },
    { label: "1 Days Before End", value: "1_days_before_end" },
    { label: "2 Days Before End", value: "2_days_before_end" },
    { label: "5 Days Before End", value: "5_days_before_end" },
    { label: "5 Days Before", value: "5_days_before" },
  ];

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
        toast.success("Self-assessment created successfully!");
        router.push("/performance/self-assessment");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(
                  errorData.message || "Failed to create self-assessment",
                );
              })
              .catch(() => {
                toast.error("Failed to create self-assessment: Server error");
              });
          } catch (parseError) {
            toast.error("Failed to create self-assessment: Server error");
          }
        } else {
          toast.error(
            `Failed to create self-assessment: ${error.message || "Unknown error"}`,
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
        toast.success("Self-assessment updated successfully!");
        router.push("/performance/self-assessment");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(
                  errorData.message || "Failed to update self-assessment",
                );
              })
              .catch(() => {
                toast.error("Failed to updated self-assessment: Server error");
              });
          } catch (parseError) {
            toast.error("Failed to updated self-assessment: Server error");
          }
        } else {
          toast.error(
            `Failed to updated self-assessment: ${error.message || "Unknown error"}`,
          );
        }
      },
    });

  React.useEffect(() => {
    if (isEditMode && details?.data && assessmentForm?.data) {
      const assessment = details.data.assessment;
      const employees = details.data.employees;

      const formGroups = employees.reduce((acc: any, employee: any) => {
        const formName = employee.form_name;
        if (!acc[formName]) {
          acc[formName] = {
            formId: null,
            participants: [],
          };
        }
        acc[formName].participants.push(employee.id.toString());
        return acc;
      }, {});

      const reconstructedForms = Object.entries(formGroups).map(
        ([formName, data]: [string, any], index) => {
          const matchingForm = assessmentForm.data.find(
            (f) => f.name === formName,
          );
          const formId = matchingForm?.id.toString() || "";

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
      const normalizedPeriod = assessment.assessment_period.toUpperCase();
      const matchedPeriod = periodOptions.find(
        (p) => p.value === normalizedPeriod,
      );

      const formValues: Record<string, any> = {
        period: matchedPeriod
          ? matchedPeriod.value
          : assessment.assessment_period,
        year: assessment.year,
        start_date: assessment.start_date,
        end_date: assessment.end_date,
      };

      reconstructedForms.forEach((formItem, index) => {
        if (formItem.formId) {
          formValues[`assessment_form_${formItem.id}`] = formItem.formId;
        }
      });

      setTimeout(() => {
        form.reset(formValues);
      }, 0);
    }
  }, [isEditMode, details, assessmentForm]);

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
        toast.error("Please fill in all required fields");
        return;
      }
      const hasValidAssessmentForm = assessmentForms.some((item, index) => {
        const formId = formValues[`assessment_form_${item.id}`];
        return formId && item.selectedParticipants.length > 0;
      });

      if (!hasValidAssessmentForm) {
        toast.error(
          "Please select at least one assessment form and assign participants",
        );
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
        start_date: formValues.start_date,
        end_date: formValues.end_date,
        forms,
      };

      if (isEditMode) {
        updateAssessment(payload);
      } else {
        createAssessment(payload);
      }
      queryClient.invalidateQueries({ queryKey: ["self-assessments"] });
    },
    [form, assessmentForms, createAssessment, updateAssessment, isEditMode],
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
