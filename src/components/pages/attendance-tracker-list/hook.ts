"use client";

import * as React from "react";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, getAttendanceStat, getAttendanceDetail, getAttendanceStatEmployee, putAttendanceStatus, deleteAttendance } from "@/services/attendance";
import { Attendance, AttendanceSummary, AttendanceSummaryDetail } from "@/services/attendance/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Filters } from "./types";
import dayjs from "dayjs";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const DETAIL_PAGE_SIZE = 20;

const DEFAULT_FILTERS: Filters = {
  search: '',
  start_date: '',
  end_date: '',
  status: '',
  shift_id: '',
  source: '',
};

export function useAttendance({ syncUrl = true }: { syncUrl?: boolean } = {}) {
  const t = useTranslations('attendance');
  const { filters, setFilters, pagination, setPagination } = useUrlTableState({
    defaultFilters: DEFAULT_FILTERS,
    enabled: syncUrl,
  });
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openApprove, setOpenApprove] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<Attendance>();
  /** User whose history/summary the detail sheet shows. */
  const [detailUserId, setDetailUserId] = React.useState<string>('');
  /** Attendance record targeted by approve / reject / delete. */
  const [actionAttendanceId, setActionAttendanceId] = React.useState<string>('');

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
    queryKey: [
      "attendance",
      pagination,
      filters.search,
      filters.start_date,
      filters.end_date,
      filters.status,
      filters.shift_id,
      filters.source,
    ],
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
    queryKey: ["attendanceStatUser", detailUserId],
    queryFn: () => getAttendanceStatEmployee(detailUserId),
    enabled: !!detailUserId && openDetail,
    staleTime: 1000 * 60 * 5,
  });

  // Detail sheet history: paged so a full month loads as the user scrolls.
  const {
    data: detailPages,
    isLoading: isDetailLoading,
    fetchNextPage: fetchNextDetailPage,
    hasNextPage: hasNextDetailPage,
    isFetchingNextPage: isFetchingNextDetailPage,
  } = useInfiniteQuery({
    queryKey: ["attendanceDetail", detailUserId, detailFilter.month, detailFilter.year],
    queryFn: ({ pageParam }) =>
      getAttendanceDetail(detailUserId, detailFilter.month, detailFilter.year, {
        page: pageParam,
        per_page: DETAIL_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return last_page && current_page < last_page ? current_page + 1 : undefined;
    },
    // Gated on the open sheet, not by clearing the id, so its data stays on
    // screen through the close animation.
    enabled: !!detailUserId && openDetail,
  });

  const detailItems = React.useMemo(
    () => detailPages?.pages.flatMap((page) => page.data.data) ?? [],
    [detailPages],
  );

  // A record can belong to any employee, not only the one in the detail sheet.
  // Only mounted queries refetch; the rest are marked stale for their next use.
  const invalidateAttendanceData = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
    queryClient.invalidateQueries({ queryKey: ["attendanceDetail"] });
    queryClient.invalidateQueries({ queryKey: ["attendanceStatUser"] });
  };

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      putAttendanceStatus(id, { status }),
    onSuccess: () => {
      invalidateAttendanceData();
      toast.success(t('updateStatusSuccess'));
      setOpenApprove(false);
      setOpenReject(false);
      setActionAttendanceId('');
    },
    onError: () => {
      toast.error(t('updateStatusFailed'));
    }
  });

  const { mutate: removeAttendance } = useMutation({
    mutationFn: (id: number) => deleteAttendance(id),
    onSuccess: () => {
      invalidateAttendanceData();
      toast.success(t('deleteAttendanceSuccess'));
      setOpenDelete(false);
      setActionAttendanceId('');
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
    if (!actionAttendanceId) return;
    updateStatus({ id: Number(actionAttendanceId), status: 1 });
  };

  const handleReject = () => {
    if (!actionAttendanceId) return;
    updateStatus({ id: Number(actionAttendanceId), status: 2 });
  };

  const handleDelete = () => {
    if (!actionAttendanceId) return;
    removeAttendance(Number(actionAttendanceId));
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
    detailItems,
    isDetailLoading,
    fetchNextDetailPage,
    hasNextDetailPage,
    isFetchingNextDetailPage,
    setDetailUserId,
    setActionAttendanceId,
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
  };
}
