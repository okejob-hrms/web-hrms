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
  Ellipsis,
  Eye,
  Loader2,
  Printer,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusPayrollReq } from '@/lib/helpers';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { cn, stringAvatar } from '@/lib/utils';
import { PayrunViewResponseList } from '@/services/payroll/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import {
  getPayrollPrint,
  getPayrollView,
  putPrintPayrun,
  putViewPayrun,
} from '@/services/payroll';
import { PaginatedResponse } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

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

  const [activeTab, setActiveTab] = React.useState('print-list');
  const [loading, setLoading] = React.useState(false);

  const { data: payrollDataView, refetch: payrollViewRefetch } = useQuery({
    queryKey: ['payrollView', pagination, filters.search, filters.date],
    queryFn: () => getPayrollView(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const dataPaginationView: PaginatedResponse<PayrunViewResponseList> = {
    current_page: payrollDataView?.pagination.current_page ?? 1,
    current_page_url: `${payrollDataView?.pagination.first ?? ''}`,
    first_page_url: payrollDataView?.pagination.first ?? '',
    from: payrollDataView?.pagination.from ?? 0,
    last_page: payrollDataView?.pagination.last_page ?? 1,
    next_page_url: payrollDataView?.pagination.next ?? null,
    path: 'api/v1/payruns',
    per_page: payrollDataView?.pagination.per_page ?? 10,
    prev_page_url: payrollDataView?.pagination.prev ?? null,
    to: payrollDataView?.pagination.to ?? 0,
    total: payrollDataView?.pagination.total ?? 0,
    data: payrollDataView?.data ?? [],
  };

  const { data: payrollDataPrint } = useQuery({
    queryKey: ['payrollPrint', pagination, filters.search, filters.date],
    queryFn: () => getPayrollPrint(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const dataPaginationPrint: PaginatedResponse<PayrunViewResponseList> = {
    current_page: payrollDataPrint?.pagination.current_page ?? 1,
    current_page_url: `${payrollDataPrint?.pagination.first ?? ''}`,
    first_page_url: payrollDataPrint?.pagination.first ?? '',
    from: payrollDataPrint?.pagination.from ?? 0,
    last_page: payrollDataPrint?.pagination.last_page ?? 1,
    next_page_url: payrollDataPrint?.pagination.next ?? null,
    path: 'api/v1/payruns',
    per_page: payrollDataPrint?.pagination.per_page ?? 10,
    prev_page_url: payrollDataPrint?.pagination.prev ?? null,
    to: payrollDataPrint?.pagination.to ?? 0,
    total: payrollDataPrint?.pagination.total ?? 0,
    data: payrollDataPrint?.data ?? [],
  };

  const columns: ColumnDef<PayrunViewResponseList>[] = [
    {
      accessorKey: 'period_label',
      header: 'Request By',
      size: 200,
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[250px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.employee.name}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.employee.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.employee.name}
            </span>
            <span className="text-text-secondary">#{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'payrun.period_label',
      header: 'Payrun Request',
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-600">
          {dayjs(row.original.payrun.period_label).format('MMMM D, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'payrun.period_year',
      header: 'Request On',
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-400">
          {activeTab === 'print-list'
            ? dayjs(row.original.print_access_requested_at).format(
                'MMMM D, YYYY',
              )
            : dayjs(row.original.view_access_requested_at).format(
                'MMMM D, YYYY',
              )}
        </span>
      ),
    },
    {
      accessorKey: 'print_access_status_label',
      header: 'Request Status',
      size: 160,
      cell: ({ row }) => {
        const status =
          activeTab === 'print-list'
            ? row.original.print_access_status_label
            : row.original.view_access_status_label;
        const { variant, className, label } = getStatusPayrollReq(status);
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
      cell: ({ row }) => (
        <span className="text-gray-400">
          {dayjs(row.original.updated_at).format('MMMM D, YYYY') || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="flex gap-3 items-center">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-grayscale-30" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <button
                      onClick={() => handleApprove(row.original.id)}
                      className="flex gap-2"
                    >
                      <Clock4Icon />
                      Approve Request
                    </button>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <button
                      onClick={() => handleReject(row.original.id)}
                      className="flex gap-2"
                    >
                      <XCircle />
                      Reject Request
                    </button>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                  <Button
                    onClick={() => console.log(row)}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Printer />
                    Print Payslip
                  </Button>
                </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  const mutationPutPrint = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { status: number };
    }) => putPrintPayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success('Print request successfully updated');
      payrollViewRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

  const mutationPutView = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { status: number };
    }) => putViewPayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success('View request successfully updated');
      payrollViewRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

  const handleApprove = (idx: number) => {
    if (activeTab === 'print-list') {
      mutationPutPrint.mutate({ id: idx, payload: { status: 1 } });
    } else {
      mutationPutView.mutate({ id: idx, payload: { status: 1 } });
    }
  };

  const handleReject = (idx: number) => {
    if (activeTab === 'print-list') {
      mutationPutPrint.mutate({ id: idx, payload: { status: 2 } });
    } else {
      mutationPutView.mutate({ id: idx, payload: { status: 2 } });
    }
  };

  const form = useForm<Filters>({
    defaultValues: {
      search: '',
      date: '',
    },
    // TODO RESET WHILE CHANGE TAB
  });

  React.useEffect(() => {
    form.reset({
      search: '',
      date: '',
    });

    setFilters({
      search: '',
      date: '',
    });

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [activeTab]);

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
            data={payrollDataPrint?.data}
            pagination={dataPaginationPrint}
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
            columns={columns}
            data={payrollDataView?.data}
            pagination={dataPaginationView}
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
              onClick={() => {
                setActiveTab(tab.value);
              }}
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
