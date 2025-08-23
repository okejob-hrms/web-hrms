// hooks/useDepartmentManagement.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { DepartmentFormValues } from "../types";
import { IDepartment } from "@/lib/types";
import {
  getDepartment,
  postDepartment,
  putDepartment,
  deleteDepartment,
} from "@/services/department";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";

export function useDepartmentManagement() {
  const queryClient = useQueryClient();

  // State for managing modals and the department being edited/deleted
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartment | null>(null);

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
    queryKey: ["departments", pagination],
    queryFn: () => getDepartment(pagination),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const { mutate: addDepartment, isPending: isPendingAdd } = useMutation({
    mutationFn: postDepartment,
    onSuccess: () => {
      toast.success("Department created successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to create department: ${error.message}`);
    },
  });

  const { mutate: editDepartment } = useMutation({
    mutationFn: putDepartment,
    onSuccess: () => {
      toast.success("Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to update department: ${error.message}`);
    },
  });

  const { mutate: removeDepartment, isPending: isPendingRemove } = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Department deleted successfully!");
      const isLastItemOnPage = paginatedData?.data?.data?.length === 1;
      const isNotFirstPage = pagination.pageIndex > 0;

      if (isLastItemOnPage && isNotFirstPage) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex - 1,
        }));
      } else {
        queryClient.invalidateQueries({ queryKey: ["departements"] });
      }

      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to delete department: ${error.message}`);
    },
  });

  // Handler to open the modal for creating
  const handleCreate = () => {
    setSelectedDepartment(null);
    setEditModalOpen(true);
  };

  // Handler to open the modal for editing
  const handleEdit = (department: IDepartment) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  // Handler to open the delete confirmation dialog
  const handleDeleteClick = (department: IDepartment) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  // Handler to save (either create or update)
  const handleSave = (data: DepartmentFormValues) => {
    if (selectedDepartment) {
      // It's an update
      editDepartment({ id: selectedDepartment.id, payload: data });
    } else {
      // It's a create
      addDepartment(data);
    }
  };

  // Handler to confirm deletion
  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      removeDepartment({ id: selectedDepartment.id });
    }
  };

  // Handler to close all modals and reset state
  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  return {
    departments: paginatedData?.data?.data ?? [],
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
    selectedDepartment,
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
