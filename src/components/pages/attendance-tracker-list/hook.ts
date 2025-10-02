"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, getAttendanceStat, getAttendanceDetail, getAttendanceStatEmployee, putAttendanceStatus, deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { Attendance, AttendanceSummary, AttendanceSummaryDetail } from "@/services/attendance/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filters } from "./types";

export function useAttendance() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openApprove, setOpenApprove] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<Attendance>();
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance", pagination, filters.search, filters.date],
    queryFn: () => getAttendance(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: stat } = useQuery<AttendanceSummary>({
    queryKey: ["attendanceStat"],
    queryFn: getAttendanceStat,
    staleTime: 1000 * 60 * 5,
  });

  const { data: statEmployee } = useQuery<AttendanceSummaryDetail>({
    queryKey: ["attendanceStatUser", selectedId],
    queryFn: () => getAttendanceStatEmployee(selectedId),
    staleTime: 1000 * 60 * 5,
  });

  // Query untuk detail attendance
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["attendanceDetail", selectedId],
    queryFn: () => getAttendanceDetail(selectedId),
    placeholderData: keepPreviousData,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      putAttendanceStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceDetail", selectedId] });
      toast.success('Success update attendance status');
      setOpenApprove(false);
      setOpenReject(false);
      setOpenDetail(false);
    },
    onError: () => {
      toast.error('Failed update attendance status');
    }
  });
  
  const { mutate: removeAttendance } = useMutation({
    mutationFn: (id: number) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Success delete attendance");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete attendance");
    },
  });

  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const handleGoDetailEmployee = (id:number) => {
    router.push(`/employee/employee-management/${id}`)
  }

  const handleApprove = () => {
    if (!selectedId) return;
    updateStatus({ id: Number(selectedId), status: 1 });
  };

  const handleReject = () => {
    if (!selectedId) return;
    updateStatus({ id: Number(selectedId), status: 2 });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeAttendance(Number(selectedId));
  };

  return {
    attendances: paginatedData,
    loading: isLoading || isFetching || isRefetching,
    hasNextPage,
    hasPreviousPage,
    pagination,
    setPagination,
    stat,
    setOpenDetail,
    openDetail,
    setSelectedData,
    selectedData,
    detailData,
    isDetailLoading,
    setSelectedId,
    refetchDetail,
    handleGoDetailEmployee,
    statEmployee: statEmployee?.data,
    handleApprove,
    handleReject,
    handleDelete,
    openApprove,
    setOpenApprove,
    setOpenReject,
    openReject,
    setOpenDelete,
    openDelete,
    filters,
    setFilters,
  };
}
