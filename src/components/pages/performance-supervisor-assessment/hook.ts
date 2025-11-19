/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteForm, getAllForm } from "@/services/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { getJobPositionPagination } from "@/services/job-position";
import { getJobLevelsPagination } from "@/services/job-levels";

export function useSupervisorAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [searchAssesssor, setSearchAssesssor] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [searchApprover, setSearchApprover] = React.useState("");
  const debouncedApprover = useDebounce(searchApprover, 300);

  const {
    data: forms,
    isLoading: isLoadingForms,
    error: formsError,
  } = useQuery({
    queryKey: ["assessment-forms"],
    queryFn: getAllForm,
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["offboarding-employees", debouncedApprover],
    queryFn: () =>
      getEmployees(
        debouncedApprover
          ? { search: debouncedApprover, per_page: 10000 }
          : { per_page: 10000 },
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: positions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
    queryKey: ["job_position_id"],
    queryFn: () =>
      getJobPositionPagination({
        pageSize: 10000,
        pageIndex: 0,
      }),
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: jobLevels,
    isLoading: isJobLevelsLoading,
    error: jobLevelsError,
  } = useQuery({
    queryKey: ["job_level_id"],
    queryFn: () =>
      getJobLevelsPagination({
        pageSize: 10000,
        pageIndex: 0,
      }),
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-assessments"] });
      toast.success("Success delete self assessment");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete self assessment");
    },
  });

  const handleNew = () => {
    router.push("/performance/self-assessment/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/performance/self-assessment/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeForm(Number(selectedId));
  };

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

  const formOptions = React.useMemo(() => {
    if (forms?.data) {
      return forms.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [forms?.data]);

  const jobLevelOptions = React.useMemo(() => {
    if (jobLevels?.data) {
      return jobLevels.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobLevels?.data]);

  const handleFormSubmit = (data: any) => {
    console.log(data);
  };

  return {
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
    employeesOptions,
    isLoadingEmployees,
    positionOptions,
    isPositionsLoading,
    positionsError,
    jobLevelOptions,
    isJobLevelsLoading,
    jobLevelsError,
    searchAssesssor,
    setSearchAssesssor,
    formOptions,
    isLoadingForms,
    formsError,
    openFormModal,
    setOpenFormModal,
    handleFormSubmit,
  };
}
