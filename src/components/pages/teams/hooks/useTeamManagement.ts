// hooks/useTeamManagement.ts

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamsFormValues } from "../types";
import { ITeam } from "@/lib/types";
import { getTeam, postTeam, putTeam, deleteTeam } from "@/services/team"; // Adjust path as needed
import { toast } from "sonner"; // Using a toast library for feedback is recommended
import { PaginationState } from "@tanstack/react-table";

export function useTeamManagement() {
  const queryClient = useQueryClient();

  // State for managing modals and the team being edited/deleted
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedteam, setSelectedteam] = useState<ITeam | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeam(),
    placeholderData: (prev) => prev,
  });

  // Calculate pageCount now that we have 'total'
  const pageCount = useMemo(() => {
    const total = paginatedData?.data?.to ?? 0;
    const pageSize = pagination.pageSize;
    return total > 0 ? Math.ceil(total / pageSize) : 0;
  }, [paginatedData?.data?.to, pagination.pageSize]);

  // MUTATION: Create a new team
  const { mutate: addTeam } = useMutation({
    mutationFn: postTeam,
    onSuccess: () => {
      toast.success("Team created successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create team: ${error.message}`);
    },
  });

  // MUTATION: Update an existing team
  const { mutate: editTeam } = useMutation({
    mutationFn: putTeam,
    onSuccess: () => {
      toast.success("team updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to update team: ${error.message}`);
    },
  });

  // MUTATION: Delete a team
  const { mutate: removeTeam } = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      toast.success("team deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to delete team: ${error.message}`);
    },
  });

  // Handler to open the modal for creating
  const handleCreate = () => {
    setSelectedteam(null);
    setEditModalOpen(true);
  };

  // Handler to open the modal for editing
  const handleEdit = (team: ITeam) => {
    setSelectedteam(team);
    setEditModalOpen(true);
  };

  // Handler to open the delete confirmation dialog
  const handleDeleteClick = (team: ITeam) => {
    setSelectedteam(team);
    setDeleteDialogOpen(true);
  };

  // Handler to save (either create or update)
  const handleSave = (data: TeamsFormValues) => {
    if (selectedteam) {
      // It's an update
      editTeam({ id: selectedteam.id, payload: data });
    } else {
      // It's a create
      addTeam(data);
    }
  };

  // Handler to confirm deletion
  const handleDeleteConfirm = () => {
    if (selectedteam) {
      removeTeam({ id: selectedteam.id });
    }
  };

  // Handler to close all modals and reset state
  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedteam(null);
  };

  return {
    teams: paginatedData?.data?.data ?? [],
    isLoading,
    pageCount,
    pagination,
    setPagination,
    isEditModalOpen,
    isDeleteDialogOpen,
    selectedteam,
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
