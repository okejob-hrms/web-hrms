// hooks/useDepartmentManagement.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  getJobLevelsPagination,
  postJobLevelManagement,
  putJobLevels,
  deleteJobLevels,
} from "@/services/job-levels";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";
import { IJobLevelForm, JobLevel } from "@/services/job-levels/types";
import { HTTPError } from "ky";

export function useJobLevels() {
  const queryClient = useQueryClient();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobLevel, setSelectedJobLevel] = useState<JobLevel | null>(
    null,
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["job-levels", pagination],
    queryFn: () => getJobLevelsPagination(pagination),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = !!paginatedData?.next_page_url;
  const hasPreviousPage = !!paginatedData?.prev_page_url;

  const { mutate: addJobLevel, isPending: isPendingAdd } = useMutation({
    mutationFn: postJobLevelManagement,
    onSuccess: () => {
      toast.success("Job Level created successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to create job level: ${error.message}`);
    },
  });

  const { mutate: editJobLevel, isPending: isPendingEdit } = useMutation({
    mutationFn: putJobLevels,
    onSuccess: () => {
      toast.success("Job Level updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      handleClose();
    },
    onError: async (error) => {
      handleClose();
      try {
        if (error instanceof HTTPError) {
          const errorData = await error.response.json();
          const message =
            errorData.errors?.name?.[0] ||
            errorData.message ||
            "An unknown error occurred.";
          toast.error(message);
        } else {
          toast.error(`Failed to update job level: ${error.message}`);
        }
      } catch (_) {
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
    },
  });

  const { mutate: removeJobLevel, isPending: isPendingRemove } = useMutation({
    mutationFn: deleteJobLevels,
    onSuccess: () => {
      toast.success("Job Level deleted successfully!");
      const isLastItemOnPage = paginatedData?.data?.length === 1;
      const isNotFirstPage = pagination.pageIndex > 0;

      if (isLastItemOnPage && isNotFirstPage) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex - 1,
        }));
        queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      }

      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to delete job level: ${error.message}`);
    },
  });

  const handleCreate = () => {
    setSelectedJobLevel(null);
    setEditModalOpen(true);
  };

  const handleEdit = (jobLevel: JobLevel) => {
    setSelectedJobLevel(jobLevel);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (jobLevel: JobLevel) => {
    setSelectedJobLevel(jobLevel);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: IJobLevelForm) => {
    if (selectedJobLevel) {
      // It's an update
      editJobLevel({ id: selectedJobLevel.id, payload: data });
    } else {
      // It's a create
      addJobLevel({ name: data.name, level: data.level });
    }
  };

  // Handler to confirm deletion
  const handleDeleteConfirm = () => {
    if (selectedJobLevel) {
      removeJobLevel({ id: selectedJobLevel.id });
    }
  };

  // Handler to close all modals and reset state
  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedJobLevel(null);
  };

  return {
    job_levels: paginatedData,
    isLoading:
      isLoading ||
      isFetching ||
      isRefetching ||
      isPendingAdd ||
      isPendingEdit ||
      isPendingRemove,
    hasNextPage,
    hasPreviousPage,
    pagination,
    setPagination,
    isEditModalOpen,
    isDeleteDialogOpen,
    selectedJobLevel,
    setEditModalOpen,
    setDeleteDialogOpen,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
  };
}
