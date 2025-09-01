// hooks/useDepartmentManagement.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import { IDepartment } from "@/lib/types";
import {
  getJobLevelsPagination,
  postJobLevelManagement,
  putJobLevels,
  deleteJobLevels,
} from "@/services/job-levels";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";
import { IJobLevelForm } from "@/services/job-levels/types";

export function useJobLevels() {
  const queryClient = useQueryClient();

  // State for managing modals and the department being edited/deleted
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobLevel, setSelectedJobLevel] = useState<IDepartment | null>(
    null
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

  const { mutate: editJobLevel } = useMutation({
    mutationFn: putJobLevels,
    onSuccess: () => {
      toast.success("Job Level updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to update job level: ${error.message}`);
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

  // Handler to open the modal for creating
  const handleCreate = () => {
    setSelectedJobLevel(null);
    setEditModalOpen(true);
  };

  // Handler to open the modal for editing
  const handleEdit = (department: IDepartment) => {
    setSelectedJobLevel(department);
    setEditModalOpen(true);
  };

  // Handler to open the delete confirmation dialog
  const handleDeleteClick = (department: IDepartment) => {
    setSelectedJobLevel(department);
    setDeleteDialogOpen(true);
  };

  // Handler to save (either create or update)
  const handleSave = (data: IJobLevelForm) => {
    if (selectedJobLevel) {
      // It's an update
      editJobLevel({ id: selectedJobLevel.id, payload: data });
    } else {
      // It's a create
      addJobLevel({ name: data.name });
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
