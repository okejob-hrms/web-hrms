"use client";

import { useRouter } from "next/navigation";
import { getRoles } from "@/services/settings";
import { IRole } from "@/services/settings/types";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { ApiPagination } from "@/lib/types";
import { useState } from "react";

export function useRoleManagement() {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: rolesResponse,
    isLoading: loading,
    error,
    refetch: fetchRoles,
  } = useQuery({
    queryKey: ["roles", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      getRoles({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  const roles: IRole[] = rolesResponse?.data ?? [];
  const apiPagination: ApiPagination | undefined = rolesResponse
    ? {
        current_page: rolesResponse.current_page,
        per_page: rolesResponse.per_page,
        total: rolesResponse.total,
        last_page: rolesResponse.last_page,
        from: rolesResponse.from ?? 0,
        to: rolesResponse.to ?? 0,
        first: rolesResponse.first_page_url,
        last: "",
        prev: rolesResponse.prev_page_url,
        next: rolesResponse.next_page_url,
      }
    : undefined;

  const handleNew = () => {
    router.push("/settings/access-control/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/settings/access-control/${id}`);
  };

  return {
    roles,
    apiPagination,
    pagination,
    setPagination,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Unexpected error"
      : null,
    fetchRoles,
    handleNew,
    handleEdit,
  };
}
