'use client';

import { z } from 'zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaginatedResponse } from '@/lib/types';
import { JobLevel } from '@/services/job-levels/types';
import { getJobLevels } from '@/services/job-levels';
import { useQuery } from '@tanstack/react-query';

// --- schema (sama seperti yang kamu punya) ---
const quotaConfigurationDetailSchema = z.object({
  job_level: z.number(),
  quota_days: z.number().min(0),
  carry_over_allowed: z.boolean().default(false),
  max_carry_over_days: z.number().min(0).optional(),
  carry_over_expiry: z.string().optional(),
  deduct_employee_balance: z.boolean().default(false),
});

export const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  gender: z.enum(['all', 'male', 'female']),
  quota_configuration: z.enum(['same', 'per_level', 'unlimited']),
  quota_configuration_detail: z
    .array(quotaConfigurationDetailSchema)
    .optional(),
});

export type LeaveConfigValues = z.infer<typeof formSchema>;

// -----------------
// Hook
// -----------------
export function useLeaveTypeForm() {
  const resolver = zodResolver(formSchema) as unknown as Resolver<
    LeaveConfigValues
  >;

  const { data: jobLevel } = useQuery<PaginatedResponse<JobLevel>>({
    queryKey: ["jobLevel"],
    queryFn: getJobLevels,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<LeaveConfigValues>({
    resolver,
    defaultValues: {
      name: '',
      description: '',
      gender: 'all',
      quota_configuration: 'same',
      quota_configuration_detail: [
        {
          job_level: 0,
          quota_days: 12,
          carry_over_allowed: false,
          max_carry_over_days: 0,
          carry_over_expiry: '',
          deduct_employee_balance: false,
        },
      ],
    },
  });

  const quotaConfig = useWatch({
    control: form.control,
    name: 'quota_configuration',
  });

  const detailSame = useWatch({
    control: form.control,
    name: 'quota_configuration_detail.0',
  });

  const jobLevelTable = [
    { id: 1, name: 'Staff' },
    { id: 2, name: 'Supervisor' },
    { id: 3, name: 'Manager' },
  ];

  const onSubmit = (values: LeaveConfigValues) => {
    console.log('payload', values);
  };

  return {
    form,
    onSubmit,
    quotaConfig,
    detailSame,
    jobLevelTable,
    jobLevel,
 };
}
