"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, getAttendanceStat, getAttendanceDetail, getAttendanceStatEmployee, putAttendanceStatus, deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { Attendance, AttendanceSummary, AttendanceSummaryDetail } from "@/services/attendance/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Filters } from "./types";
import dayjs from "dayjs";

export function useAttendance() {
  const t = useTranslations('attendance');
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
  const [selectedIdTrackers, setSelectedIdTrackers] = React.useState<string>('');
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });

  const [detailFilter, setDetailFilter] = React.useState(() => {
    const now = dayjs();
    return { month: now.month() + 1, year: now.year() };
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance", pagination, filters.search, filters.date, filters.status],
    queryFn: () => getAttendance(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: stat } = useQuery<AttendanceSummary>({
    queryKey: ["attendanceStats"],
    queryFn: getAttendanceStat,
    staleTime: 1000 * 60 * 5,
  });

  const { data: statEmployee } = useQuery<AttendanceSummaryDetail>({
    queryKey: ["attendanceStatUser", selectedId],
    queryFn: () => getAttendanceStatEmployee(selectedId),
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5,
  });

  // Query untuk detail attendance
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["attendanceDetail", selectedId, detailFilter.month, detailFilter.year],
    queryFn: () => getAttendanceDetail(selectedId, detailFilter.month, detailFilter.year),
    enabled: !!selectedId,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      putAttendanceStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceDetail", selectedId] });
      toast.success(t('updateStatusSuccess'));
      setOpenApprove(false);
      setOpenReject(false);
      setOpenDetail(false);
    },
    onError: () => {
      toast.error(t('updateStatusFailed'));
    }
  });
  
  const { mutate: removeAttendance } = useMutation({
    mutationFn: (id: number) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success(t('deleteAttendanceSuccess'));
      setOpenDelete(false);
    },
    onError: () => {
      toast.error(t('deleteAttendanceFailed'));
    },
  });

  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const handleGoDetailEmployee = (id:number) => {
    router.push(`/employee/employee-management/${id}`)
  }

  const handleApprove = () => {
    if (!selectedIdTrackers) return;
    updateStatus({ id: Number(selectedIdTrackers), status: 1 });
  };

  const handleReject = () => {
    if (!selectedIdTrackers) return;
    updateStatus({ id: Number(selectedIdTrackers), status: 2 });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeAttendance(Number(selectedId));
  };

  const handleNextDetailMonth = () => {
    const next = dayjs()
      .year(detailFilter.year)
      .month(detailFilter.month - 1)
      .add(1, 'month');
    setDetailFilter({ month: next.month() + 1, year: next.year() });
  };

  const handlePrevDetailMonth = () => {
    const prev = dayjs()
      .year(detailFilter.year)
      .month(detailFilter.month - 1)
      .subtract(1, 'month');
    setDetailFilter({ month: prev.month() + 1, year: prev.year() });
  };

  return {
    attendances: paginatedData,
    loading: isLoading || isFetching || isRefetching,
    hasNextPage,
    hasPreviousPage,
    pagination,
    setPagination,
    stat: stat?.data,
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
    detailFilter,
    handleNextDetailMonth,
    handlePrevDetailMonth,
    setSelectedIdTrackers,
  };
}
