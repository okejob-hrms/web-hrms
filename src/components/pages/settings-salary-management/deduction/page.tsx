'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

// =======================
// Types
// =======================
interface DeductionItem {
  id: string;
  deduction_name: string;
  effective_date: string;
  deduction_type: string;
  effective_to: string;
  updated_at: string;
  rules?: { min_income: number; max_income: number; tax_rate: number }[];
  contributions?: { employer: string; employee: string };
}

// =======================
// Component
// =======================
export default function SettingsSalaryDeduction() {
  const [data, setData] = React.useState<DeductionItem[]>([
    {
      id: '1',
      deduction_name: 'PPH21',
      deduction_type: 'Staturory',
      effective_date: '2025-10-16',
      effective_to: '',
      updated_at: '2025-10-16',
      contributions: { employer: '4', employee: 'Progressive' },
      rules: [
        { min_income: 0, max_income: 60000000, tax_rate: 5 },
        { min_income: 60000000, max_income: 250000000, tax_rate: 15 },
      ],
    },
    {
      id: '2',
      deduction_name: 'BPJS',
      deduction_type: 'Staturory',
      effective_date: '2025-10-20',
      effective_to: '',
      updated_at: '2025-10-20',
      contributions: { employer: '4', employee: '1' },
    },
  ]);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DeductionItem | null>(null);

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<DeductionItem>[] = [
    {
      accessorKey: 'deduction_name',
      header: 'Deduction Name',
    },
    {
      accessorKey: 'deduction_type',
      header: 'Deduction Type',
    },
    {
      accessorKey: 'contributions.employer',
      header: 'Employer Contribution',
    },
    {
      accessorKey: 'contributions.employee',
      header: 'Employee Contribution',
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
                deduction_name: item.deduction_name,
                deduction_type: item.deduction_type,
                effective_date: item.effective_date,
                effective_to: item.effective_to,
                rules: item.rules || [
                  { min_income: 0, max_income: 0, tax_rate: 0 },
                ],
                contributions: item.contributions || {
                  employer: '0',
                  employee: '0',
                },
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
    deduction_name: string;
    effective_date: string;
    deduction_type: string;
    effective_to: string;
    rules: { min_income: number; max_income: number; tax_rate: number }[];
    contributions: { employer: string; employee: string };
  }>({
    deduction_name: '',
    effective_date: '',
    deduction_type: '',
    effective_to: '',
    rules: [{ min_income: 0, max_income: 0, tax_rate: 0 }],
    contributions: { employer: '0', employee: '0' },
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this deduction?')) {
      setData((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSave = () => {
    if (!form.deduction_name || !form.effective_date)
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
      toast.success('Successfully updated deduction');
    } else {
      setData((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          ...form,
          updated_at: dayjs().format('YYYY-MM-DD'),
        },
      ]);
      toast.success('Successfully added deduction');
    }

    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      deduction_name: '',
      effective_date: '',
      deduction_type: '',
      effective_to: '',
      rules: [{ min_income: 0, max_income: 0, tax_rate: 0 }],
      contributions: { employer: '0', employee: '0' },
    });
  };

  // =======================
  // UI
  // =======================
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
        <h2 className="font-semibold text-xl">Salary Deduction Management</h2>
        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => {
            setEditing(null);
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Set Up Salary Deduction
        </Button>
      </div>

      <DataTable columns={columns} data={data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Salary Deduction' : 'Set Up Salary Deduction'}
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                Deduction Name<span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.deduction_name}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, deduction_name: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Deduction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PPH21">PPH21</SelectItem>
                  <SelectItem value="BPJS">BPJS</SelectItem>
                  <SelectItem value="JHT">JHT</SelectItem>
                  <SelectItem value="Pension">Pension</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Deduction Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.deduction_type}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, deduction_type: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Statutory">Statutory</SelectItem>
                  <SelectItem value="Voluntary">Voluntary</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Effective Date <span className="text-red-500">*</span>
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
                <Label>Effective To</Label>
                <Input
                  type="date"
                  value={form.effective_to}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      effective_to: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <hr className="my-2" />

            <h4 className="font-medium">Contribution</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Employer Contribution (%)</Label>
                <Input
                  type="number"
                  value={form.contributions.employer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contributions: {
                        ...prev.contributions,
                        employer: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Employee Contribution (%)</Label>
                <Input
                  type="number"
                  value={form.contributions.employee}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contributions: {
                        ...prev.contributions,
                        employee: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {form.deduction_name === 'PPH21' && (
              <>
                <hr className="my-2" />

                <h4 className="font-medium">Tiered Rules</h4>
                {form.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
                  >
                    <div className="space-y-1">
                      <Label>Min Income</Label>
                      <Input
                        type="number"
                        value={rule.min_income}
                        onChange={(e) => {
                          const arr = [...form.rules];
                          arr[idx].min_income = Number(e.target.value);
                          setForm((prev) => ({ ...prev, rules: arr }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Max Income</Label>
                      <Input
                        type="number"
                        value={rule.max_income}
                        onChange={(e) => {
                          const arr = [...form.rules];
                          arr[idx].max_income = Number(e.target.value);
                          setForm((prev) => ({ ...prev, rules: arr }));
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          value={rule.tax_rate}
                          onChange={(e) => {
                            const arr = [...form.rules];
                            arr[idx].tax_rate = Number(e.target.value);
                            setForm((prev) => ({ ...prev, rules: arr }));
                          }}
                        />
                      </div>
                      {form.rules.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              rules: prev.rules.filter((_, i) => i !== idx),
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
                  className="text-blue-600 w-fit mt-2"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      rules: [
                        ...prev.rules,
                        { min_income: 0, max_income: 0, tax_rate: 0 },
                      ],
                    }))
                  }
                >
                  + Add Rule
                </Button>
              </>
            )}
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
