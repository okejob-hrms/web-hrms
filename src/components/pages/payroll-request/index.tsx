'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock4Icon,
  Edit3,
  Ellipsis,
  Eye,
  Printer,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getStatusGeneratingPayroll,
  getStatusPayroll,
  getStatusPayrollReq,
} from '@/lib/helpers';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { cn, formatCurrency, stringAvatar } from '@/lib/utils';
import { ResponsePayrollItem } from '@/services/payroll/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getPayroll } from '@/services/payroll';
import { PaginatedResponse } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface Filters {
  search?: string;
  date?: string;
}

export const PayrollRequest = () => {
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: payrollData } = useQuery({
    queryKey: ['payroll', pagination, filters.search, filters.date],
    queryFn: () => getPayroll(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const dataPagination: PaginatedResponse<ResponsePayrollItem> = {
    current_page: payrollData?.pagination.current_page ?? 1,
    current_page_url: `${payrollData?.pagination.first ?? ''}`,
    first_page_url: payrollData?.pagination.first ?? '',
    from: payrollData?.pagination.from ?? 0,
    last_page: payrollData?.pagination.last_page ?? 1,
    next_page_url: payrollData?.pagination.next ?? null,
    path: 'api/v1/payruns',
    per_page: payrollData?.pagination.per_page ?? 10,
    prev_page_url: payrollData?.pagination.prev ?? null,
    to: payrollData?.pagination.to ?? 0,
    total: payrollData?.pagination.total ?? 0,
    data: payrollData?.data ?? [],
  };

  const columns: ColumnDef<ResponsePayrollItem>[] = [
    {
      accessorKey: 'period_label',
      header: 'Request By',
      size: 200,
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[250px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.created_by.name}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.created_by.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.created_by.name}
            </span>
            <span className="text-text-secondary">#{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Print Payrun Request',
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-400">
          {dayjs(row.original.created_at).format('MMMM D, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'send_payslip',
      header: 'Request On',
      size: 200,
      cell: ({ row }) =>
        row.original.send_payslip_at
          ? dayjs(row.original.send_payslip_at).format('MMMM D, YYYY')
          : '-',
    },
    {
      accessorKey: 'payslip_status',
      header: 'Request Status',
      size: 160,
      cell: ({ row }) => {
        const status = 'Pending';
        const { variant, className, label } = getStatusPayrollReq(status);
        if (!row.original.status_label) return '-';

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      size: 200,
      cell: ({ row }) =>
        dayjs(row.original.updated_at).format('MMMM D, YYYY') || '-',
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="flex gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="text-grayscale-30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Button
                    onClick={() => console.log(row)}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Edit3 />
                    Change Status
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Button
                    onClick={() => console.log(row)}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Printer />
                    Print Payslip
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const columnsView: ColumnDef<ResponsePayrollItem>[] = [
    {
      accessorKey: 'period_label',
      header: 'Request By',
      size: 200,
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[250px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.created_by.name}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.created_by.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.created_by.name}
            </span>
            <span className="text-text-secondary">#{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'View Payrun Request',
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-400">
          {dayjs(row.original.created_at).format('MMMM D, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'send_payslip',
      header: 'Request On',
      size: 200,
      cell: ({ row }) =>
        row.original.send_payslip_at
          ? dayjs(row.original.send_payslip_at).format('MMMM D, YYYY')
          : '-',
    },
    {
      accessorKey: 'send_payslip',
      header: 'Expired On',
      size: 200,
      cell: ({ row }) =>
        row.original.send_payslip_at
          ? dayjs(row.original.send_payslip_at).format('MMMM D, YYYY')
          : '-',
    },
    {
      accessorKey: 'payslip_status',
      header: 'Request Status',
      size: 160,
      cell: ({ row }) => {
        const status = 'Pending';
        const { variant, className, label } = getStatusPayrollReq(status);
        if (!row.original.status_label) return '-';

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      size: 200,
      cell: ({ row }) =>
        dayjs(row.original.updated_at).format('MMMM D, YYYY') || '-',
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="flex gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="text-grayscale-30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Button
                    onClick={() => console.log(row)}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Edit3 />
                    Change Status
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Button
                    onClick={() => console.log(row)}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Printer />
                    Print Payslip
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

  const PrintList = () => {
    return (
      <div className="flex flex-col justify-between gap-6 mt-5">
        <Form {...form}>
          <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
            <InputForm
              name="search"
              placeholder="Search by employee name"
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
            <h2 className="font-semibold text-xl">Print Payroll Request</h2>
          </div>

          <DataTable
            columns={columns}
            data={payrollData?.data}
            pagination={dataPagination}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        </div>
      </div>
    );
  };

  const ViewList = () => {
    return (
      <div className="flex flex-col justify-between gap-6 mt-5">
        <Form {...form}>
          <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
            <InputForm
              name="search"
              placeholder="Search by employee name"
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
            <h2 className="font-semibold text-xl">View Payroll Request</h2>
          </div>

          <DataTable
            columns={columnsView}
            data={payrollData?.data}
            pagination={dataPagination}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        </div>
      </div>
    );
  };

  const tabs = [
    {
      name: 'Print Request',
      value: 'print-list',
      content: <PrintList />,
      icon: <Printer />,
    },
    {
      name: 'View Payslip Request',
      value: 'view-list',
      content: <ViewList />,
      icon: <Eye />,
    },
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 md:px-[40px] px-6">
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

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
