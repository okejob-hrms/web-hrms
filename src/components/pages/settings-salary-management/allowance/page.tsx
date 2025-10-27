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

// =======================
// Types
// =======================
interface BaseAllowanceItem {
  id: string;
  allowance_type: string;
  job_levels: { job_level: string; base_allowance_amount: number }[];
  effective_date: string;
  updated_at: string;
}

// =======================
// Component
// =======================
export default function SettingsBaseAllowance() {
  const [data, setData] = React.useState<BaseAllowanceItem[]>([
    {
      id: '1',
      allowance_type: 'Telecommunication',
      job_levels: [
        { job_level: 'Manager', base_allowance_amount: 1000000 },
        { job_level: 'Staff', base_allowance_amount: 300000 },
      ],
      effective_date: '2025-10-16',
      updated_at: '2025-10-16',
    },
  ]);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BaseAllowanceItem | null>(null);

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<BaseAllowanceItem>[] = [
    {
      accessorKey: 'allowance_type',
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
              key={lv.job_level}
              className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
            >
              {lv.job_level}
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
                allowance_type: item.allowance_type,
                effective_date: item.effective_date,
                job_levels: [...item.job_levels],
              });
              setOpen(true);
            }}
            onDelete={() => handleDelete(item.id)}
          />
        );
      },
    },
  ];

  // =======================
  // Form State
  // =======================
  const [form, setForm] = React.useState<{
    allowance_type: string;
    effective_date: string;
    job_levels: { job_level: string; base_allowance_amount: number }[];
  }>({
    allowance_type: '',
    effective_date: '',
    job_levels: [{ job_level: '', base_allowance_amount: 0 }],
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      setData((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSave = () => {
    if (!form.allowance_type || !form.effective_date)
      return toast.error('Please fill all required fields');

    if (editing) {
      setData((prev) =>
        prev.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                ...form,
                updated_at: dayjs().format('YYYY-MM-DD'),
              }
            : i,
        ),
      );
      toast.success('Success updated allowance data');
    } else {
      setData((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          ...form,
          updated_at: dayjs().format('YYYY-MM-DD'),
        },
      ]);
      toast.success('Success add allowance data');
    }

    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      allowance_type: '',
      effective_date: '',
      job_levels: [{ job_level: '', base_allowance_amount: 0 }],
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

      <DataTable columns={columns} data={data} />

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
                value={form.allowance_type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    allowance_type: e.target.value,
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
                    value={jl.job_level}
                    onValueChange={(val) => {
                      const arr = [...form.job_levels];
                      arr[idx].job_level = val;
                      setForm((prev) => ({ ...prev, job_levels: arr }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Job Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Team Leader">Team Leader</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Senior Staff">Senior Staff</SelectItem>
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
                      value={jl.base_allowance_amount}
                      onChange={(e) => {
                        const arr = [...form.job_levels];
                        arr[idx].base_allowance_amount = Number(e.target.value);
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
                    { job_level: '', base_allowance_amount: 0 },
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
    </div>
  );
}
