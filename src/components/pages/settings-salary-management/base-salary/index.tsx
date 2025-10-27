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
import { formatCurrency } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =======================
// Data Type
// =======================
interface BaseSalaryItem {
  id: string;
  job_position: string;
  job_level: string;
  base_salary_amount: number;
  effective_date: string;
  updated_at: string;
}

// =======================
// Component
// =======================
export default function SettingsBaseSalary() {
  const [data, setData] = React.useState<BaseSalaryItem[]>([
    {
      id: '1',
      job_position: 'Product Designer',
      job_level: 'Team Leader',
      base_salary_amount: 20000000,
      effective_date: '2018-12-02',
      updated_at: '2018-12-02',
    },
    {
      id: '2',
      job_position: 'Front End Engineer',
      job_level: 'Senior Staff',
      base_salary_amount: 18000000,
      effective_date: '2017-08-07',
      updated_at: '2017-08-07',
    },
  ]);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BaseSalaryItem | null>(null);

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<BaseSalaryItem>[] = [
    { accessorKey: 'job_position', header: 'Job Position' },
    { accessorKey: 'job_level', header: 'Job Level' },
    {
      accessorKey: 'base_salary_amount',
      header: 'Base Salary Amount',
      cell: ({ row }) =>
        `Rp ${row.original.base_salary_amount.toLocaleString('id-ID')}`,
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
              setForm(item);
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
  const [form, setForm] = React.useState<
    Omit<BaseSalaryItem, 'id' | 'updated_at'>
  >({
    job_position: '',
    job_level: '',
    base_salary_amount: 0,
    effective_date: '',
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      setData((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSave = () => {
    if (
      !form.job_position ||
      !form.job_level ||
      !form.base_salary_amount ||
      !form.effective_date
    )
      return toast.error('Please fill all data!');

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
      toast.success('Success updated base salary data');
    } else {
      setData((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          ...form,
          updated_at: dayjs().format('YYYY-MM-DD'),
        },
      ]);
      toast.success('Success add base salary data');
    }

    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      job_position: '',
      job_level: '',
      base_salary_amount: 0,
      effective_date: '',
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
          Set Up Base Salary
        </Button>
      </div>

      <DataTable columns={columns} data={data} />

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
                value={form.job_position}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_position: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Designer">
                    Product Designer
                  </SelectItem>
                  <SelectItem value="Front End Engineer">
                    Front End Engineer
                  </SelectItem>
                  <SelectItem value="Back End Engineer">
                    Back End Engineer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Job Level<span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.job_level}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, job_level: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior Staff">Junior Staff</SelectItem>
                  <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                  <SelectItem value="Team Leader">Team Leader</SelectItem>
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
                value={form.base_salary_amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    base_salary_amount: Number(e.target.value),
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
