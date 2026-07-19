'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AllowanceItem,
  RequestAllowance,
  ResponseAllowance,
} from '@/services/salary/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllowance,
  postAllowance,
  putAllowance,
  removeAllowance,
} from '@/services/salary';
import { PaginatedResponse } from '@/lib/types';
import { JobLevel } from '@/services/job-levels/types';
import { getJobLevels } from '@/services/job-levels';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

// =======================
// Component
// =======================
export default function SettingsBaseAllowance() {
  const t = useTranslations('settings');
  const tEmployee = useTranslations('employee');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<AllowanceItem | null>(null);
  const queryClient = useQueryClient();

  const { data: allowanceData, refetch: allowanceDataRefetch } =
    useQuery<ResponseAllowance>({
      queryKey: ['getAllowance'],
      queryFn: getAllowance,
      staleTime: 1000 * 60 * 5,
    });

  const { data: jobLevel } = useQuery<PaginatedResponse<JobLevel>>({
    queryKey: ['jobLevel'],
    queryFn: getJobLevels,
    staleTime: 1000 * 60 * 5,
  });

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<AllowanceItem>[] = [
    {
      accessorKey: 'name',
      header: t('allowanceType'),
    },
    {
      accessorKey: 'job_levels',
      header: tEmployee('jobLevel'),
      meta: {
        className: 'min-w-[300px] w-[340px]',
      },
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.job_levels.slice(0, 4).map((lv) => (
            <span
              key={lv.name}
              className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
            >
              {lv.name}
            </span>
          ))}
          {row.original.job_levels.length > 4 && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
              +{row.original.job_levels.length - 4}
            </span>
          )}
        </div>
      ),
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
        formatDate(row.original.updated_at, locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
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
                name: item.name,
                effective_date: dayjs(item.effective_date).format('YYYY-MM-DD'),
                expire_date: dayjs(item.expire_date).format('YYYY-MM-DD'),
                job_levels: [...item.job_levels],
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
            editPermission="payroll_management.allowances_config.edit"
            deletePermission="payroll_management.allowances_config.delete"
          />
        );
      },
    },
  ];

  const saveMutation = useMutation<
    ResponseAllowance,
    Error,
    { id?: number; data: RequestAllowance }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putAllowance(id, data);
      }
      return postAllowance(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('allowanceSaved'));
      queryClient.invalidateQueries({ queryKey: ['getAllowance'] });
      allowanceDataRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(tCommon('saveFailed', { message: err.message }));
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ResponseAllowance, Error, number>({
    mutationFn: (id) => removeAllowance(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('allowanceDeleted'));
      queryClient.invalidateQueries({ queryKey: ['getAllowance'] });
      allowanceDataRefetch();
      setOpenDelete(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(tCommon('deleteFailed', { message: err.message }));
    },
    onSettled: () => setLoading(false),
  });

  // =======================
  // Form State
  // =======================
  const [form, setForm] = React.useState<{
    name: string;
    effective_date: string;
    expire_date: string;
    job_levels: {
      id: number;
      job_level_id: number;
      name: string;
      amount: string;
    }[];
  }>({
    name: '',
    effective_date: '',
    expire_date: '',
    job_levels: [{ id: 0, job_level_id: 0, name: '', amount: '0' }],
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (!form.name || !form.effective_date || !form.expire_date)
      return toast.error(t('fillRequiredFields'));

    const payload = {
      ...form,
      description: '',
      allowance_items: form.job_levels.map((item) => ({
        job_level_id: Number(item.job_level_id),
        amount: Number(item.amount),
      })),
    };

    saveMutation.mutate({ id: editing?.id, data: payload });
  };

  const resetForm = () => {
    setForm({
      name: '',
      effective_date: '',
      expire_date: '',
      job_levels: [{ id: 0, job_level_id: 0, name: '', amount: '0' }],
    });
  };

  // =======================
  // UI
  // =======================
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">{t('allowanceManagement')}</h2>
        <Can permission="payroll_management.allowances_config.create">
          <Button
            className="flex flex-row items-center gap-2"
            onClick={() => {
              setEditing(null);
              resetForm();
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t('setupAllowance')}
          </Button>
        </Can>
      </div>

      <DataTable columns={columns} data={allowanceData?.data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editBaseAllowance') : t('setupBaseAllowance')}
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                {t('allowanceName')}<span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={t('transportationPlaceholder')}
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
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
                value={form.expire_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expire_date: e.target.value,
                  }))
                }
              />
            </div>

            <hr className="my-2" />
            <h4 className="font-medium">{t('baseAllowance')}</h4>

            {form.job_levels.map((jl, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end relative"
              >
                <div className="space-y-2">
                  <Label>
                    {tEmployee('jobLevel')}<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={String(jl.job_level_id)}
                    onValueChange={(val) => {
                      console.log(val);
                      const arr = [...form.job_levels];
                      arr[idx].job_level_id = Number(val);
                      setForm((prev) => ({ ...prev, job_levels: arr }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('selectJobLevel')} />
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

                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>
                      {t('baseAllowanceAmount')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Rp 0"
                      value={Number(jl.amount)}
                      onChange={(e) => {
                        const arr = [...form.job_levels];
                        arr[idx].amount = e.target.value;
                        setForm((prev) => ({ ...prev, job_levels: arr }));
                      }}
                    />
                  </div>

                  {form.job_levels.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          job_levels: prev.job_levels.filter(
                            (_, i) => i !== idx,
                          ),
                        }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="text-blue-600 w-fit mt-2 text-secondary border-secondary"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  job_levels: [
                    ...prev.job_levels,
                    { id: 0, job_level_id: 0, name: '', amount: '0' },
                  ],
                }))
              }
            >
              {t('addJobLevel')}
            </Button>
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
            <DialogTitle>{t('detailAllowance')}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>{t('allowanceName')}</Label>
              <Label className="font-semibold">{editing?.name}</Label>
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
                {editing?.expire_date
                  ? formatDate(editing.expire_date, locale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </Label>
            </div>

            <hr />
            <h1>{t('baseAllowance')}</h1>

            {editing?.job_levels.map((jl, idx) => (
              <div className="flex gap-3" key={idx}>
                <Label>#{idx + 1}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end relative">
                  <div className="space-y-2">
                    <Label>{tEmployee('jobLevel')}</Label>
                    <Label className="font-semibold">
                      {jobLevel?.data.filter(
                        (item) => item.id === jl.job_level_id,
                      )[0]?.name ?? '-'}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>{t('baseAllowanceAmount')}</Label>
                      <Label className="font-semibold">
                        {`Rp ${Number(jl.amount).toLocaleString('id-ID')}`}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
