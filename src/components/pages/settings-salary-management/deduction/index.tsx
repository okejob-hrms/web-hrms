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
import {
  DeductionSalaryItem,
  DeductionSalaryTier,
  RequestDeductionSalary,
} from '@/services/salary/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDeductionSalary,
  postDeductionSalary,
  putDeductionSalary,
  removeDeductionSalary,
} from '@/services/salary';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ApiResponse, PaginatedResponse } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { toTitleCase } from '@/lib/menu';

export default function SettingsSalaryDeduction() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<DeductionSalaryItem | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data: deductionData, refetch: deductionDataRefetch } = useQuery({
    queryKey: ['getDeductionSalary'],
    queryFn: getDeductionSalary,
    staleTime: 1000 * 60 * 5,
  });

  // =======================
  // Columns
  // =======================
  const columns: ColumnDef<DeductionSalaryItem>[] = [
    {
      accessorKey: 'name',
      header: 'Deduction Name',
    },
    {
      accessorKey: 'deduction_type',
      header: 'Deduction Type',
      cell: ({ row }) => toTitleCase(row.original.deduction_type),
    },
    {
      accessorKey: 'employer_contribution',
      header: 'Employer Contribution',
      cell: ({ row }) =>
        row.original.contribution_type === 'fixed_amount'
          ? `Rp ${Number(row.original.employer_contribution).toLocaleString('id-ID')}`
          : `${Number(row.original.employer_contribution)}%`,
    },
    {
      accessorKey: 'employee_contribution',
      header: 'Employee Contribution',
      cell: ({ row }) =>
        row.original.contribution_type === 'fixed_amount'
          ? `Rp ${Number(row.original.employee_contribution).toLocaleString('id-ID')}`
          : `${Number(row.original.employee_contribution)}%`,
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
                deduction_type: item.deduction_type,
                effective_date: item.effective_date,
                effective_to: item.effective_to,
                description: item.description,
                tiers: item.tiers || [],
                employee_contribution: item.employee_contribution,
                employer_contribution: item.employer_contribution,
                calculation_basis: item.calculation_basis,
                contribution_type: item.contribution_type,
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
    ApiResponse<PaginatedResponse<DeductionSalaryItem>>,
    Error,
    { id?: number; data: RequestDeductionSalary }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putDeductionSalary(id, data);
      }
      return postDeductionSalary(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Deduction salary successfully save');
      queryClient.invalidateQueries({ queryKey: ['getDeductionSalary'] });
      deductionDataRefetch();
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<
    ApiResponse<PaginatedResponse<DeductionSalaryItem>>,
    Error,
    number
  >({
    mutationFn: (id) => removeDeductionSalary(id),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Deduction salary deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['getDeductionSalary'] });
      deductionDataRefetch();
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
    deduction_type: string;
    effective_date: string;
    effective_to: string;
    employee_contribution: string;
    employer_contribution: string;
    description: string;
    calculation_basis: string;
    contribution_type: string;
    tiers: DeductionSalaryTier[];
  }>({
    name: '',
    effective_date: '',
    deduction_type: '',
    effective_to: '',
    tiers: [],
    description: '',
    employee_contribution: '',
    employer_contribution: '',
    calculation_basis: '',
    contribution_type: '',
  });

  const handleDelete = () => {
    if (editing) {
      deleteMutation.mutate(Number(editing.id));
    }
  };

  const handleSave = () => {
    if (!form.name || !form.effective_date)
      return toast.error('Please fill all required fields');
    console.log(form);

    saveMutation.mutate({
      id: editing?.id,
      data: {
        ...form,
        status: 1,
        tiers: form.name === 'PPH21' ? form.tiers : [],
      },
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      deduction_type: '',
      effective_date: '',
      effective_to: '',
      tiers: [],
      description: '',
      employee_contribution: '',
      employer_contribution: '',
      calculation_basis: '',
      contribution_type: '',
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

      <DataTable columns={columns} data={deductionData?.data.data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`${form.name === 'PPH21' ? 'w-full md:max-w-6xl' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto bg-white`}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Salary Deduction' : 'Set Up Salary Deduction'}
            </DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div
            className={`${form.name === 'PPH21' ? 'grid md:grid-cols-2 gap-4 md:gap-10' : 'grid gap-4'}`}
          >
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>
                  Deduction Name<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.name}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, name: val }))
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
                    <SelectItem value="statutory">Statutory</SelectItem>
                    <SelectItem value="company_policy">
                      Company Policy
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  className="resize-none h-[135px] whitespace-pre-wrap break-all"
                  rows={5}
                  placeholder="Enter description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
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
              {form.name === 'PPH21' ? (
                <div className="space-y-2">
                  <Label>
                    Calculation Basis <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.calculation_basis}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, calculation_basis: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Calculation Basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gross_salary">Gross Salary</SelectItem>
                      <SelectItem value="Voluntary">Base Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2 mb-2">
                  <Label>
                    Contribution Type <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    defaultValue="percentage"
                    className="flex items-center space-x-2"
                    value={form.contribution_type}
                    onValueChange={(val) => {
                      setForm((prev) => ({
                        ...prev,
                        contribution_type: String(val),
                      }));
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Percentage (%)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed_amount" id="fixed_amount" />
                      <Label htmlFor="fixed_amount">Fixed Amount</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>
                    Employer Contribution{' '}
                    {form.contribution_type === 'fixed_amount'
                      ? '(Fixed)'
                      : '(%)'}
                  </Label>
                  <Input
                    type="number"
                    value={Number(form.employer_contribution)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        employer_contribution: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Employee Contribution{' '}
                    {form.contribution_type === 'fixed_amount'
                      ? '(Fixed)'
                      : '(%)'}
                  </Label>
                  <Input
                    type="number"
                    value={Number(form.employee_contribution)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        employee_contribution: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              {form.name === 'PPH21' && (
                <>
                  <h4 className="font-medium mb-3">Tiered Rules</h4>
                  {form.tiers.map((rule, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end mb-2"
                    >
                      <div className="space-y-2">
                        <Label>Min Income</Label>
                        <Input
                          type="number"
                          value={Number(rule.min_income)}
                          onChange={(e) => {
                            const arr = [...form.tiers];
                            arr[idx].min_income = e.target.value;
                            setForm((prev) => ({ ...prev, tiers: arr }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Income</Label>
                        <Input
                          type="number"
                          value={Number(rule.max_income)}
                          onChange={(e) => {
                            const arr = [...form.tiers];
                            arr[idx].max_income = e.target.value;
                            setForm((prev) => ({ ...prev, tiers: arr }));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Tax Rate (%)</Label>
                          <Input
                            type="number"
                            value={Number(rule.tax_rate)}
                            onChange={(e) => {
                              const arr = [...form.tiers];
                              arr[idx].tax_rate = e.target.value;
                              setForm((prev) => ({ ...prev, tiers: arr }));
                            }}
                          />
                        </div>
                        {form.tiers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                tiers: prev.tiers.filter((_, i) => i !== idx),
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
                        tiers: [
                          ...prev.tiers,
                          {
                            created_at: '',
                            id: 0,
                            max_income: '',
                            min_income: '',
                            salary_deduction_id: 0,
                            tax_rate: '',
                            updated_at: '',
                          },
                        ],
                      }))
                    }
                  >
                    + Add Rule
                  </Button>
                </>
              )}
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
        <DialogContent
          className={`${editing?.name === 'PPH21' ? 'w-full md:max-w-6xl' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto bg-white`}
        >
          <DialogHeader>
            <DialogTitle>Detail Salary Deduction</DialogTitle>
          </DialogHeader>

          <div
            className={`${editing?.name === 'PPH21' ? 'grid md:grid-cols-2 gap-4 md:gap-10' : 'grid gap-4'}`}
          >
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>Deduction Name</Label>
                <Label className="font-semibold">{editing?.name}</Label>
              </div>

              <div className="space-y-2">
                <Label>Deduction Type</Label>
                <Label className="font-semibold">
                  {toTitleCase(editing?.deduction_type ?? '')}
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Label className="font-semibold">{editing?.description}</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Label className="font-semibold">
                    {dayjs(editing?.effective_date).format('MMMM D, YYYY')}
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>Effective To</Label>
                  <Label className="font-semibold">
                    {dayjs(editing?.effective_to).format('MMMM D, YYYY')}
                  </Label>
                </div>
              </div>

              <hr className="my-2" />

              <h4 className="font-medium">Contribution</h4>
              {editing?.name === 'PPH21' ? (
                <div className="space-y-2">
                  <Label>Calculation Basis</Label>
                  <Label className="font-semibold">
                    {toTitleCase(editing?.calculation_basis ?? '')}
                  </Label>
                </div>
              ) : (
                <div className="space-y-2 mb-2">
                  <Label>Contribution Type</Label>
                  <Label className="font-semibold">
                    {toTitleCase(editing?.contribution_type ?? '')}
                  </Label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>
                    Employer Contribution{' '}
                    {editing?.contribution_type === 'fixed_amount'
                      ? '(Fixed)'
                      : '(%)'}
                  </Label>
                  <Label className="font-semibold">
                    {editing?.contribution_type === 'fixed_amount'
                      ? `Rp ${Number(editing?.employer_contribution).toLocaleString('id-ID')}`
                      : `${Number(editing?.employer_contribution)}%`}
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>
                    Employee Contribution{' '}
                    {editing?.contribution_type === 'fixed_amount'
                      ? '(Fixed)'
                      : '(%)'}
                  </Label>
                  <Label className="font-semibold">
                    {editing?.contribution_type === 'fixed_amount'
                      ? `Rp ${Number(editing?.employee_contribution).toLocaleString('id-ID')}`
                      : `${Number(editing?.employee_contribution)}%`}
                  </Label>
                </div>
              </div>
            </div>

            <div>
              {editing?.name === 'PPH21' && (
                <>
                  <h4 className="font-medium mb-3">Tiered Rules</h4>
                  {editing?.tiers?.map((rule, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end mb-2"
                    >
                      <div className="space-y-2">
                        <Label>Min Income</Label>
                        <Label className="font-semibold">
                          {`Rp ${Number(rule.min_income).toLocaleString('id-ID')}`}
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Max Income</Label>
                        <Label className="font-semibold">
                          {`Rp ${Number(rule.max_income).toLocaleString('id-ID')}`}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Tax Rate (%)</Label>
                          <Label className="font-semibold">
                            {rule.tax_rate}%
                          </Label>
                        </div>
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
                        tiers: [
                          ...prev.tiers,
                          {
                            created_at: '',
                            id: 0,
                            max_income: '',
                            min_income: '',
                            salary_deduction_id: 0,
                            tax_rate: '',
                            updated_at: '',
                          },
                        ],
                      }))
                    }
                  >
                    + Add Rule
                  </Button>
                </>
              )}
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
                    setForm({
                      name: editing.name,
                      deduction_type: editing.deduction_type,
                      effective_date: editing.effective_date ?? '',
                      effective_to: editing.effective_to ?? '',
                      employee_contribution:
                        editing.employee_contribution ?? '',
                      employer_contribution:
                        editing.employer_contribution ?? '',
                      description: editing.description ?? '',
                      calculation_basis: editing.calculation_basis,
                      contribution_type: editing.contribution_type,
                      tiers: editing.tiers ?? [],
                    });
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
