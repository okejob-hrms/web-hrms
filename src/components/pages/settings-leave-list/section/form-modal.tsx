'use client';

import React, { useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';

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
import { getDayOptions, getMonthOptions } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';

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
  const t = useTranslations('settings');
  const tEmployee = useTranslations('employee');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const { handleSaveLeaveBalance, jobLevel } = useLeaveManagement();

  const monthOptions = useMemo(
    () => getMonthOptions(locale),
    [locale],
  );
  const dayOptions = useMemo(
    () => getDayOptions(locale, 31, (day) => tCommon('dayNumber', { number: day })),
    [locale, tCommon],
  );

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
              ? t('editLeaveBalance')
              : t('addLeaveBalance')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="job_level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tEmployee('jobLevel')}{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(e) => {
                          field.onChange(e === '' ? undefined : Number(e));
                        }}
                        value={String(field.value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectJobLevel')} />
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

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('leaveBalance')}{' '}
                      <span className="text-red-500">*</span>
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

            <FormField
              control={form.control}
              name="reset_period_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('resetPeriodDay')}{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e === '' ? undefined : Number(e));
                      }}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tCommon('selectDay')} />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((item, i) => (
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

            <FormField
              control={form.control}
              name="reset_period_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('resetPeriodMonth')}{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e === '' ? undefined : Number(e));
                      }}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tCommon('selectMonth')} />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((item, i) => (
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
              <AlertDialogCancel type="button" onClick={handleClose}>
                {tCommon('cancel')}
              </AlertDialogCancel>
              <Button type="submit" isLoading={isLoading}>
                {tCommon('save')}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
