'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import { RowActions } from '@/components/tables/row-actions';
import { Can } from '@/components/auth/can';
import dayjs from 'dayjs';
import { formatDate } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { HTTPError } from 'ky';
import {
  BaseSalaryItem,
  RequestBaseSalary,
  ResponseBaseSalary,
} from '@/services/salary/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBaseSalary,
  postBaseSalary,
  putBaseSalary,
  removeBaseSalary,
} from '@/services/salary';
import { ApiErrorResponse, PaginatedResponse } from '@/lib/types';
import { JobLevel } from '@/services/job-levels/types';
import { getJobLevels } from '@/services/job-levels';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { getJobPositionPagination } from '@/services/job-position';
import { useDebounce } from '@/hooks/use-debounce';

async function getErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse;
      if (errorData.message) {
        return errorData.message;
      }
      if (errorData.errors) {
        const firstFieldErrors = Object.values(errorData.errors)[0];
        if (firstFieldErrors?.[0]) {
          return firstFieldErrors[0];
        }
      }
    } catch {
      // fall through to generic message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

// =======================
// Component
// =======================
export default function SettingsBaseSalary() {
  const t = useTranslations('settings');
  const tEmployee = useTranslations('employee');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<BaseSalaryItem | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = React.useState('');
  const [jobLevelFilter, setJobLevelFilter] = React.useState('all');
  const debouncedSearch = useDebounce(searchInput, 400);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
  }, [debouncedSearch, jobLevelFilter]);

  const {
    data: baseSalaryData,
    refetch: baseSalaryDataRefetch,
    isLoading: isBaseSalaryLoading,
  } = useQuery<ResponseBaseSalary>({
    queryKey: [
      'getBaseSalary',
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      jobLevelFilter,
    ],
    queryFn: () =>
      getBaseSalary({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        ...(debouncedSearch.trim()
          ? { search: debouncedSearch.trim() }
          : {}),
        ...(jobLevelFilter !== 'all'
          ? { job_level_id: jobLevelFilter }
          : {}),
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  const { data: jobLevel } = useQuery<PaginatedResponse<JobLevel>>({
    queryKey: ['jobLevel'],
    queryFn: getJobLevels,
    staleTime: 1000 * 60 * 5,
  });

  const { data: jobPosition } = useQuery({
    queryKey: ['job_position_id'],
    queryFn: () =>
      getJobPositionPagination({
        pageSize: 10000,
        pageIndex: 0,
      }),
    retry: (failureCount) => {
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<BaseSalaryItem>[] = [
    {
      accessorKey: 'job_position_id',
      header: tEmployee('positionName'),
      cell: ({ row }) => {
        const selected = jobPosition?.data.filter(
          (item) => item.id === row.original.job_position_id,
        )[0];
        return selected?.name ?? '-';
      },
    },
    {
      accessorKey: 'job_level_id',
      header: tEmployee('jobLevel'),
      cell: ({ row }) => {
        const selected = jobLevel?.data.filter(
          (item) => item.id === row.original.job_level_id,
        )[0];
        return selected?.name ?? '-';
      },
    },
    {
      accessorKey: 'amount',
      header: t('baseSalaryAmount'),
      cell: ({ row }) => `*************`,
      // `Rp ${Number(row.original.amount).toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'effective_date',
      header: t('effectiveDate'),
      cell: ({ row }) =>
        formatDate(row.original.effective_date, locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    {
      accessorKey: 'updated_at',
      header: tCommon('lastUpdate'),
      cell: ({ row }) =>
        row.original.updated_at
          ? formatDate(row.original.updated_at, locale, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : '-',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <RowActions
            onEdit={() => {
              setEditing(item);
              setForm({
                ...item,
                effective_date: dayjs(item.effective_date).format('YYYY-MM-DD'),
                end_date: dayjs(item.end_date).format('YYYY-MM-DD'),
              });
              setOpen(true);
            }}
            onDelete={() => {
              setEditing(item);
              setOpenDelete(true);
            }}
            onDetail={() => {
              setEditing(item);
              setOpenDetail(true);
            }}
            editPermission="payroll_management.employee_salary_structure.edit"
            deletePermission="payroll_management.employee_salary_structure.delete"
          />
        );
      },
    },
  ];

  const saveMutation = useMutation<
    ResponseBaseSalary,
    Error,
    { id?: number; data: RequestBaseSalary }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putBaseSalary(id, data);
      }
      return postBaseSalary(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('baseSalarySaved'));
      queryClient.invalidateQueries({ queryKey: ['getBaseSalary'] });
      baseSalaryDataRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: async (err) => {
      const message = await getErrorMessage(err);
      toast.error(tCommon('saveFailed', { message }));
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ResponseBaseSalary, Error, number>({
    mutationFn: (id) => removeBaseSalary(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('baseSalaryDeleted'));
      queryClient.invalidateQueries({ queryKey: ['getBaseSalary'] });
      baseSalaryDataRefetch();
      setOpenDelete(false);
      setEditing(null);
    },
    onError: async (err) => {
      const message = await getErrorMessage(err);
      toast.error(tCommon('deleteFailed', { message }));
    },
    onSettled: () => setLoading(false),
  });

  // =======================
  // Form State
  // =======================
  const [form, setForm] = React.useState<
    Omit<BaseSalaryItem, 'id' | 'updated_at'>
  >({
    job_position_id: 0,
    job_level_id: 0,
    amount: 0,
    effective_date: '',
    end_date: '',
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (
      !form.job_position_id ||
      !form.job_level_id ||
      !form.amount ||
      !form.effective_date ||
      !form.end_date
    )
      return toast.error(tCommon('fillAllData'));

    saveMutation.mutate({ id: editing?.id, data: form });
  };

  const resetForm = () => {
    setForm({
      job_position_id: 0,
      job_level_id: 0,
      amount: 0,
      effective_date: '',
      end_date: '',
    });
  };

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">{t('baseSalaryManagement')}</h2>
        <Can permission="payroll_management.employee_salary_structure.create">
          <Button
            className="flex flex-row items-center gap-2"
            onClick={() => {
              setEditing(null);
              resetForm();
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t('addBaseSalary')}
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder={t('searchBaseSalary')}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={jobLevelFilter}
          onValueChange={(value) => setJobLevelFilter(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={tEmployee('jobLevel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allJobLevels')}</SelectItem>
            {jobLevel?.data.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={baseSalaryData?.data}
        apiPagination={baseSalaryData?.pagination}
        paginationState={pagination}
        setPaginationState={setPagination}
        loading={isBaseSalaryLoading}
      />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editBaseSalary') : t('setupBaseSalary')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                {tEmployee('positionName')}<span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(form.job_position_id)}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_position_id: Number(val) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tCommon('select')} />
                </SelectTrigger>
                <SelectContent>
                  {jobPosition?.data.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {tEmployee('jobLevel')}<span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(form.job_level_id)}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_level_id: Number(val) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tCommon('select')} />
                </SelectTrigger>
                <SelectContent>
                  {jobLevel?.data.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t('baseSalaryAmount')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Rp 0"
                value={Number(form.amount)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('effectiveDate')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.effective_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    effective_date: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('effectiveTo')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave}>{tCommon('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
          <div className="flex flex-col items-center justify-center mb-4">
            {/* Warning Icon (SVG) */}
            <span className="mb-2">
              <Image
                src={'/icons/deleteContained.svg'}
                width={50}
                height={50}
                alt={`icon-delete`}
              />
            </span>
            <AlertDialogTitle className="text-xl font-bold mb-2">
              {t('deleteConfigurationTitle')}
            </AlertDialogTitle>
            <div className="text-gray-600 text-sm mb-4">
              {t('deleteConfigurationDesc')}
            </div>
          </div>
          <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
            <Button
              className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
              onClick={handleDelete}
              isLoading={loading}
            >
              {t('deleteConfiguration')}
            </Button>
            <Button
              className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
              onClick={() => setOpenDelete(false)}
              disabled={loading}
            >
              {tCommon('cancel')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Detail */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('detailBaseSalary')}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>{tEmployee('positionName')}</Label>
              <Label className="font-semibold">
                {jobPosition?.data.filter(
                  (item) => item.id === editing?.job_position_id,
                )[0]?.name ?? '-'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{tEmployee('jobLevel')}</Label>
              <Label className="font-semibold">
                {jobLevel?.data.filter(
                  (item) => item.id === editing?.job_level_id,
                )[0]?.name ?? '-'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{t('baseSalaryAmount')}</Label>
              <Label className="font-semibold">
                *************
                {/* {`Rp ${Number(editing?.amount).toLocaleString('id-ID')}`} */}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{t('effectiveDate')}</Label>
              <Label className="font-semibold">
                {editing?.effective_date
                  ? formatDate(editing.effective_date, locale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{t('effectiveTo')}</Label>
              <Label className="font-semibold">
                {editing?.end_date
                  ? formatDate(editing.end_date, locale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </Label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              className="bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
              onClick={handleDelete}
              isLoading={loading}
            >
              {tCommon('delete')}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpenDetail(false)}>
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={() => {
                  setOpen(true);
                  setOpenDetail(false);
                  if (editing) {
                    const { id, updated_at, ...rest } = editing;
                    setForm(rest);
                  }
                }}
              >
                {tCommon('edit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
