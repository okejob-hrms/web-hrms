'use client';

import React, { useEffect } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LateDeductionValues, lateDeductionFormScheme } from '../types';
import { DeductionRequest, LateDeductions } from '@/services/settings/types';
import { useLateDeduction } from '../hook';
import { MultiSelect } from '@/components/ui/multi-select';

interface LateDeductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: LateDeductions | undefined;
  handleClose: () => void;
  isLoading?: boolean;
}

export default function LateDeductionForm({
  open,
  onOpenChange,
  initialData,
  handleClose,
  isLoading,
}: LateDeductionFormProps) {
  const { shiftOptions } = useLateDeduction();
  const { handleSaveLateDeduction } = useLateDeduction();

  const form = useForm<LateDeductionValues>({
    resolver: zodResolver(lateDeductionFormScheme),
    mode: 'onChange', // validate on change so Save button can disable live
    defaultValues: {
      shift_id: [],
      duration_type: 'lte',
      min_minutes: 0,
      payroll_amount: undefined,
      leave_impact: undefined,
      is_payroll_deduction: false,
      is_leave_impact: false,
      priority: 1,
      is_active: true,
      starts_on: '',
      ends_on: '',
      note: '',
    },
  });

  const DEFAULT_VALUES: LateDeductionValues = {
    shift_id: [],
    duration_type: 'lte',
    min_minutes: 0,
    payroll_amount: undefined,
    leave_impact: 'half_day',
    is_payroll_deduction: false,
    is_leave_impact: false,
    priority: 1,
    is_active: true,
    starts_on: '',
    ends_on: '',
    note: '',
  };

  useEffect(() => {
    if (initialData) {
      console.log(initialData);
      form.reset({
        shift_id: initialData.shift.map((item) => String(item.id)) ?? [],
        duration_type: initialData.duration_type ?? 'lte',
        min_minutes: initialData.min_minutes ?? 0,
        payroll_amount: initialData.is_payroll_deduction
          ? Number(initialData.payroll_amount)
          : undefined,
        leave_impact: initialData.is_leave_impact
          ? initialData.leave_impact
          : undefined,
        is_payroll_deduction: initialData.is_payroll_deduction ?? false,
        is_leave_impact: initialData.is_leave_impact ?? false,
        priority: initialData.priority ?? 1,
        is_active: initialData.is_active ?? true,
        starts_on: initialData.starts_on ?? '',
        ends_on: initialData.ends_on ?? '',
        note: initialData.note ?? '',
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [initialData, form]);

  const onSubmit = (data: LateDeductionValues) => {
    const payload: DeductionRequest = {
      shift_id: data.shift_id.map(Number),
      duration_type: data.duration_type,
      min_minutes: data.min_minutes,
      leave_impact: data.leave_impact,
      payroll_amount: data.is_payroll_deduction
        ? (data.payroll_amount ?? 0)
        : 0,
      is_payroll_deduction: data.is_payroll_deduction,
      priority: data.priority,
      is_active: data.is_active,
      starts_on: data.starts_on || '',
      ends_on: data.ends_on || '',
      note: data.note || '',
      is_leave_impact: data.leave_impact === 'half_day' ? true : false,
    };

    onOpenChange(false);
    handleSaveLateDeduction(initialData?.id, payload);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {initialData !== undefined
              ? 'Edit Deduction Rules'
              : 'Add Deduction Rules'}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              {/* Department Name */}
              <FormField
                control={form.control}
                name="duration_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duration Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lte">
                            Less than or equal to
                          </SelectItem>
                          <SelectItem value="eq">Equals to</SelectItem>
                          <SelectItem value="gte">
                            More than or equals to
                          </SelectItem>
                          <SelectItem value="range">range</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Time */}
              <FormField
                control={form.control}
                name="min_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duration Time <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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

            {/* Shift */}
            <FormField
              control={form.control}
              name="shift_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text-secondary">
                      Asign Shift <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      placeholder="Select"
                      options={shiftOptions}
                      defaultValue={field.value ?? []}
                      onValueChange={field.onChange}
                      maxCount={5}
                      variant="inverted"
                      {...field}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payroll Deduction */}
            <FormField
              control={form.control}
              name="is_payroll_deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payroll Impact <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'true')}
                      value={field.value?.toString()}
                      defaultValue={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No Deduction</SelectItem>
                        <SelectItem value="true">
                          Fixed Deduction Amount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payroll Amount (conditional) */}
            {form.watch('is_payroll_deduction') && (
              <FormField
                control={form.control}
                name="payroll_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
            )}

            {/* Leave Deduction */}
            <FormField
              control={form.control}
              name="leave_impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Leave Impact <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No Deduction</SelectItem>
                        <SelectItem value="half_day">
                          Convert to Half Day Leave
                        </SelectItem>
                        <SelectItem value="full_day">
                          Convert to Full Day Leave
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogCancel
                className="min-w-[100px] border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!form.formState.isValid}
                className="min-w-[100px] bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
