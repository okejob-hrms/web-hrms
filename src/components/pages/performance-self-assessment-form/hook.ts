/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { getAllForm } from "@/services/form";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

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
  const form = useForm();
  const [assessmentForms, setAssessmentForms] = React.useState<
    AssessmentFormItem[]
  >([{ id: "1", selectedParticipants: [] }]);
  const [currentFormIndex, setCurrentFormIndex] = React.useState<number | null>(
    null,
  );

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

  React.useEffect(() => {
    console.log("assessment form", assessmentForms);
  }, [assessmentForms]);

  const totalSelectedParticipants = React.useMemo(() => {
    const uniqueParticipants = new Set<string>();
    assessmentForms.forEach((form) => {
      form.selectedParticipants.forEach((id) => uniqueParticipants.add(id));
    });
    return uniqueParticipants.size;
  }, [assessmentForms]);

  const periodOptions = [
    { label: "Q1", value: "q1" },
    { label: "Q2", value: "q2" },
    { label: "Q3", value: "q3" },
  ];

  const yearOptions = [
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
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

  const handleCancel = () => router.push("/performance/self-assessment");

  return {
    form,
    periodOptions,
    yearOptions,
    sendReminderOptions,
    assessmentFormOptions,
    isParticipantModalOpen,
    handleOpenParticipant,
    handleCloseParticipant,
    employeeList: employees?.data,
    isLoadingEmployees,
    pagination,
    handlePaginationChange,
    assessmentForm,
    assessmentForms,
    handleAddAssessmentForm,
    handleDeleteAssessmentForm,
    handleUpdateSelectedParticipants,
    handleCancel,
    currentFormIndex,
    totalSelectedParticipants,
    totalEmployees: employees?.data.total,
  };
};
