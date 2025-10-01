"use client";

import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAttendance } from "@/services/attendance";
import { Attendance } from "@/services/attendance/types";
import { ColumnDef, PaginationState } from "@tanstack/react-table";

export function useAttendance() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance", pagination],
    queryFn: () => getAttendance(pagination),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const columns: ColumnDef<Attendance>[] = [
    { accessorKey: "name", header: "Name", size: 160 },
    { accessorKey: "created_at", header: "Date", size: 200 },
    { accessorKey: "latest_attendance", header: "Check-In & Check-Out", size: 200 },
    { accessorKey: "location", header: "Location", size: 200 },
    { accessorKey: "notes", header: "Notes", size: 200 },
    { accessorKey: "status", header: "Status", size: 160 },
  ];

  return {
    attendances: paginatedData,
    loading: isLoading || isFetching || isRefetching,
    hasNextPage,
    hasPreviousPage,
    pagination,
    columns,
    setPagination,
  };
}
