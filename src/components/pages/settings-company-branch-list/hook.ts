"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteBranch, getBranches } from "@/services/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCompanyBranchList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteModal, setIsDeleteModal] = React.useState(false);
  const [idBranch, setIdBranch] = React.useState("");
  const {
    data: branchesData,
    isLoading: loading,
    error,
    refetch: fetchBranches,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["company-branches"],
    queryFn: async () => {
      const response = await getBranches();
      return response.data ?? [];
    },
  });

  const mutateDeleteBranch = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branches"] });
      toast.success("Delete branch successfully.");
      setIsDeleteModal(true);
      router.push("/settings/company/company-branch");
    },
    onError: () => {
      toast.error("Failed to delete branch.");
    },
  });

  const branches = branchesData ?? [];

  const handleNew = () => {
    router.push("/settings/company/company-branch/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/settings/company/company-branch/edit/${id}`);
  };

  const handleDeleteBranch = () => {
    mutateDeleteBranch.mutate(idBranch);
  };

  const handleOpenDeleteModal = (id: string) => {
    setIsDeleteModal(true);
    setIdBranch(id);
  };

  return {
    branches,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Unexpected error"
      : null,
    fetchBranches,
    handleNew,
    handleEdit,
    isDeleteModal,
    setIsDeleteModal,
    isError,
    isSuccess,
    handleDeleteBranch,
    handleOpenDeleteModal,
    mutateDeleteBranch,
  };
}
