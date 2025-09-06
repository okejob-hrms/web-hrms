// hooks/usejobPositionManagement.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  getJobPositionPagination,
  postJobPositionManagement,
  putJobPositions,
  deleteJobPositions,
} from "@/services/job-position";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";
import {
  IPositionForm,
  JobPositionResponse,
} from "@/services/job-position/types";
import { HTTPError } from "ky";

export function useJobPositions() {
  const queryClient = useQueryClient();

  // State for managing modals and the jobPosition being edited/deleted
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobPosition, setSelectedJobPosition] =
    useState<JobPositionResponse | null>(null);

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
    queryKey: ["job-positions", pagination],
    queryFn: () => getJobPositionPagination(pagination),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = !!paginatedData?.next_page_url;
  const hasPreviousPage = !!paginatedData?.prev_page_url;

  const { mutate: addJobPosition, isPending: isPendingAdd } = useMutation({
    mutationFn: postJobPositionManagement,
    onSuccess: () => {
      toast.success("Job Position created successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-positions"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to create job position: ${error.message}`);
    },
  });

  const { mutate: editJobPosition, isPending: isPendingEdit } = useMutation({
    mutationFn: putJobPositions,
    onSuccess: () => {
      toast.success("Job position updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-positions"] });
      handleClose();
    },
    onError: async (error) => {
      handleClose();
      try {
        if (error instanceof HTTPError) {
          const errorData = await error.response.json();
          const message =
            errorData.errors?.name?.[0] ||
            errorData.errors?.status?.[0] ||
            errorData.message ||
            "An unknown error occurred.";
          toast.error(message);
        } else {
          toast.error(`Failed to update job position: ${error.message}`);
        }
      } catch (_) {
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
    },
  });

  const { mutate: removeJobPosition, isPending: isPendingRemove } = useMutation(
    {
      mutationFn: deleteJobPositions,
      onSuccess: () => {
        toast.success("Job position deleted successfully!");
        const isLastItemOnPage = paginatedData?.data?.length === 1;
        const isNotFirstPage = pagination.pageIndex > 0;

        if (isLastItemOnPage && isNotFirstPage) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: prev.pageIndex - 1,
          }));
          queryClient.invalidateQueries({ queryKey: ["job-positions"] });
        } else {
          queryClient.invalidateQueries({ queryKey: ["job-positions"] });
        }

        handleClose();
      },
      onError: (error) => {
        handleClose();
        toast.error(`Failed to delete job position: ${error.message}`);
      },
    }
  );

  const handleCreate = () => {
    setSelectedJobPosition(null);
    setEditModalOpen(true);
  };

  const handleEdit = (jobPosition: JobPositionResponse) => {
    setSelectedJobPosition(jobPosition);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (jobPosition: JobPositionResponse) => {
    setSelectedJobPosition(jobPosition);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: IPositionForm) => {
    if (selectedJobPosition) {
      editJobPosition({ id: selectedJobPosition.id, payload: data });
    } else {
      addJobPosition({ name: data.name, status: data.status });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedJobPosition) {
      removeJobPosition({ id: selectedJobPosition.id });
    }
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedJobPosition(null);
  };

  return {
    job_positions: paginatedData,
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
    selectedJobPosition,
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
