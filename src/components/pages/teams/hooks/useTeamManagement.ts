// hooks/useTeamManagement.ts

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { TeamsFormValues } from "../types";
import { ITeam } from "@/lib/types";
import { getTeam, postTeam, putTeam, deleteTeam } from "@/services/team";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";

export function useTeamManagement() {
  const queryClient = useQueryClient();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedteam, setSelectedteam] = useState<ITeam | null>(null);

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
    queryKey: ["teams", pagination],
    queryFn: () => getTeam(pagination),
    placeholderData: keepPreviousData,
  });
  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const { mutate: addTeam, isPending: isPendingAdd } = useMutation({
    mutationFn: postTeam,
    onSuccess: () => {
      toast.success("Team created successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to create team: ${error.message}`);
    },
  });

  const { mutate: editTeam } = useMutation({
    mutationFn: putTeam,
    onSuccess: () => {
      toast.success("team updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to update team: ${error.message}`);
    },
  });

  const { mutate: removeTeam, isPending: isPendingRemove } = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      toast.success("Team deleted successfully!");

      const isLastItemOnPage = paginatedData?.data?.data?.length === 1;
      const isNotFirstPage = pagination.pageIndex > 0;

      if (isLastItemOnPage && isNotFirstPage) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex - 1,
        }));
      } else {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      }

      handleClose();
    },
    onError: (error) => {
      handleClose();
      toast.error(`Failed to delete team: ${error.message}`);
    },
  });

  const handleCreate = () => {
    setSelectedteam(null);
    setEditModalOpen(true);
  };

  const handleEdit = (team: ITeam) => {
    setSelectedteam(team);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (team: ITeam) => {
    setSelectedteam(team);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: TeamsFormValues) => {
    if (selectedteam) {
      editTeam({ id: selectedteam.id, payload: data });
    } else {
      addTeam(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedteam) {
      removeTeam({ id: selectedteam.id });
    }
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedteam(null);
  };

  return {
    teams: paginatedData?.data?.data ?? [],
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
