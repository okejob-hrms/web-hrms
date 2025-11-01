'use client';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { LeaveConfigValues, useLeaveTypeForm } from './hook';
import { QuotaConfigurationDetailLocal } from '@/services/settings/types';
import { ColumnDef } from '@tanstack/react-table';
import { RowActions } from '@/components/tables/row-actions';
import { Plus } from 'lucide-react';
import DataTable from '@/components/tables/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SettingsLeaveConfigurationFormProps = {
  id?: string;
};

export default function SettingsLeaveConfigurationForm({
  id,
}: SettingsLeaveConfigurationFormProps) {
  const { form, onSubmit, jobLevel, handleDetailData, listing } =
    useLeaveTypeForm();

  const quotaConfig = useWatch({
    control: form.control,
    name: 'quota_configuration',
  });

  const detail0 = useWatch({
    control: form.control,
    name: 'quota_configuration_detail.0',
  });
  const carryOverAllowedForSame = detail0?.carry_over_allowed;

  // ------------------------
  // Local State for per_level detail (dynamic)
  // ------------------------
  const [rows, setRows] = useState<QuotaConfigurationDetailLocal[]>(
    id ? listing : [],
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [formRow, setFormRow] = useState<QuotaConfigurationDetailLocal>({
    job_level: '',
    quota_days: '',
    carry_over_allowed: false,
    max_carry_over_days: '',
    carry_over_expiry: '',
    deduct_employee_balance: false,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      handleDetailData(id);
    }
  }, [id]);

  const handleAddOrUpdate = () => {
    // Basic validation: require job_level & quota_days
    if (!formRow.job_level || formRow.quota_days === '') {
      // you can replace with toast / UI error
      alert('Job level and quota days are required');
      return;
    }

    if (editIndex !== null) {
      const updated = [...rows];
      updated[editIndex] = { ...formRow };
      setRows(updated);
    } else {
      setRows((prev) => [...prev, { ...formRow }]);
    }
    setOpenDialog(false);
    resetDialogForm();
  };

  const handleEdit = (index: number) => {
    setFormRow(rows[index]);
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const resetDialogForm = () => {
    setFormRow({
      job_level: '',
      quota_days: '',
      carry_over_allowed: false,
      max_carry_over_days: '',
      carry_over_expiry: '',
      deduct_employee_balance: false,
    });
    setEditIndex(null);
  };

  // Table
  const columns: ColumnDef<QuotaConfigurationDetailLocal>[] = [
    { accessorKey: 'job_level', header: 'Job Level', size: 160 },
    { accessorKey: 'quota_days', header: 'Quota (days)', size: 160 },
    {
      accessorKey: 'carry_over_allowed',
      header: 'Carry Over',
      size: 200,
      cell: ({ row }) => (
        <div className="">{row.original.carry_over_allowed ? 'Yes' : 'No'}</div>
      ),
    },
    { accessorKey: 'max_carry_over_days', header: 'Max Carry', size: 160 },
    { accessorKey: 'carry_over_expiry', header: 'Expiry', size: 160 },
    {
      accessorKey: 'deduct_employee_balance',
      header: 'Deduct',
      size: 200,
      cell: ({ row }) => (
        <div className="">
          {row.original.deduct_employee_balance ? 'Yes' : 'No'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                handleEdit(row.index);
              }}
              onDelete={() => {
                handleDelete(row.index);
              }}
            />
          </div>
        );
      },
    },
  ];

  // Build payload and call onSubmit (hook's onSubmit should accept ApidogModel)
  const handleSubmit = (data: LeaveConfigValues) => {
    console.log(data);
    const payload: LeaveConfigValues = {
      name: data.name,
      description: data.description,
      gender: data.gender,
      quota_configuration: data.quota_configuration,
      quota_configuration_detail: [],
    };

    if (data.quota_configuration === 'same') {
      // read nested fields using the form values (we expect them at quota_configuration_detail.0.*)
      const d0 = data.quota_configuration_detail?.[0];
      payload.quota_configuration_detail = [
        {
          job_level: d0?.job_level ?? 0,
          quota_days: Number(d0?.quota_days ?? 0),
          carry_over_allowed: !!d0?.carry_over_allowed,
          max_carry_over_days: Number(d0?.max_carry_over_days ?? 0),
          carry_over_expiry: d0?.carry_over_expiry ?? '',
          deduct_employee_balance: !!d0?.deduct_employee_balance,
        },
      ];
    } else if (data.quota_configuration === 'per_level') {
      payload.quota_configuration_detail = rows.map((r) => ({
        job_level: Number(r.job_level),
        quota_days: Number(r.quota_days),
        carry_over_allowed: !!r.carry_over_allowed,
        max_carry_over_days: Number(r.max_carry_over_days ?? 0),
        carry_over_expiry: r.carry_over_expiry ?? '',
        deduct_employee_balance: !!r.deduct_employee_balance,
      }));
    }

    onSubmit(Number(id) ?? undefined, payload);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(form.getValues());
            handleSubmit(form.getValues());
          }}
          className="space-y-8"
        >
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Basic Leave Information
            </h2>
            <div className="space-y-4">
              {/* NOTE: form schema expects "name" not "leaveName" */}
              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Leave Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter leave name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Enter leave description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Entitlement Rules */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Entitlement Rules</h2>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <label htmlFor="all">All</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female">Female</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Quota Config */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quota Configuration</h2>

            {/* IMPORTANT: name is "quota_configuration" per schema */}
            <FormField
              control={form.control}
              name="quota_configuration"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {/* SAME */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same" />
                        <label htmlFor="same">
                          Apply same quota for all job levels
                        </label>
                      </div>

                      {/* === FOR 'same' MODE: use nested form paths === */}
                      {quotaConfig === 'same' && (
                        <div className="ml-6 mt-3 space-y-3">
                          {/* nested path: quota_configuration_detail.0.quota_days */}
                          <FormField
                            control={form.control}
                            name="quota_configuration_detail.0.quota_days"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quota (days)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="quota_configuration_detail.0.carry_over_allowed"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Carry Over Allowed</FormLabel>
                              </FormItem>
                            )}
                          />

                          {/* watch nested object to show nested fields */}
                          {carryOverAllowedForSame && (
                            <>
                              <FormField
                                control={form.control}
                                name="quota_configuration_detail.0.max_carry_over_days"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Carry Over (days)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="quota_configuration_detail.0.carry_over_expiry"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Carry Over Expiry (months)
                                    </FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

                          <FormField
                            control={form.control}
                            name="quota_configuration_detail.0.deduct_employee_balance"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Deduct Employee Balance</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* PER LEVEL */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="per_level" id="per_level" />
                        <label htmlFor="per_level">
                          Define quota per job level
                        </label>
                      </div>

                      {quotaConfig === 'per_level' && (
                        <div className="ml-6 mt-4">
                          <div className="flex flex-col sm:flex-row sm:gap-4 justify-between mb-3">
                            <h2 className="font-semibold">
                              Entitlement Matrix
                            </h2>
                            <Button
                              type="button"
                              className="flex flex-row gap-6"
                              onClick={() => {
                                resetDialogForm();
                                setOpenDialog(true);
                              }}
                            >
                              <Plus />
                              New Leave Type
                            </Button>
                          </div>

                          <DataTable columns={columns} data={rows} />
                        </div>
                      )}

                      {/* UNLIMITED */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unlimited" id="unlimited" />
                        <label htmlFor="unlimited">Unlimited Quota</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? 'Edit' : 'Add'} Entitlement Matrix
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Select
              onValueChange={(e) => {
                setFormRow({ ...formRow, job_level: e });
              }}
              value={formRow.job_level}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select job level" />
              </SelectTrigger>
              <SelectContent>
                {jobLevel?.data.map((item, i) => (
                  <SelectItem value={String(item.id)} key={i}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Quota (days)"
              type="number"
              value={formRow.quota_days}
              onChange={(e) =>
                setFormRow({ ...formRow, quota_days: e.target.value })
              }
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formRow.carry_over_allowed}
                onCheckedChange={(v) =>
                  setFormRow({ ...formRow, carry_over_allowed: !!v })
                }
              />
              <label>Carry Over Allowed</label>
            </div>

            {formRow.carry_over_allowed && (
              <div className="flex gap-2">
                <Input
                  placeholder="Max Carry Over (days)"
                  type="number"
                  value={formRow.max_carry_over_days}
                  onChange={(e) =>
                    setFormRow({
                      ...formRow,
                      max_carry_over_days: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Expiry (months)"
                  type="number"
                  value={formRow.carry_over_expiry}
                  onChange={(e) =>
                    setFormRow({
                      ...formRow,
                      carry_over_expiry: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={formRow.deduct_employee_balance}
                onCheckedChange={(v) =>
                  setFormRow({ ...formRow, deduct_employee_balance: !!v })
                }
              />
              <label>Deduct Employee Balance</label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
