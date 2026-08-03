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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { ScoreList, ScoreRequest, ScoreResponse } from '@/services/score/types';
import { getScore, postScore, putScore, removeScore } from '@/services/score';

// =======================
// Component
// =======================
export default function SettingsScore() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');
  const tValidation = useTranslations('validation');
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<ScoreList | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  const { data: score, refetch: scoreRefetch } = useQuery<ScoreResponse>({
    queryKey: ['getScores', pagination],
    queryFn: () => getScore(pagination),
    staleTime: 1000 * 60 * 5,
  });

  const columns: ColumnDef<ScoreList>[] = [
    {
      accessorKey: 'score',
      header: t('scoreLabel'),
    },
    {
      accessorKey: 'score_range',
      header: t('scoreRange'),
      cell: ({ row }) => {
        return (
          <span>
            {row.original.min_value} - {row.original.max_value}
          </span>
        );
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
                score: item.score,
                min_value: item.min_value,
                max_value: item.max_value,
              });
              setOpen(true);
            }}
            onDelete={() => {
              setEditing(item);
              setOpenDelete(true);
            }}
            editPermission="performance_settings.assessment_score_threshold.edit"
            deletePermission="performance_settings.assessment_score_threshold.delete"
          />
        );
      },
    },
  ];

  const saveMutation = useMutation<
    ScoreResponse,
    Error,
    { id?: number; data: ScoreRequest }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putScore(id, data);
      }
      return postScore(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('scoreSaved'));
      queryClient.invalidateQueries({ queryKey: ['getScores'] });
      scoreRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: () => {
      toast.error(t('scoreOverlapError'));
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ScoreResponse, Error, number>({
    mutationFn: (id) => removeScore(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success(t('scoreDeleted'));
      queryClient.invalidateQueries({ queryKey: ['getScores'] });
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
    Omit<ScoreRequest, 'id' | 'updated_at'>
  >({
    score: '',
    min_value: 0,
    max_value: 0,
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (!form.score || !form.max_value)
      return toast.error(tToast('fillAllData'));

    if (form.min_value > form.max_value)
      return toast.error(tValidation('scoreOverlap'));

    saveMutation.mutate({ id: editing?.id, data: form });
  };

  const resetForm = () => {
    setForm({
      score: '',
      min_value: 0,
      max_value: 0,
    });
  };

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">{t('scoreThreshold')}</h2>
        <Can permission="performance_settings.assessment_score_threshold.create">
          <Button
            className="flex flex-row items-center gap-2"
            onClick={() => {
              setEditing(null);
              resetForm();
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t('addScore')}
          </Button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={score?.data}
        apiPagination={score?.pagination}
        paginationState={pagination}
        setPaginationState={setPagination}
      />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editScore') : t('setupScore')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                {t('scoreLabel')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder={t('enterScoreName')}
                value={form.score}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    score: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('minimumScore')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder={t('enterMinScore')}
                value={Number(form.min_value)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    min_value: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('maximumScore')}<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder={t('enterMaxScore')}
                value={Number(form.max_value)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    max_value: Number(e.target.value),
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
    </div>
  );
}
