/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import { Toolbar } from './sections/toolbar';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/components/tables/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, stringAvatar } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Filters } from './types';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { InitiateOffboardingEmployee } from './sections/initiate-offboarding-form';
import { getOffboardings } from '@/services/employees/offboardings';
import { IOffboardingResponse } from '@/services/employees/offboardings/types';
import { Clock } from 'lucide-react';

interface EmployeeOffboardingListProps {
  hidePannel?: boolean;
  status?: number;
}

export const columns: ColumnDef<IOffboardingResponse>[] = [
  {
    accessorKey: 'user_name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex gap-4 items-center min-w-[150px]">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`${process.env.NEXT_PUBLIC_FILE_URL}/${row.original.user_name}`}
          />
          <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
            {stringAvatar(row.original.user_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.user_name}
          </span>
          <span className="text-text-secondary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'job_position',
    header: 'Position',
    cell: ({ row }) => {
      return row.original.job_position || '-';
    },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => {
      return row.original.department || '-';
    },
  },
  {
    accessorKey: 'start_date',
    header: 'Join Date',
    cell: ({ row }) => {
      const date = new Date(row.original.join_date);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status_offboarding;
      return (
        <Badge
          variant="default"
          className={cn(
            'rounded-full',
            status === 'In Progress'
              ? 'bg-warning-background'
              : status === 'Completed'
                ? 'bg-success-focused'
                : 'bg-error-focused',
          )}
        >
          {status === 'In Progress' ? (
            <Clock color="#FFB84D" />
          ) : (
            <div
              className={cn(
                status === 'Completed' ? 'bg-success' : 'bg-error',
                'h-2 w-2 rounded-full',
              )}
            />
          )}
          <span
            className={cn(
              status === 'In Progress'
                ? 'text-warning-hover'
                : status === 'Completed'
                  ? 'text-success'
                  : 'text-error',
            )}
          >
            {status}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'menu',
    header: '',
    cell: ({ row }) => {
      return (
        <Link href={`/employee/off-boarding/${row.original.id}`}>
          <Image
            src="/icons/eyeVisibleGrey.svg"
            width={20}
            height={20}
            alt="preview"
          />
        </Link>
      );
    },
  },
];

export default function EmployeeOffboardingList({
  hidePannel = false,
  status,
}: EmployeeOffboardingListProps) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<Filters>({
    // department_id: 0,
    // job_position_id: 0,
    search: '',
  });

  const debouncedFilters = useDebounce(filters, 300);
  const queryParams = React.useMemo(
    () => ({
      ...debouncedFilters,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: '',
    }),
    [debouncedFilters, pagination],
  );

  const { data: employees, isLoading } = useQuery({
    queryKey: ['offboardings', queryParams, status],
    queryFn: () => getOffboardings(queryParams, status),
    // queryFn: () => getEmployees(queryParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleFiltersChange = React.useCallback((newFilters: Filters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      department_id:
        newFilters.department_id !== prev.department_id
          ? newFilters.department_id
          : prev.department_id,
      job_position_id:
        newFilters.job_position_id !== prev.job_position_id
          ? newFilters.job_position_id
          : prev.job_position_id,
    }));

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const handlePaginationChange = React.useCallback((updater: any) => {
    try {
      setPagination(updater);
    } catch (error) {
      console.log('error handle pagination ', error);
    }
  }, []);

  return (
    <div className="flex flex-col justify-between gap-6 p-4">
      {!hidePannel && (
        <>
          <Toolbar onFiltersChange={handleFiltersChange} />
          <Separator />
        </>
      )}
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4">
        <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold text-xl">
              Employee Offboarding Records
            </h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {employees?.total || 0} Employee
              {employees?.total !== 1 ? 's' : ''}
            </Badge>
          </div>
          {!hidePannel && <InitiateOffboardingEmployee />}
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4 items-center w-full">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-30 w-full" />
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={employees?.data || []}
            pagination={employees}
            paginationState={pagination}
            setPaginationState={handlePaginationChange}
          />
        )}
      </div>
    </div>
  );
}
