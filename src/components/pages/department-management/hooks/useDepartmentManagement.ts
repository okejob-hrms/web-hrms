// hooks/useDepartmentManagement.ts

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DepartmentFormValues } from "../types";
import { IDepartment } from "@/lib/types";
import {
  getDepartment,
  postDepartment,
  putDepartment,
  deleteDepartment,
} from "@/services/department"; // Adjust path as needed
import { toast } from "sonner"; // Using a toast library for feedback is recommended
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

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartment(),
    placeholderData: (prev) => prev,
  });

  // Calculate pageCount now that we have 'total'
  const pageCount = useMemo(() => {
    const total = paginatedData?.data?.to ?? 0;
    const pageSize = pagination.pageSize;
    return total > 0 ? Math.ceil(total / pageSize) : 0;
  }, [paginatedData?.data?.to, pagination.pageSize]);

  // MUTATION: Create a new department
  const { mutate: addDepartment } = useMutation({
    mutationFn: postDepartment,
    onSuccess: () => {
      toast.success("Department created successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create department: ${error.message}`);
    },
  });

  // MUTATION: Update an existing department
  const { mutate: editDepartment } = useMutation({
    mutationFn: putDepartment,
    onSuccess: () => {
      toast.success("Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to update department: ${error.message}`);
    },
  });

  // MUTATION: Delete a department
  const { mutate: removeDepartment } = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Department deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (error) => {
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
    isLoading,
    pageCount,
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
