'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import InfoList from '@/components/ui/info-list';
import { useAttendance } from './hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Attendance } from '@/services/attendance/types';
import { stringAvatar } from '@/lib/utils';
import { formatDate } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock4Icon,
  Download,
  Edit3,
  Ellipsis,
  Eye,
  MapPin,
  Minus,
  Search,
  Trash,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getStatusAttendance } from '@/lib/helpers';
import AttendanceApproveModal from './sections/approve-modal';
import AttendanceRejectModal from './sections/reject-modal';
import AttendanceDeleteModal from './sections/delete-modal';
import AttendanceExportModal from './sections/export-modal';
import { Input, InputForm } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { Can } from '@/components/auth/can';

interface AttendanceTrackerListProps {
  hidePannel?: boolean;
  relativeUser?: string;
  relativeStatus?: string;
}

export const AttendanceTrackerList = ({
  hidePannel = false,
  relativeUser,
  relativeStatus,
}: AttendanceTrackerListProps) => {
  const router = useRouter();
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());

  const {
    attendances,
    pagination,
    setPagination,
    stat,
    selectedData,
    setSelectedData,
    openDetail,
    setOpenDetail,
    setSelectedId,
    detailData,
    handleGoDetailEmployee,
    statEmployee,
    handleApprove,
    handleReject,
    handleDelete,
    setOpenApprove,
    openApprove,
    setOpenReject,
    openReject,
    setOpenDelete,
    openDelete,
    setFilters,
    filters,
    detailFilter,
    handleNextDetailMonth,
    handlePrevDetailMonth,
    setSelectedIdTrackers,
  } = useAttendance();

  const [openExport, setOpenExport] = React.useState(false);

  const detailPeriodLabel = React.useMemo(
    () =>
      formatDate(
        new Date(detailFilter.year, detailFilter.month - 1, 1),
        locale,
        { month: 'long', year: 'numeric' },
      ),
    [detailFilter.month, detailFilter.year, locale],
  );

  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'name',
      header: tCommon('name'),
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[150px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.avatar}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.name}
            </span>
              <span className="text-text-secondary">{row.original.employee_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'latest_attendance.attendance_date',
      header: tCommon('date'),
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.attendance_date || '-',
    },

    {
      accessorKey: 'latest_attendance',
      header: t('checkInOut'),
      size: 200,
      cell: ({ row }) => {
        const att = row.original.latest_attendance;
        if (!att) return '-';

        return (
          <div className="flex flex-col">
            <span>
              {att.clock.in_at || '-'} — {att.clock.out_at || '-'}
            </span>
            <span className="text-muted-foreground text-xs">
              {tCommon('duration')} {att.duration || '-'}
            </span>
            {att.clock.duration && (
              <span className="text-muted-foreground text-xs">
                {t('overtime')} {att.clock.overtime_duration_fomated}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'latest_attendance.metadata.shift_name',
      header: t('shift'),
      size: 200,
      cell: ({ row }) =>
        row.original.latest_attendance?.metadata?.shift_name || '-',
    },
    {
      accessorKey: 'latest_attendance.source',
      header: t('source'),
      size: 160,
      cell: ({ row }) =>
        row.original.latest_attendance?.source || '-',
    },
    {
      accessorKey: 'latest_attendance.notes',
      header: tCommon('notes'),
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.notes || '-',
    },
    {
      accessorKey: 'latest_attendance.status_label',
      header: tCommon('status'),
      size: 160,
      cell: ({ row }) => {
        const status = row.original.latest_attendance?.status_label;
        const { variant, className, key } = getStatusAttendance(status);
        if (!row.original.latest_attendance?.status_label) return '-';

        return (
          <StatusBadge statusKey={key} variant={variant} className={className} />
        );
      },
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    setOpenDetail(true);
                    setSelectedId(String(row.original.id));
                    setSelectedData(row.original);
                    // refetchDetail();
                  }}
                  className="flex gap-2"
                >
                  <Eye />
                  {t('attendanceDetails')}
                </button>
              </DropdownMenuItem>
              {row.original.latest_attendance?.status !== 1 && (
                <Can permission="time_attendance.attendance_records.approval">
                  <DropdownMenuItem>
                    <button
                      onClick={() => {
                        setOpenApprove(true);
                        setSelectedId(
                          String(row.original?.latest_attendance?.id),
                        );
                      }}
                      className="flex gap-2"
                    >
                      <Clock4Icon />
                      {t('approveAttendance')}
                    </button>
                  </DropdownMenuItem>
                </Can>
              )}
              {row.original.latest_attendance?.status !== 2 && (
                <Can permission="time_attendance.attendance_records.approval">
                  <DropdownMenuItem>
                    <button
                      onClick={() => {
                        setOpenReject(true);
                        setSelectedId(
                          String(row.original?.latest_attendance?.id),
                        );
                      }}
                      className="flex gap-2"
                    >
                      <XCircle />
                      {t('rejectAttendance')}
                    </button>
                  </DropdownMenuItem>
                </Can>
              )}

              <Can permission="time_attendance.attendance_records.edit">
                <DropdownMenuItem>
                  <Link
                    href={`/attendance/attendance-tracker/${row.original.id}/${row.original.latest_attendance?.id}`}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Edit3 />
                    {t('editAttendanceRecord')}
                  </Link>
                </DropdownMenuItem>
              </Can>
              <Can permission="time_attendance.attendance_records.delete">
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      setOpenDelete(true);
                      setSelectedId(String(row.original?.latest_attendance?.id));
                    }}
                    className="flex gap-2"
                  >
                    <Trash />
                    {t('deleteAttendance')}
                  </button>
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    if (relativeUser) {
      setFilters((prev) => ({
        ...prev,
        search: relativeUser,
      }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }

    if (relativeStatus) {
      setFilters((prev) => ({
        ...prev,
        status: relativeStatus,
      }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [relativeUser, relativeStatus]);

  return (
    <div className={`font-sans min-h-screen flex flex-col space-y-6 px-6`}>
      {!hidePannel && (
        <>
          <h2 className="font-semibold text-xl">{tCommon('summary')}</h2>
          <div className="grid xl:grid-cols-3 grid-cols-1 gap-6">
            <InfoList
              title={t('lateClockIn')}
              increase={stat?.late_clock_in?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.late_clock_in?.current}
            />
            <InfoList
              title={t('earlyClockIn')}
              increase={stat?.early_clock_in?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.early_clock_in?.current}
            />
            <InfoList
              title={t('earlyClockOut')}
              increase={stat?.early_clock_out?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.early_clock_out?.current}
            />
          </div>
          <div className="grid xl:grid-cols-4 grid-cols-1 gap-6">
            <InfoList
              title={t('onTime')}
              increase={stat?.on_time?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.on_time?.current}
            />
            <InfoList
              title={t('overtime')}
              increase={stat?.overtime?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.overtime?.current}
            />
            <InfoList
              title={t('absent')}
              increase={stat?.absent?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.absent?.current}
            />
            <InfoList
              title={t('dayOff')}
              increase={stat?.day_off?.change}
              compare={tCommon('vs')}
              time={tCommon('yesterday')}
              value={stat?.day_off?.current}
            />
          </div>
        </>
      )}
      <div
        className={`flex flex-col justify-between gap-6 ${!hidePannel && 'mt-5'}`}
      >
        {!hidePannel && (
          <>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
              <Input
                name="search"
                className="w-full md:w-1/4"
                placeholder={t('searchEmployee')}
                icon={<Search className="size-5 text-grayscale-20" />}
                iconPosition="right"
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }));
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              />

              <Separator orientation="vertical" />

              <Input
                type="date"
                className="w-full md:w-1/4"
                name="date"
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    date: e ? dayjs(e.target.value).format('YYYY-MM-DD') : '',
                  }));
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              />
            </div>
            <Separator />
          </>
        )}

        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">{t('attendanceTracker')}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenExport(true)}
              >
                <Download className="h-4 w-4" />
                {t('exportExcel')}
              </Button>
              <Can permission="time_attendance.attendance_records.create">
                <Button
                  onClick={() => router.push('/attendance/attendance-tracker/add')}
                >
                  {t('newRecord')}
                </Button>
              </Can>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={attendances?.data?.data}
            pagination={attendances?.data}
            paginationState={pagination}
            setPaginationState={setPagination}
          />

          <Sheet open={openDetail} onOpenChange={setOpenDetail}>
            <SheetContent className="md:min-w-2xl w-full bg-white">
              <SheetHeader>
                <SheetTitle>{t('attendanceDetails')}</SheetTitle>
                <SheetDescription>{t('detailsView')}</SheetDescription>
              </SheetHeader>
              <div className="px-6">
                <div className="flex sm:flex-row flex-col justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        className="size-12"
                        src={`${selectedData?.avatar}`}
                        alt={selectedData?.name}
                      />
                      <AvatarFallback className="text-base font-medium">
                        {stringAvatar(selectedData?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-foreground text-base">
                        {selectedData?.name}
                      </span>
                      <span className="text-text-disabled text-xs">
                        {selectedData?.email ?? '-'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleGoDetailEmployee(selectedData?.employee_profile_id ?? 0)
                    }
                    disabled={!selectedData?.employee_profile_id}
                  >
                    <Eye />
                    {t('employeeDetails')}
                  </Button>
                </div>

                <Separator />

                <div className="flex justify-between my-3">
                  <div className="flex gap-2 items-center">
                    <div className="font-bold font-xl">
                      {detailPeriodLabel}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="outline"
                        onClick={() => handlePrevDetailMonth()}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleNextDetailMonth()}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="py-3 flex sm:flex-row flex-col justify-between">
                  <div className="gap-2">
                    <div className="font-semibold text-xs">{t('lateCheckIn')}</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.clock_in?.late}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">{t('earlyClockOut')}</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.clock_out?.early}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">{t('overtime')}</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.overtime}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">{t('absent')}</div>
                    <h3 className="text-primary font-bold">
                      {Math.round(statEmployee?.absent || 0)}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">{t('dayOff')}</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.day_off?.used}/
                      {statEmployee?.day_off?.quota}
                    </h3>
                  </div>
                </div>
              </div>

              {detailData?.data?.data && detailData?.data?.data?.length > 0 ? (
                <div className="bg-gray-100 p-6 space-y-6 flex-1 overflow-y-auto border-t">
                  {detailData?.data?.data.map((item, index) => {
                    const status = item?.status_label;
                    const { variant, className, key: statusKey } =
                      getStatusAttendance(status);
                    return (
                      <div
                        className="border rounded-md p-4 bg-white space-y-5"
                        key={index}
                      >
                        <div className="flex sm:flex-row flex-col gap-4">
                          <div className="text-primary font-bold">
                            {item.attendance_date}
                          </div>
                          {item.metadata.shift_name && (
                            <Badge
                              variant="default"
                              className="bg-blue-50 border-primary text-primary"
                            >
                              {item.metadata.shift_name}
                            </Badge>
                          )}

                          <StatusBadge
                            statusKey={statusKey}
                            variant={variant}
                            className={className}
                          />
                        </div>
                        <div className="flex sm:flex-row flex-col gap-4 justify-between items-center">
                          <div className="flex flex-row gap-2 justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                {t('clockIn')}
                              </span>
                              <span>{item.clock.in_at || '-'}</span>
                            </div>
                            <Minus
                              className="text-muted-foreground"
                              size={20}
                            />
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                {item.duration || '-'}
                              </span>
                            </div>
                            <Minus
                              className="text-muted-foreground"
                              size={20}
                            />
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs text-end">
                                {t('clockOut')}
                              </span>
                              <span className="text-warning text-end">
                                {item.clock.out_at || '-'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <span className="text-muted-foreground text-xs">
                              {t('attendanceApproval')}
                            </span>
                            <div className="flex gap-4">
                              {item.status !== 2 && (
                                <Can permission="time_attendance.attendance_records.approval">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white text-red-500 border-red-500"
                                    onClick={() => {
                                      setOpenReject(true);
                                      setSelectedIdTrackers(String(item.id));
                                    }}
                                  >
                                    <X />
                                    {tCommon('reject')}
                                  </Button>
                                </Can>
                              )}
                              {item.status !== 1 && (
                                <Can permission="time_attendance.attendance_records.approval">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      setOpenApprove(true);
                                      setSelectedIdTrackers(String(item.id));
                                    }}
                                  >
                                    <Check />
                                    {tCommon('approve')}
                                  </Button>
                                </Can>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 py-2 border-t">
                          <div className="flex flex-row gap-6">
                            <div className="flex flex-col space-y-1">
                              <span className="text-muted-foreground text-sm">
                                {t('location')}
                              </span>
                              <Badge
                                variant="default"
                                className="bg-blue-50 border-primary text-primary"
                              >
                                <div className="w-6">
                                  <MapPin size={16} />
                                </div>
                                <div className="whitespace-normal break-words max-w-full">
                                  {item.metadata.location_name ?? '-'}
                                </div>
                              </Badge>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-muted-foreground text-sm">
                                {t('source')}
                              </span>
                              <span className="text-sm font-medium">
                                {item.source || '-'}
                              </span>
                            </div>
                          </div>
                          {item.notes && (
                            <div className="flex flex-col space-y-1">
                              <span className="text-muted-foreground text-sm">
                                {tCommon('notes')}
                              </span>

                              <span className="text-muted-foreground text-sm">
                                {item.notes ?? '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-100 p-6 space-y-6 flex-1 overflow-y-auto border-t">
                  <div className="flex items-center justify-center">
                    {t('noAttendanceData')}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <AttendanceApproveModal
            onUpdate={() => handleApprove()}
            isOpen={openApprove}
            setIsOpen={(e) => setOpenApprove(e)}
          />

          <AttendanceRejectModal
            onUpdate={() => handleReject()}
            isOpen={openReject}
            setIsOpen={(e) => setOpenReject(e)}
          />

          <AttendanceDeleteModal
            onUpdate={() => handleDelete()}
            isOpen={openDelete}
            setIsOpen={(e) => setOpenDelete(e)}
          />

          <AttendanceExportModal
            isOpen={openExport}
            setIsOpen={setOpenExport}
            defaultStartDate={filters.date || undefined}
            defaultEndDate={filters.date || undefined}
          />
        </div>
      </div>
    </div>
  );
};
