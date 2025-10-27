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
import { LeaveBalanceType, leaveBalanceFormScheme } from '../types';
import { LeaveBalanceItem } from '@/services/settings/types';
import { useLeaveManagement } from '../hook';
import { days, month } from '@/lib/utils';

interface LeaveBalanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: LeaveBalanceItem | undefined;
  handleClose: () => void;
  isLoading?: boolean;
}

export default function LeaveBalanceForm({
  open,
  onOpenChange,
  initialData,
  handleClose,
  isLoading,
}: LeaveBalanceFormProps) {
  const { handleSaveLeaveBalance, jobLevel } = useLeaveManagement();

  const DEFAULT_VALUES: LeaveBalanceType = {
    job_level_id: 0,
    balance: 0,
    reset_period_day: 1,
    reset_period_month: 1,
  };

  const form = useForm<LeaveBalanceType>({
    resolver: zodResolver(leaveBalanceFormScheme),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        job_level_id: initialData.job_level_id,
        balance: initialData.balance,
        reset_period_day: initialData.reset_period_day,
        reset_period_month: initialData.reset_period_month,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [initialData, form]);

  const onSubmit = (data: LeaveBalanceType) => {
    onOpenChange(false);
    handleSaveLeaveBalance(initialData?.id, data);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {initialData !== undefined
              ? 'Edit Leave Balance'
              : 'Add Leave Balance'}
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
                name="job_level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Job Level <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(e) => {
                          field.onChange(e === '' ? undefined : Number(e));
                        }}
                        value={String(field.value)}
                      >
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Time */}
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Balance <span className="text-red-500">*</span>
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

            {/* Reset Day */}
            <FormField
              control={form.control}
              name="reset_period_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reset Period Day <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e === '' ? undefined : Number(e));
                      }}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((item, i) => (
                          <SelectItem value={String(item.id)} key={i}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reset Month */}
            <FormField
              control={form.control}
              name="reset_period_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reset Period Month <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e === '' ? undefined : Number(e));
                      }}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {month.map((item, i) => (
                          <SelectItem value={String(item.id)} key={i}>
                            {item.label}
                          </SelectItem>
                        ))}
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
