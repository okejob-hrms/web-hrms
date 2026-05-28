'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HTTPError } from 'ky';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';

import {
  AttendanceRuleFormValues,
  attendanceRuleFormSchema,
  CONDITION_TYPE_OPTIONS,
  IMPACT_TYPE_OPTIONS,
  TRIGGER_TYPE_OPTIONS,
  VALUE_TYPE_OPTIONS,
} from '../types';
import {
  AttendanceRule,
  AttendanceRuleRequest,
} from '@/services/attendance-rule/types';
import { ApiErrorResponse } from '@/lib/types';
import { UseMutationResult } from '@tanstack/react-query';

interface AttendanceRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AttendanceRule;
  shiftOptions: { value: string; label: string }[];
  allowanceTypeOptions: { value: string; label: string }[];
  onClose: () => void;
  saveMutation: UseMutationResult<
    unknown,
    Error,
    { id?: number; data: AttendanceRuleRequest }
  >;
}

const DEFAULT_VALUES: AttendanceRuleFormValues = {
  name: '',
  shift_id: [],
  condition_type: 'per_occurrence',
  trigger_type: 'late',
  min_threshold: undefined,
  max_threshold: undefined,
  monthly_free_count: 0,
  impact_type: 'base_salary',
  target_allowance_type_id: null,
  value_type: 'fixed',
  amount: 0,
  priority: 10,
  is_active: true,
  starts_on: '',
  ends_on: '',
  note: '',
};

export default function AttendanceRuleForm({
  open,
  onOpenChange,
  initialData,
  shiftOptions,
  allowanceTypeOptions,
  onClose,
  saveMutation,
}: AttendanceRuleFormProps) {
  const form = useForm<AttendanceRuleFormValues>({
    resolver: zodResolver(attendanceRuleFormSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const conditionType = form.watch('condition_type');
  const impactType = form.watch('impact_type');
  const valueType = form.watch('value_type');

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        shift_id: initialData.shifts.map((s) => String(s.id)),
        condition_type: initialData.condition_type,
        trigger_type: initialData.trigger_type,
        min_threshold: initialData.min_threshold ?? undefined,
        max_threshold: initialData.max_threshold ?? undefined,
        monthly_free_count: initialData.monthly_free_count ?? undefined,
        impact_type: initialData.impact_type,
        target_allowance_type_id: initialData.target_allowance_type_id
          ? String(initialData.target_allowance_type_id)
          : null,
        value_type: initialData.value_type,
        amount: Number(initialData.amount),
        priority: initialData.priority ?? undefined,
        is_active: initialData.is_active,
        starts_on: initialData.starts_on ?? '',
        ends_on: initialData.ends_on ?? '',
        note: initialData.note ?? '',
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  // Reset dependent fields when condition_type changes
  React.useEffect(() => {
    if (conditionType === 'per_occurrence') {
      form.setValue('min_threshold', undefined);
      form.setValue('max_threshold', undefined);
    } else {
      form.setValue('monthly_free_count', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionType]);

  // Reset allowance target when impact_type changes
  React.useEffect(() => {
    if (impactType === 'base_salary') {
      form.setValue('target_allowance_type_id', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impactType]);

  const thresholdUnit =
    conditionType === 'monthly_aggregate' ? 'Jumlah Kejadian' : 'Menit';

  const onSubmit = (data: AttendanceRuleFormValues) => {
    const payload: AttendanceRuleRequest = {
      name: data.name,
      shift_id: data.shift_id.map(Number),
      condition_type: data.condition_type,
      trigger_type: data.trigger_type,
      impact_type: data.impact_type,
      target_allowance_type_id:
        data.impact_type === 'allowance' && data.target_allowance_type_id
          ? Number(data.target_allowance_type_id)
          : null,
      value_type: data.value_type,
      amount: Number(data.amount),
      is_active: data.is_active,
      priority: data.priority,
      starts_on: data.starts_on || null,
      ends_on: data.ends_on || null,
      note: data.note || null,
    };

    if (data.condition_type === 'per_occurrence') {
      payload.monthly_free_count = data.monthly_free_count ?? 0;
      if (data.min_threshold !== undefined) payload.min_threshold = data.min_threshold;
      if (data.max_threshold !== undefined) payload.max_threshold = data.max_threshold;
    } else {
      payload.min_threshold = data.min_threshold;
      payload.max_threshold = data.max_threshold;
    }

    saveMutation.mutate(
      { id: initialData?.id, data: payload },
      {
        onError: async (error) => {
          if (error instanceof HTTPError) {
            try {
              const errorData =
                (await error.response.json()) as ApiErrorResponse;
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(
                      fieldName as keyof AttendanceRuleFormValues,
                      {
                        type: 'server',
                        message: messages[0],
                      },
                    );
                  },
                );
                toast.error(errorData.message || 'Validasi gagal');
                return;
              }
              toast.error(errorData.message || 'Gagal menyimpan aturan');
              return;
            } catch (_) {
              // fall through
            }
          }
          toast.error(`Gagal menyimpan aturan: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Aturan Kehadiran' : 'Tambah Aturan Kehadiran'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col gap-6 pt-2"
          >
            {/* SECTION: Info Umum */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Info Umum
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Aturan <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Late ≤10 menit (dispensasi 2x)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Shift <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Pilih shift"
                        options={shiftOptions}
                        defaultValue={field.value ?? []}
                        onValueChange={field.onChange}
                        maxCount={5}
                        variant="inverted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioritas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="10"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Angka kecil = prioritas tinggi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3 h-9 px-3 rounded-md border">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label className="text-sm font-medium">
                            {field.value ? 'Aktif' : 'Nonaktif'}
                          </Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="starts_on"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berlaku Mulai</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ends_on"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berlaku Sampai</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Catatan internal (opsional)"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* SECTION: Kondisi & Trigger */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Kondisi & Trigger
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condition_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipe Kondisi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe kondisi" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trigger_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trigger <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRIGGER_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Min Threshold ({thresholdUnit})
                        {conditionType === 'monthly_aggregate' && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Max Threshold ({thresholdUnit})
                        {conditionType === 'monthly_aggregate' && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {conditionType === 'per_occurrence' && (
                <FormField
                  control={form.control}
                  name="monthly_free_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dispensasi per Bulan{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Berapa kejadian per bulan yang dibebaskan dari potongan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </section>

            {/* SECTION: Dampak & Nilai */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Dampak & Nilai
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="impact_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dampak <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dampak" />
                          </SelectTrigger>
                          <SelectContent>
                            {IMPACT_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {impactType === 'allowance' && (
                  <FormField
                    control={form.control}
                    name="target_allowance_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipe Tunjangan <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe tunjangan" />
                            </SelectTrigger>
                            <SelectContent>
                              {allowanceTypeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipe Nilai <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe nilai" />
                          </SelectTrigger>
                          <SelectContent>
                            {VALUE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nilai <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={valueType === 'percentage' ? 100 : undefined}
                            step={valueType === 'percentage' ? 0.01 : 1}
                            placeholder="0"
                            className="pr-14"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                            {valueType === 'percentage' ? '%' : 'IDR'}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saveMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={saveMutation.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
