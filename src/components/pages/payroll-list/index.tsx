'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit3, Ellipsis, Eye, Plus, Search, Trash, X } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { getStatusGeneratingPayroll, getStatusPayroll } from '@/lib/helpers';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { usePayroll } from './hook';
import { Filters } from './types';
import PayrunsAddModal from './section/add-modal';
import { formatCurrency } from '@/lib/utils';
import { ResponsePayrollItem } from '@/services/payroll/types';

export const PayrollList = () => {
  const router = useRouter();
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');

  const {
    payrollData,
    dataPagination,
    pagination,
    setPagination,
    setOpenAdd,
    openAdd,
    setFilters,
    filters,
    handleAddGroup,
    formData,
    setFormData,
    handleRegenerate,
  } = usePayroll();

  const columns: ColumnDef<ResponsePayrollItem>[] = [
    {
      accessorKey: 'period_label',
      header: t('payruns'),
      size: 200,
    },
    {
      id: 'total_payslips',
      accessorKey: 'total',
      header: t('totalPayslip'),
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-800">
          {formatCurrency(Number(row.original.total_payslips))}
        </span>
      ),
    },
    {
      id: 'total_gross_pay',
      accessorKey: 'total',
      header: t('totalPay'),
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-400">
          Rp{' '}
          <span className="text-gray-800">
            {formatCurrency(Number(row.original.total_gross_pay))}
          </span>
        </span>
      ),
    },
    // {
    //   accessorKey: 'send_payslip',
    //   header: 'Send Payslip Date',
    //   size: 200,
    //   cell: ({ row }) =>
    //     row.original.send_payslip_at
    //       ? dayjs(row.original.send_payslip_at).format('MMMM D, YYYY')
    //       : '-',
    // },
    {
      accessorKey: 'payslip_status',
      header: t('payslipStatus'),
      size: 160,
      cell: ({ row }) => {
        const status = row.original.status_label;
        const { variant, className, key } = getStatusPayroll(status);
        if (!row.original.status_label) return '-';

        return (
          <StatusBadge statusKey={key} variant={variant} className={className} />
        );
      },
    },
    {
      accessorKey: 'generation_status_label',
      header: t('generationStatus'),
      size: 160,
      cell: ({ row }) => {
        const status = row.original.generation_status_label;
        const { variant, className, key } =
          getStatusGeneratingPayroll(status);
        if (!row.original.generation_status_label) return '-';

        return (
          <StatusBadge statusKey={key} variant={variant} className={className} />
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: tCommon('lastUpdated'),
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
            {row.original.generation_status === 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-grayscale-30" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link
                      href={`/payroll/list/${row.original.id}`}
                      className="flex gap-2 justify-between items-center"
                    >
                      <Eye />
                      {t('payrunDetails')}
                    </Link>
                  </DropdownMenuItem>
                  {!row.original.can_be_sent && (
                    <DropdownMenuItem>
                      <Link
                        href={`/payroll/list/${row.original.id}/edit`}
                        className="flex gap-2 justify-between items-center"
                      >
                        <Edit3 />
                        {t('editPayrun')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {row.original.generation_status === 3 && (
              <Button
                variant="outline"
                className="border-red-600 text-red-600"
                onClick={() => {
                  handleRegenerate(String(row.original.id));
                }}
              >
                {tCommon('regenerate')}
              </Button>
            )}
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

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 md:px-[40px] px-6">
      <div className="flex flex-col justify-between gap-6 mt-5">
        <Form {...form}>
          <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
            <InputForm
              name="search"
              placeholder={t('searchPayrun')}
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
            <h2 className="font-semibold text-xl">{t('payruns')}</h2>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus /> {t('newPayrun')}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={payrollData?.data}
            pagination={dataPagination}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        </div>

        <PayrunsAddModal
          onUpdate={() => handleAddGroup(formData)}
          isOpen={openAdd}
          setIsOpen={(e) => setOpenAdd(e)}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};
