'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { RowActions } from '@/components/tables/row-actions';
import { Can } from '@/components/auth/can';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginatedResponse } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import {
  HolidayList,
  HolidayRequest,
  HolidayResponse,
} from '@/services/holiday/types';
import {
  getHoliday,
  postHoliday,
  putHoliday,
  removeHoliday,
} from '@/services/holiday';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// =======================
// Component
// =======================
export default function SettingsHoliday() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<HolidayList | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  const { data: score, refetch: scoreRefetch } = useQuery<HolidayList[]>({
    queryKey: ['getHolidays'],
    queryFn: () => getHoliday(),
    staleTime: 1000 * 60 * 5,
  });

  const columns: ColumnDef<HolidayList>[] = [
    {
      accessorKey: 'events',
      header: t('events'),
    },
    {
      accessorKey: 'date',
      header: tCommon('date'),
      cell: ({ row }) => {
        return <span>{row.original.date}</span>;
      },
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
                date: item.date,
                events: item.events,
                category: item.category,
                type: item.type,
              });
              setOpen(true);
            }}
            onDelete={() => {
              setEditing(item);
              setOpenDelete(true);
            }}
            editPermission="time_attendance.holiday_attendance.edit"
            deletePermission="time_attendance.holiday_attendance.delete"
          />
        );
      },
    },
  ];

  const saveMutation = useMutation<
    HolidayResponse,
    Error,
    { id?: number; data: HolidayRequest }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putHoliday(id, data);
      }
      return postHoliday(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('holidaySaved'));
      queryClient.invalidateQueries({ queryKey: ['getHolidays'] });
      scoreRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: () => {
      toast.error(t('holidayOverlapError'));
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<HolidayResponse, Error, number>({
    mutationFn: (id) => removeHoliday(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('holidayDeleted'));
      queryClient.invalidateQueries({ queryKey: ['getHolidays'] });
      scoreRefetch();
      setOpenDelete(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(tToast('deleteFailed', { message: err.message }));
    },
    onSettled: () => setLoading(false),
  });

  // =======================
  // Form State
  // =======================
  const [form, setForm] = React.useState<
    Omit<HolidayRequest, 'id' | 'updated_at'>
  >({
    date: '',
    events: '',
    category: 0,
    type: 0,
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (!form.events || !form.date) return toast.error(tToast('fillAllData'));

    saveMutation.mutate({ id: editing?.id, data: form });
  };

  const resetForm = () => {
    setForm({
      date: '',
      events: '',
      category: 0,
      type: 0,
    });
  };

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">{t('holidayList')}</h2>
        <Can permission="time_attendance.holiday_attendance.create">
          <Button
            className="flex flex-row items-center gap-2"
            onClick={() => {
              setEditing(null);
              resetForm();
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t('addHoliday')}
          </Button>
        </Can>
      </div>

      <DataTable columns={columns} data={score} maxBodyHeight={700} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editHoliday') : t('setupHoliday')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                {t('event')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder={t('enterHolidayName')}
                value={form.events}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    events: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {tCommon('date')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                placeholder={t('selectHolidayDate')}
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('type')}<span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) => {
                  setForm((prev) => ({
                    ...prev,
                    type: Number(val),
                  }));
                }}
                value={String(form.type)}
                defaultValue={String(form.type)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('public')}</SelectItem>
                  <SelectItem value="1">{t('national')}</SelectItem>
                  <SelectItem value="2">{t('religious')}</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}
