'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOvertimeConfig, postOvertimeConfig } from '@/services/settings';
import { OvertimeApiModel } from '@/services/settings/types';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// -------------------------
// SCHEMA
// -------------------------
export const TieringRuleSchema = z.object({
  from_hour: z.string(),
  to_hour: z.string(),
  rate: z.string()
});

export const ExceptionSchema = z.object({
  day: z.string(),
  rate: z.string()
});

export const OvertimeConfigSchema = z.object({
  working_hours_divisor: z.number().min(0),
  max_daily_hours: z.number().int().min(0),
  max_weekly_hours: z.number().int().min(0),
  max_monthly_hours: z.number().int().min(0),
  auto_reject: z.boolean(),
  prorate_by_minutes: z.boolean(),
  weekend_rate: z.number().min(0),
  public_holiday_rate: z.number().min(0),
  tiering_rules: z.array(TieringRuleSchema),
  exceptions: z.array(ExceptionSchema),
});

export type OvertimeConfigValues = z.infer<typeof OvertimeConfigSchema>;

// -------------------------
// MAPPER API <-> FORM
// -------------------------

function mapFromApiResponse(data: OvertimeApiModel): OvertimeConfigValues {
  return {
    working_hours_divisor: Number(data.working_hours_divisor ?? 0),
    max_daily_hours: Number(data.max_daily_hours ?? 0),
    max_weekly_hours: Number(data.max_weekly_hours ?? 0),
    max_monthly_hours: Number(data.max_monthly_hours ?? 0),
    auto_reject: Boolean(data.auto_reject),
    prorate_by_minutes: Boolean(data.prorate_by_minutes),
    weekend_rate: Number(data.weekend_rate ?? 0),
    public_holiday_rate: Number(data.public_holiday_rate ?? 0),
    tiering_rules: data.tiering_rules ?? [],
    exceptions: data.exceptions ?? [],
  };
}

function mapToApiPayload(values: OvertimeConfigValues) {
  return {
    working_hours_divisor: values.working_hours_divisor,
    max_daily_hours: values.max_daily_hours,
    max_weekly_hours: values.max_weekly_hours,
    max_monthly_hours: values.max_monthly_hours,
    auto_reject: values.auto_reject,
    prorate_by_minutes: values.prorate_by_minutes,
    weekend_rate: values.weekend_rate,
    public_holiday_rate: values.public_holiday_rate,
    tiering_rules: values.tiering_rules,
    exceptions: values.exceptions,
  };
}

// -------------------------
// HOOK
// -------------------------

export function useOvertimeConfigForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery<OvertimeApiModel>({
    queryKey: ['overtimeConfig'],
    queryFn: getOvertimeConfig,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<OvertimeConfigValues>({
    resolver: zodResolver(OvertimeConfigSchema),
    defaultValues: data ? mapFromApiResponse(data) : {},
  });

  useEffect(() => {
    if (data) {
      form.reset(mapFromApiResponse(data));
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (values: OvertimeConfigValues) =>
      postOvertimeConfig(mapToApiPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeDatas'] });
      toast.success('Overtime config updated successfully.');
      router.push('/settings/time-attendance/overtime-configuration');
    },
    onError: () => {
      toast.error('Failed to update overtime config.');
    },
  });

  const onSubmit = (values: OvertimeConfigValues) => {
    mutation.mutate(values);
  };

  const handleBack = () => {
    router.back();
  }

  return {
    form,
    onSubmit,
    isLoading,
    isSubmitting: mutation.isPending,
    handleBack,
    data
  };
}
