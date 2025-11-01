'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, CalendarIcon } from 'lucide-react';
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
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
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
      header: 'Allowance Type',
    },
    {
      accessorKey: 'job_levels',
      header: 'Job Level',
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
      header: 'Effective Date',
      cell: ({ row }) =>
        dayjs(row.original.effective_date).format('MMMM D, YYYY') ?? '-',
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Update',
      cell: ({ row }) =>
        dayjs(row.original.updated_at).format('MMMM D, YYYY') ?? '-',
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
                effective_date: item.effective_date,
                expire_date: item.expire_date,
                job_levels: [...item.job_levels],
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
      toast.success('Allowance successfully save');
      queryClient.invalidateQueries({ queryKey: ['getAllowance'] });
      allowanceDataRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<ResponseAllowance, Error, number>({
    mutationFn: (id) => removeAllowance(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Allowance deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['getAllowance'] });
      allowanceDataRefetch();
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
  const [form, setForm] = React.useState<{
    name: string;
    effective_date: string;
    expire_date: string;
    job_levels: { id: number; name: string; amount: string }[];
  }>({
    name: '',
    effective_date: '',
    expire_date: '',
    job_levels: [{ id: 0, name: '', amount: '0' }],
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (!form.name || !form.effective_date || !form.expire_date)
      return toast.error('Please fill all required fields');

    console.log(form);

    const payload = {
      ...form,
      description: '',
      allowance_items: form.job_levels.map((item) => ({
        job_level_id: Number(item.id),
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
      job_levels: [{ id: 0, name: '', amount: '0' }],
    });
  };

  // =======================
  // UI
  // =======================
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">Allowance Management</h2>
        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => {
            setEditing(null);
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Set Up Allowance
        </Button>
      </div>

      <DataTable columns={columns} data={allowanceData?.data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Base Allowance' : 'Set Up Base Allowance'}
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                Allowance Name<span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Transportation"
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
                Effective Date<span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.effective_date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.effective_date
                      ? dayjs(form.effective_date).format('MMMM D, YYYY')
                      : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.effective_date
                        ? new Date(form.effective_date)
                        : undefined
                    }
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        effective_date: date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '',
                      }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                Effective To<span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.expire_date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expire_date
                      ? dayjs(form.expire_date).format('MMMM D, YYYY')
                      : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.expire_date ? new Date(form.expire_date) : undefined
                    }
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        expire_date: date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '',
                      }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <hr className="my-2" />
            <h4 className="font-medium">Base Allowance</h4>

            {form.job_levels.map((jl, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end relative"
              >
                <div className="space-y-2">
                  <Label>
                    Job Level<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={String(jl.id)}
                    onValueChange={(val) => {
                      console.log(val);
                      const arr = [...form.job_levels];
                      arr[idx].id = Number(val);
                      setForm((prev) => ({ ...prev, job_levels: arr }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Job Level" />
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
                      Base Allowance Amount
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Rp 0"
                      value={jl.amount}
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
                    { id: 0, name: '', amount: '0' },
                  ],
                }))
              }
            >
              + Add Assignee
            </Button>
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
