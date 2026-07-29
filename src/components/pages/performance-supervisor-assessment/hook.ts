/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedAssessor = useDebounce(searchAssesssor, 300);
  const debouncedEmployee = useDebounce(searchEmployee, 300);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "supervisor-assessments",
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      getAllSupervisorAssessment({
        page: (pagination.pageIndex + 1).toString(),
        per_page: pagination.pageSize.toString(),
      }),
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["supervisor-assessment-employees", debouncedEmployee],
    queryFn: () =>
      getEmployees(
        debouncedEmployee
          ? { search: debouncedEmployee, per_page: 10000 }
          : { per_page: 10000 },
      ),
    enabled: openFormModal,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: assessors, isLoading: isLoadingAssessors } = useQuery({
    queryKey: ["supervisor-assessment-assessors", debouncedAssessor],
    queryFn: () =>
      getEmployees(
        debouncedAssessor
          ? { search: debouncedAssessor, per_page: 10000 }
          : { per_page: 10000 },
      ),
    enabled: openFormModal,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: positions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
    queryKey: ["job-position"],
    queryFn: getJobPosition,
    enabled: openFormModal,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: jobLevels,
    isLoading: isJobLevelsLoading,
    error: jobLevelsError,
  } = useQuery({
    queryKey: ["job-levels"],
    queryFn: getJobLevels,
    enabled: openFormModal,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: forms,
    isLoading: isLoadingForms,
    error: formsError,
  } = useQuery({
    queryKey: ["forms", { type: 2 }],
    queryFn: () => getAllForm({ type: 2 }),
    enabled: openFormModal,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.user_id.toString(),
        subtitle: item.job_position,
        image: item.photo_profile,
        profileId: item.id,
        department: item.department || "",
        jobPosition: item.job_position || "",
        jobLevel: item.job_level || "",
        jobLevelId: item.job_level_id,
      }));
    }
    return [];
  }, [employees?.data]);

  const assessorsOptions = React.useMemo(() => {
    if (assessors?.data?.data) {
      return assessors.data.data.map((item) => ({
        label: item.job_position
          ? `${item.name} (${item.job_position})`
          : item.name,
        value: item.user_id.toString(),
        subtitle: item.job_position,
        image: item.photo_profile,
        profileId: item.id,
      }));
    }
    return [];
  }, [assessors?.data]);

  const employeesByProfileId = React.useMemo(() => {
    const map = new Map<number, { userId: number; name: string }>();
    const list = employees?.data?.data ?? assessors?.data?.data ?? [];
    list.forEach((item) => {
      map.set(item.id, { userId: item.user_id, name: item.name });
    });
    // Prefer assessors list merge so manager lookup has better coverage
    assessors?.data?.data?.forEach((item) => {
      map.set(item.id, { userId: item.user_id, name: item.name });
    });
    employees?.data?.data?.forEach((item) => {
      map.set(item.id, { userId: item.user_id, name: item.name });
    });
    return map;
  }, [employees?.data?.data, assessors?.data?.data]);

  const positionOptions = React.useMemo(() => {
    if (positions?.data) {
      return positions.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [positions?.data]);

  const jobLevelsList = React.useMemo(() => {
    const raw = jobLevels?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).data)) return (raw as any).data;
    return [];
  }, [jobLevels]);

  const jobLevelOptions = React.useMemo(() => {
    return jobLevelsList.map((item: any) => ({
      label: item.name,
      value: item.id.toString(),
      level: Number(item.level) || 0,
    }));
  }, [jobLevelsList]);

  const formOptions = React.useMemo(() => {
    if (forms?.data) {
      return forms.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [forms?.data]);

  const createAssessmentMutation = useMutation({
    mutationFn: (params: ISupervisorAssessmentMutation) =>
      postAddSupervisorAssessment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assessments"] });
      toast.success("Supervisor assessment created successfully");
      setOpenFormModal(false);
    },
    onError: async (error: any) => {
      console.error("Mutation error:", error);
      let message = "Failed to create supervisor assessment";
      try {
        const errorData = await error?.response?.json?.();
        if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.errors) {
          const firstError = Object.values(errorData.errors).flat()[0];
          if (typeof firstError === "string") {
            message = firstError;
          }
        }
      } catch {
        // keep default message
      }
      toast.error(message);
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
    setOpenFormModal(true);
  };

  const handleView = (id: number | string) => {
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
    handleView,
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
    isSubmitting: createAssessmentMutation.isPending,
    pagination,
    setPagination,
    searchEmployee,
    setSearchEmployee,
    assessorsOptions,
    isLoadingAssessors,
    employeesByProfileId,
  };
}
