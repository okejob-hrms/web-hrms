'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Separator } from '@/components/ui/separator';
import { Filters } from './types';
import InfoList from '@/components/ui/info-list';
import { useAttendance } from './hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Attendance } from '@/services/attendance/types';
import { cn, stringAvatar } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock4Icon,
  ClockAlertIcon,
  ClockArrowUpIcon,
  Edit3,
  Ellipsis,
  Eye,
  Search,
  Trash,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusAttendance } from '@/lib/helpers';
import OvertimeApproveModal from './sections/approve-modal';
import OvertimeRejectModal from './sections/reject-modal';
import OvertimeDeleteModal from './sections/delete-modal';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OvertimeTrackerList() {
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
              #{row.original.id_number}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'latest_attendance.attendance_date',
      header: 'Overtime Date',
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.attendance_date || '-',
    },

    {
      accessorKey: 'latest_attendance.attendance_date',
      header: 'Request Date',
      size: 200,
      cell: ({ row }) => row.original.latest_attendance?.attendance_date || '-',
    },

    {
      accessorKey: 'latest_attendance',
      header: 'Duration',
      cell: ({ row }) => {
        const att = row.original.latest_attendance;
        if (!att) return '-';

        return (
          <div className="flex flex-col w-max-2xl">
            <span className="text-muted-foreground text-xs">
              {att.duration || '-'}
            </span>
            <span className="text-primary">
              {att.clock.in_at || '-'} — {att.clock.out_at || '-'}
            </span>
          </div>
        );
      },
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
                  Overtime Request Details
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
                  Approve Request
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
                  Reject Request
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
                  <Edit3 />
                  Edit Overtime Request
                </button>
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
                  Delete Request
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

  const tabs = [
    {
      name: 'Waiting for approval',
      value: 'waiting',
      icon: <Clock4Icon />,
    },
    {
      name: 'Approved',
      value: 'approved',
      icon: <ClockArrowUpIcon />,
    },
    {
      name: 'Rejected',
      value: 'rejected',
      icon: <ClockAlertIcon />,
    },
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      <h2 className="font-semibold text-xl">Summary</h2>
      <div className="grid xl:grid-cols-4 grid-cols-1 gap-6">
        <InfoList
          title="New Overtime Request"
          compare="vs"
          time="yesterday"
          value={stat?.on_time?.current}
        />
        <InfoList
          title="Pending Overtime Request"
          compare=""
          time=""
          value={stat?.overtime?.current}
        />
        <InfoList
          title="Approved Overtime Request"
          compare=""
          time=""
          value={stat?.on_time?.current}
        />
        <InfoList
          title="Rejected Overtime Request"
          compare=""
          time=""
          value={stat?.day_off?.current}
        />
      </div>
      <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'px-2.5 sm:px-3 text-secondary-hover',
                'data-[state=active]:bg-secondary data-[state=active]:text-white',
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {tab.icon} {tab.name}
              </code>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
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
            <h2 className="font-semibold text-xl">Overtime Request</h2>
          </div>

          <DataTable
            columns={columns}
            data={attendances?.data?.data}
            pagination={attendances?.data}
            paginationState={pagination}
            setPaginationState={setPagination}
          />

          <OvertimeApproveModal
            onUpdate={() => handleApprove()}
            isOpen={openApprove}
            setIsOpen={(e) => setOpenApprove(e)}
          />

          <OvertimeRejectModal
            onUpdate={() => handleReject()}
            isOpen={openReject}
            setIsOpen={(e) => setOpenReject(e)}
          />

          <OvertimeDeleteModal
            onUpdate={() => handleDelete()}
            isOpen={openDelete}
            setIsOpen={(e) => setOpenDelete(e)}
          />
        </div>
      </div>
    </div>
  );
}
