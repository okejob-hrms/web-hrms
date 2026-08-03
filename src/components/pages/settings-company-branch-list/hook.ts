"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteBranch, getBranches } from "@/services/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";
import { ApiPagination } from "@/lib/types";

export function useCompanyBranchList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteModal, setIsDeleteModal] = React.useState(false);
  const [idBranch, setIdBranch] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: branchesResponse,
    isLoading: loading,
    error,
    refetch: fetchBranches,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["company-branches", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      getBranches({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }),
    placeholderData: (previousData) => previousData,
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

  const branches = branchesResponse?.data ?? [];
  const apiPagination: ApiPagination | undefined =
    branchesResponse?.pagination;

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
    apiPagination,
    pagination,
    setPagination,
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
