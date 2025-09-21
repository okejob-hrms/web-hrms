"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAttendance } from "@/services/attendance";
import { PaginatedResponse } from "@/lib/types";
import { Attendance } from "@/services/attendance/types";
import { ColumnDef } from "@tanstack/react-table";

export function useAttendance() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);

  const {
    data: attendanceData,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Attendance>>({
    queryKey: ["attendances", page, limit],
    queryFn: () => getAttendance(),
  });

  // =======================
  // Table Columns
  // =======================
  const columns: ColumnDef<Attendance>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'workingHours', header: 'Date', size: 200 },
    { accessorKey: 'workingHours', header: 'Check-In & Check-Out', size: 200 },
    { accessorKey: 'workingHours', header: 'Location', size: 200 },
    { accessorKey: 'workingHours', header: 'Notes', size: 200 },
    { accessorKey: 'break', header: 'Status', size: 160 },
  ];

  const handleRefresh = () => {
    refetch();
  };

  return {
    loading: isLoading,
    error: error as Error | null,
    attendances: attendanceData?.data ?? ([] as Attendance[]),
    pagination: attendanceData ?? null,
    page,
    limit,
    setPage,
    setLimit,
    handleRefresh,
    columns,
  };
}
