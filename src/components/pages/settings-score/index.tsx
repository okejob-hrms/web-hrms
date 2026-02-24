'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { RowActions } from '@/components/tables/row-actions';
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
import { ScoreList, ScoreRequest, ScoreResponse } from '@/services/score/types';
import { getScore, postScore, putScore, removeScore } from '@/services/score';

// =======================
// Component
// =======================
export default function SettingsScore() {
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

  const dataPagination: PaginatedResponse<ScoreList> = {
    current_page: score?.pagination.current_page ?? 1,
    current_page_url: `${score?.pagination.first ?? ''}`,
    first_page_url: score?.pagination.first ?? '',
    from: score?.pagination.from ?? 0,
    last_page: score?.pagination.last_page ?? 1,
    next_page_url: score?.pagination.next ?? null,
    path: 'api/v1/setting/score-thresholds',
    per_page: score?.pagination.per_page ?? 10,
    prev_page_url: score?.pagination.prev ?? null,
    to: score?.pagination.to ?? 0,
    total: score?.pagination.total ?? 0,
    data: score?.data ?? [],
  };

  const columns: ColumnDef<ScoreList>[] = [
    {
      accessorKey: 'score',
      header: 'Score Label',
    },
    {
      accessorKey: 'score_range',
      header: 'Score Range',
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
      toast.success('Score successfully save');
      queryClient.invalidateQueries({ queryKey: ['getScores'] });
      scoreRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(
        `The score range overlaps with an existing range for this tenant`,
      );
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ScoreResponse, Error, number>({
    mutationFn: (id) => removeScore(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Score deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['getScores'] });
      scoreRefetch();
      setOpenDelete(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
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
      return toast.error('Please fill all data!');

    if (form.min_value > form.max_value)
      return toast.error('The score range overlaps!');

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
        <h2 className="font-semibold text-xl">Score Threshold</h2>
        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => {
            setEditing(null);
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Score
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={score?.data}
        pagination={dataPagination}
        paginationState={pagination}
        setPaginationState={setPagination}
      />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Score Threshold' : 'Set Up Score Threshold'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                Score Label<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter score name"
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
                Minimum Score<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter min score"
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
                Maximum Score<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter max score"
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
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
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
              Are you sure you want to delete this configuration?
            </AlertDialogTitle>
            <div className="text-gray-600 text-sm mb-4">
              Employees linked to this configuration may be affected
            </div>
          </div>
          <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
            <Button
              className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
              onClick={handleDelete}
              isLoading={loading}
            >
              Delete Configuration
            </Button>
            <Button
              className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
              onClick={() => setOpenDelete(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
