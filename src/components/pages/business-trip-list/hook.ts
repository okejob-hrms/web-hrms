"use client";

import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { getBusinessTrips } from "@/services/business-trips";
import { BusinessTripFilters } from "./types";

export function useBusinessTrips() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState<BusinessTripFilters>({
    start_date: "",
    end_date: "",
    status: undefined,
    user_id: undefined,
  });

  const { data, isLoading, isFetching, isRefetching } = useQuery({
    queryKey: [
      "business-trips",
      pagination,
      filters.start_date,
      filters.end_date,
      filters.status,
      filters.user_id,
    ],
    queryFn: () => getBusinessTrips(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return {
    rows: data?.data ?? [],
    apiPagination: data?.pagination,
    paginationState: pagination,
    setPagination,
    filters,
    setFilters,
    loading: isLoading || isFetching || isRefetching,
  };
}
