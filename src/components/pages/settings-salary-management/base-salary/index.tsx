'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, CalendarIcon } from 'lucide-react';
import { RowActions } from '@/components/tables/row-actions';
import dayjs from 'dayjs';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
import { getJobPositionPagination } from '@/services/job-position';

// =======================
// Component
// =======================
export default function SettingsBaseSalary() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<BaseSalaryItem | null>(null);
  const queryClient = useQueryClient();

  const { data: baseSalaryData, refetch: baseSalaryDataRefetch } =
    useQuery<ResponseBaseSalary>({
      queryKey: ['getBaseSalary'],
      queryFn: () => getBaseSalary(),
      staleTime: 1000 * 60 * 5,
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
      header: 'Job Position',
      cell: ({ row }) => {
        const selected = jobPosition?.data.filter(
          (item) => item.id === row.original.job_position_id,
        )[0];
        return selected?.name ?? '-';
      },
    },
    {
      accessorKey: 'job_level_id',
      header: 'Job Level',
      cell: ({ row }) => {
        const selected = jobLevel?.data.filter(
          (item) => item.id === row.original.job_level_id,
        )[0];
        return selected?.name ?? '-';
      },
    },
    {
      accessorKey: 'amount',
      header: 'Base Salary Amount',
      cell: ({ row }) => `*************`,
      // `Rp ${Number(row.original.amount).toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'effective_date',
      header: 'Effective Date',
      cell: ({ row }) =>
        dayjs(row.original.effective_date).format('MMMM D, YYYY'),
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Update',
      cell: ({ row }) => dayjs(row.original.updated_at).format('MMMM D, YYYY'),
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
      toast.success('Base salary successfully save');
      queryClient.invalidateQueries({ queryKey: ['getBaseSalary'] });
      baseSalaryDataRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ResponseBaseSalary, Error, number>({
    mutationFn: (id) => removeBaseSalary(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Base salary deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['getBaseSalary'] });
      baseSalaryDataRefetch();
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
      return toast.error('Please fill all data!');

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
        <h2 className="font-semibold text-xl">Base Salary Management</h2>
        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => {
            setEditing(null);
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Base Salary
        </Button>
      </div>

      <DataTable columns={columns} data={baseSalaryData?.data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Base Salary' : 'Set Up Base Salary'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                Job Position<span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(form.job_position_id)}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_position_id: Number(val) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
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
                Job Level<span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(form.job_level_id)}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_level_id: Number(val) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
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
                Base Salary Amount<span className="text-red-500">*</span>
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
                Effective Date<span className="text-red-500">*</span>
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
                Effective To<span className="text-red-500">*</span>
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

      {/* Modal Detail */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Detail Base Salary</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Job Position</Label>
              <Label className="font-semibold">
                {jobPosition?.data.filter(
                  (item) => item.id === editing?.job_position_id,
                )[0]?.name ?? '-'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Job Level</Label>
              <Label className="font-semibold">
                {jobLevel?.data.filter(
                  (item) => item.id === editing?.job_level_id,
                )[0]?.name ?? '-'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Base Salary Amount</Label>
              <Label className="font-semibold">
                *************
                {/* {`Rp ${Number(editing?.amount).toLocaleString('id-ID')}`} */}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Label className="font-semibold">
                {dayjs(editing?.effective_date).format('MMMM D, YYYY')}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Effective To</Label>
              <Label className="font-semibold">
                {dayjs(editing?.end_date).format('MMMM D, YYYY')}
              </Label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              className="bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
              onClick={handleDelete}
              isLoading={loading}
            >
              Delete
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpenDetail(false)}>
                Cancel
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
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
