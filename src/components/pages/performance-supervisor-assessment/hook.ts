/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteSupervisorAssessment,
  getAllSupervisorAssessment,
  postAddSupervisorAssessment,
} from "@/services/performances/supervisor-assessment";
import { ISupervisorAssessmentMutation } from "@/services/performances/supervisor-assessment/types";
import { getEmployees } from "@/services/employees";
import { getJobPosition } from "@/services/job-position";
import { getJobLevels } from "@/services/job-levels";
import { getAllForm } from "@/services/form";
import { useDebounce } from "@/hooks/use-debounce";

export function useSupervisorAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [searchAssesssor, setSearchAssesssor] = React.useState("");

  const debouncedAssessor = useDebounce(searchAssesssor, 300);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["supervisor-assessments"],
    queryFn: () => getAllSupervisorAssessment(),
  });

  // Fetch employees for select options
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["supervisor-assessment-employees", debouncedAssessor],
    queryFn: () =>
      getEmployees(
        debouncedAssessor
          ? { search: debouncedAssessor, per_page: 10000 }
          : { per_page: 10000 },
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch positions
  const {
    data: positions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
    queryKey: ["job-position"],
    queryFn: getJobPosition,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch job levels
  const {
    data: jobLevels,
    isLoading: isJobLevelsLoading,
    error: jobLevelsError,
  } = useQuery({
    queryKey: ["job-levels"],
    queryFn: getJobLevels,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch forms
  const {
    data: forms,
    isLoading: isLoadingForms,
    error: formsError,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: getAllForm,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Transform data to options
  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.user_id.toString(),
        subtitle: item.job_position,
        image: item.photo_profile,
      }));
    }
    return [];
  }, [employees?.data]);

  const positionOptions = React.useMemo(() => {
    if (positions?.data) {
      return positions.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [positions?.data]);

  const jobLevelOptions = React.useMemo(() => {
    if (jobLevels?.data) {
      return jobLevels.data.map((item: any) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobLevels]);

  const formOptions = React.useMemo(() => {
    if (forms?.data) {
      return forms.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [forms?.data]);

  // Mutation for creating new assessment
  const createAssessmentMutation = useMutation({
    mutationFn: (params: ISupervisorAssessmentMutation) =>
      postAddSupervisorAssessment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assessments"] });
      toast.success("Supervisor assessment created successfully");
      setOpenFormModal(false);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error("Failed to create supervisor assessment");
    },
  });

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteSupervisorAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assessments"] });
      toast.success("Success delete supervisor assessment");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete supervisor assessment");
    },
  });

  const handleNew = () => {
    router.push("/performance/supervisor-assessment/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/performance/supervisor-assessment/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeForm(Number(selectedId));
  };

  const handleFormSubmit = (data: ISupervisorAssessmentMutation) => {
    createAssessmentMutation.mutate(data);
  };

  return {
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
    openFormModal,
    setOpenFormModal,
    handleFormSubmit,
    data,
    isLoading,
    isFetching,
    // Options for form selects
    employeesOptions,
    positionOptions,
    isPositionsLoading,
    positionsError,
    jobLevelOptions,
    isJobLevelsLoading,
    jobLevelsError,
    formOptions,
    isLoadingForms,
    formsError,
    isLoadingEmployees,
    searchAssesssor,
    setSearchAssesssor,
    // Mutation states
    isSubmitting: createAssessmentMutation.isPending,
  };
}
