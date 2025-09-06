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
import { HTTPError } from "ky";

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

  const { mutate: editDepartment, isPending: isPendingEdit } = useMutation({
    mutationFn: putDepartment,
    onSuccess: () => {
      toast.success("Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
          toast.error(`Failed to update department: ${error.message}`);
        }
      } catch (_) {
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
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
        queryClient.invalidateQueries({ queryKey: ["departments"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["departments"] });
      }

      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to delete department: ${error.message}`);
    },
  });

  const handleCreate = () => {
    setSelectedDepartment(null);
    setEditModalOpen(true);
  };

  const handleEdit = (department: IDepartment) => {
    setSelectedDepartment(department);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (department: IDepartment) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: DepartmentFormValues) => {
    if (selectedDepartment) {
      editDepartment({ id: selectedDepartment.id, payload: data });
    } else {
      addDepartment(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      removeDepartment({ id: selectedDepartment.id });
    }
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  return {
    departments: paginatedData,
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
