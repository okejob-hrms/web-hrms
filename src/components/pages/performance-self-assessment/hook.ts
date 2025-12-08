/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSelfAssessments } from "@/services/employees/self-assessment";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import { IKPI } from "@/services/performances/kpi/types";

interface Filters {
  date: string;
  search: string;
  status?: number;
}

export function useSelfAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState<Filters>({
    date: "",
    search: "",
    status: undefined,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["self-assessments", pagination, filters],
    queryFn: () => getSelfAssessments(pagination, filters),
    placeholderData: keepPreviousData,
  });

  const handleNew = () => {
    router.push("/performance/self-assessment/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/performance/self-assessment/${id}`);
  };

  const handleView = (id: number) => {
    router.push(`/performance/self-assessment/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    toast.info("Delete functionality is not yet implemented");
  };

  const onSelectKPI = (kpi: IKPI) => {
    router.push(`/performance/kpi/${kpi.id}`);
  };

  return {
    assessments: data?.data,
    loading: isLoading || isFetching,
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
    pagination,
    setPagination,
    filters,
    setFilters,
    handleView,
  };
}
