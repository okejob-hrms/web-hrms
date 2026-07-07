/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leave-request/components/LeaveTable.tsx
'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { resolveLocale } from '@/lib/i18n/locale';
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
import { StatusBadge } from '@/components/shared/status-badge';
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
  const locale = resolveLocale(useLocale());
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const columns: ColumnDef<ILeaveResponse>[] = React.useMemo(
    () => [
      ...(!isEmployee
        ? [
            {
              accessorKey: 'user.name',
              header: tCommon('name'),
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
              header: t('leaveColumn'),
              size: 200,
            },
          ]
        : []),
      {
        accessorKey: 'duration',
        header: tCommon('duration'),
        size: 300,
        cell: ({ row }) => {
          const leave = row.original;
          if (!leave) return '-';

          return (
            <div className="flex flex-col w-max-2xl">
              <span>
                {formatDayDifference(leave.start_date, leave.end_date, locale)}
              </span>
              <span className="text-primary">
                {formatDateRange(leave.start_date, leave.end_date, locale)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: t('reason'),
        size: 200,
      },
      {
        accessorKey: 'notes',
        header: tCommon('notes'),
        size: 200,
        cell: ({ row }) => row.original.notes || '-',
      },
      {
        accessorKey: 'status',
        header: tCommon('status'),
        size: 160,
        cell: ({ row }) => {
          const status = row.original.status;
          const { variant, className, key } = getStatusOvertime(status);
          if (!row.original.status) return '-';

          return (
            <StatusBadge statusKey={key} variant={variant} className={className} />
          );
        },
      },
      {
        accessorKey: 'updated_at',
        header: tCommon('lastUpdate'),
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
                    {t('leaveRequestDetails')}
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
                            {t('approveRequest')}
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
                            {t('rejectRequest')}
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
                            {t('editLeaveRequest')}
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
                            {t('deleteRequest')}
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
    [isEmployee, locale, onNavigateAdd, onOpenModal, onSelectLeave, router, t, tCommon],
  );
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">{t('leaveRequest')}</h2>
        <Button onClick={onNavigateAdd}>
          <Plus /> {t('newLeaveRequest')}
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
