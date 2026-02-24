/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leave-request/components/LeaveTable.tsx
'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { PaginationState } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, stringAvatar } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CircleCheckBigIcon,
  CircleXIcon,
  Clock4Icon,
  Edit3,
  Ellipsis,
  Eye,
  Plus,
  Trash,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  formatDateRange,
  formatDayDifference,
  getStatusOvertime,
} from '@/lib/helpers';
import dayjs from 'dayjs';
import { ILeaveResponse } from '@/services/employees/leave/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  data: ILeaveResponse[] | undefined;
  pagination: any;
  paginationState: PaginationState;
  setPaginationState: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  loading: boolean;
  onSelectLeave: (leave: ILeaveResponse) => void;
  onOpenModal: (
    modal: 'reject' | 'approve' | 'delete' | 'detail' | 'edit',
  ) => void;
  onNavigateAdd: () => void;
  isEmployee: boolean;
}

export default function LeaveTable({
  data,
  pagination,
  paginationState,
  setPaginationState,
  loading,
  onSelectLeave,
  onOpenModal,
  onNavigateAdd,
  isEmployee,
}: Props) {
  const router = useRouter();
  const columns: ColumnDef<ILeaveResponse>[] = React.useMemo(
    () => [
      ...(!isEmployee
        ? [
            {
              accessorKey: 'user.name',
              header: 'Name',
              cell: ({ row }: CellContext<ILeaveResponse, unknown>) => (
                <div className="flex gap-4 items-center min-w-[150px]">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={row.original.user?.avatar_url ?? ''} />
                    <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                      {stringAvatar(row.original.user?.name ?? '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">
                      {row.original.user?.name}
                    </span>
                    <span className="text-text-secondary">
                      #{row.original.user?.id}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              accessorKey: 'leave_type.name',
              header: 'Leave',
              size: 200,
            },
          ]
        : []),
      {
        accessorKey: 'duration',
        header: 'Duration',
        size: 300,
        cell: ({ row }) => {
          const leave = row.original;
          if (!leave) return '-';

          return (
            <div className="flex flex-col w-max-2xl">
              <span>
                {formatDayDifference(leave.start_date, leave.end_date)}
              </span>
              <span className="text-primary">
                {formatDateRange(leave.start_date, leave.end_date)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        size: 200,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 200,
        cell: ({ row }) => row.original.notes || '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 160,
        cell: ({ row }) => {
          const status = row.original.status;
          const { variant, className, label } = getStatusOvertime(status);
          if (!row.original.status) return '-';

          return (
            <Badge variant={variant} className={className}>
              {label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Last Update',
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{dayjs(row.original.updated_at).format('MMMM D, YYYY')}</span>
            <span className="text-sm text-text-disabled">
              {dayjs(row.original.updated_at).format('HH:mm')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'menu',
        header: '',
        cell: ({ row }) => {
          const leave = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Ellipsis className="text-grayscale-30" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => {
                      onSelectLeave(leave);
                      setTimeout(() => onOpenModal('detail'), 0);
                    }}
                    className="flex gap-2 w-full text-left"
                  >
                    <Eye className="w-4 h-4" />
                    Leave Request Details
                  </button>
                </DropdownMenuItem>

                {!isEmployee && (
                  <>
                    {leave.status === 1 && (
                      <>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() => {
                              onSelectLeave(leave);
                              setTimeout(() => onOpenModal('approve'), 0);
                            }}
                            className="flex gap-2 w-full text-left"
                          >
                            <Clock4Icon className="w-4 h-4" />
                            Approve Request
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() => {
                              onSelectLeave(leave);
                              setTimeout(() => onOpenModal('reject'), 0);
                            }}
                            className="flex gap-2 w-full text-left"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Request
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() =>
                              router.push(
                                `/attendance/leave-request/edit/${leave.id}`,
                              )
                            }
                            className="flex gap-2 w-full text-left"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Overtime Request
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() => {
                              onSelectLeave(leave);
                              setTimeout(() => onOpenModal('delete'), 0);
                            }}
                            className="flex gap-2 w-full text-left text-red-600"
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                            Delete Request
                          </button>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSelectLeave, onOpenModal],
  );
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">Leave Request</h2>
        <Button onClick={onNavigateAdd}>
          <Plus /> New Leave Request
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        pagination={pagination}
        paginationState={paginationState}
        setPaginationState={setPaginationState}
        loading={loading}
      />
    </div>
  );
}
