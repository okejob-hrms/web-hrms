'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Filters } from './types';
import InfoList from '@/components/ui/info-list';
import { useAttendance } from './hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Attendance } from '@/services/attendance/types';
import { stringAvatar } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Check,
  Clock4Icon,
  Edit3,
  Ellipsis,
  Eye,
  Minus,
  Search,
  Trash,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { getLocationName } from '@/lib/geocode';
import { LocationBadge } from '@/components/ui/location-badge';

export default function AttendanceTrackerList() {
  const router = useRouter();

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
    refetchDetail,
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
  } = useAttendance();

  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
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
            <span className="text-text-secondary">
              {row.original.id_number}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'latest_attendance.attendance_date',
      header: 'Date',
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.attendance_date || '-',
    },

    {
      accessorKey: 'latest_attendance',
      header: 'Check-In & Out',
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
              Duration {att.duration || '-'}
            </span>
            {att.clock.duration && (
              <span className="text-muted-foreground text-xs">
                Overtime {att.clock.overtime_duration_fomated}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'latest_attendance.metadata.shift_name',
      header: 'Shift',
      size: 200,
      cell: ({ row }) =>
        row.original.latest_attendance?.metadata?.shift_name || '-',
    },
    {
      accessorKey: 'latest_attendance.notes',
      header: 'Notes',
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.notes || '-',
    },
    {
      accessorKey: 'latest_attendance.status_label',
      header: 'Status',
      size: 160,
      cell: ({ row }) => {
        const status = row.original.latest_attendance?.status_label;
        const { variant, className, label } = getStatusAttendance(status);
        if (!row.original.latest_attendance?.status_label) return '-';

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
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
                    refetchDetail();
                  }}
                  className="flex gap-2"
                >
                  <Eye />
                  Attendance Details
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    setOpenApprove(true);
                    setSelectedId(String(row.original?.latest_attendance?.id));
                  }}
                  className="flex gap-2"
                >
                  <Clock4Icon />
                  Approve Attendance
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    setOpenReject(true);
                    setSelectedId(String(row.original?.latest_attendance?.id));
                  }}
                  className="flex gap-2"
                >
                  <XCircle />
                  Reject Attendance
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/attendance/attendance-tracker/${row.original.id}`}
                  className="flex gap-2 justify-between items-center"
                >
                  <Edit3 />
                  Edit Attendance Record
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    setOpenDelete(true);
                    setSelectedId(String(row.original?.latest_attendance?.id));
                  }}
                  className="flex gap-2"
                >
                  <Trash />
                  Delete Attendance
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const form = useForm<Filters>({
    defaultValues: {
      search: '',
      date: '',
    },
  });

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      <h2 className="font-semibold text-xl">Summary</h2>
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-6">
        <InfoList
          title="Late Clock In"
          increase={stat?.late_clock_in?.change}
          compare="vs"
          time="yesterday"
          value={stat?.late_clock_in?.current}
        />
        <InfoList
          title="Early Clock In"
          increase={stat?.early_clock_in?.change}
          compare="vs"
          time="yesterday"
          value={stat?.early_clock_in?.current}
        />
        <InfoList
          title="Early Clock Out"
          increase={stat?.early_clock_out?.change}
          compare="vs"
          time="yesterday"
          value={stat?.early_clock_out?.current}
        />
      </div>
      <div className="grid xl:grid-cols-4 grid-cols-1 gap-6">
        <InfoList
          title="On Time"
          increase={stat?.on_time?.change}
          compare="vs"
          time="yesterday"
          value={stat?.on_time?.current}
        />
        <InfoList
          title="Overtime"
          increase={stat?.overtime?.change}
          compare="vs"
          time="yesterday"
          value={stat?.overtime?.current}
        />
        <InfoList
          title="Absent"
          increase={stat?.absent?.change}
          compare="vs"
          time="yesterday"
          value={stat?.absent?.current}
        />
        <InfoList
          title="Day Off"
          increase={stat?.day_off?.change}
          compare="vs"
          time="yesterday"
          value={stat?.day_off?.current}
        />
      </div>
      <div className="flex flex-col justify-between gap-6 mt-5">
        <Form {...form}>
          <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
            <InputForm
              name="search"
              placeholder="Search by Employee Name or Email"
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

            <DatePicker
              className="min-w-[180px]"
              name="date"
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  date: e ? dayjs(e).format('YYYY-MM-DD') : '',
                }));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          </form>
        </Form>

        <Separator />
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">Attendance Tracker</h2>
            <Button
              onClick={() => router.push('/attendance/attendance-tracker/add')}
            >
              + New Record Attendance
            </Button>
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
                <SheetTitle>Attendance Details</SheetTitle>
                <SheetDescription>This is the details view.</SheetDescription>
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
                      handleGoDetailEmployee(Number(selectedData?.id_number))
                    }
                  >
                    <Eye />
                    Employee Details
                  </Button>
                </div>

                <div className="py-3 flex sm:flex-row flex-col justify-between">
                  <div className="gap-2">
                    <div className="font-semibold text-xs">Late Check In</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.clock_in?.late}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">Early Clock Out</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.clock_out?.early}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">Overtime</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.overtime}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">Absent</div>
                    <h3 className="text-primary font-bold">
                      {Math.round(statEmployee?.absent || 0)}
                    </h3>
                  </div>
                  <div className="gap-2">
                    <div className="font-semibold text-xs">Day Off</div>
                    <h3 className="text-primary font-bold">
                      {statEmployee?.day_off?.used}/
                      {statEmployee?.day_off?.quota}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-6 space-y-6 flex-1 overflow-y-auto border-t">
                {detailData?.data.data.map((item, key) => {
                  return (
                    <div
                      className="border rounded-md p-4 bg-white space-y-5"
                      key={key}
                    >
                      <div className="flex sm:flex-row flex-col gap-4">
                        <div className="text-primary font-bold">
                          {item.attendance_date}
                        </div>
                        <Badge
                          variant="default"
                          className="bg-blue-50 border-primary text-primary"
                        >
                          {item.metadata.shift_name}
                        </Badge>
                      </div>
                      <div className="flex sm:flex-row flex-col gap-4 justify-between items-center">
                        <div className="flex flex-row gap-2 justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">
                              Clock-In
                            </span>
                            <span>{item.clock.in_at || '-'}</span>
                          </div>
                          <Minus className="text-muted-foreground" size={20} />
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">
                              {item.duration || '-'}
                            </span>
                          </div>
                          <Minus className="text-muted-foreground" size={20} />
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs text-end">
                              Clock-Out
                            </span>
                            <span className="text-warning text-end">
                              {item.clock.out_at || '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <span className="text-muted-foreground text-xs">
                            Attendance Approval
                          </span>
                          <div className="flex gap-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white text-red-500 border-red-500"
                              onClick={() => {
                                setOpenReject(true);
                                setSelectedId(String(item.id));
                              }}
                            >
                              <X />
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setOpenApprove(true);
                                setSelectedId(String(item.id));
                              }}
                            >
                              <Check />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 py-2 border-t">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-sm">
                            Location
                          </span>
                          <LocationBadge
                            lat={Number(item.location.latitude)}
                            lng={Number(item.location.longitude)}
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-sm">
                            Notes
                          </span>

                          <span className="text-muted-foreground text-sm">
                            {item.notes ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
        </div>
      </div>
    </div>
  );
}
