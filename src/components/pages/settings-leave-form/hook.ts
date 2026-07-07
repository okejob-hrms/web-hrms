'use client';

import { z } from 'zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaginatedResponse } from '@/lib/types';
import { JobLevel } from '@/services/job-levels/types';
import { getJobLevels } from '@/services/job-levels';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { getLeaveTypeDetail, postLeaveType, putLeaveType } from '@/services/settings';
import { LeaveConfig, LeaveConfigEntitle, QuotaConfigurationDetailLocal } from '@/services/settings/types';
import { useRouter } from 'next/navigation';

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
  gender: z.string(),
  quota_configuration: z.string(),
  quota_configuration_detail: z
    .array(quotaConfigurationDetailSchema)
    .optional(),
});

export type LeaveConfigValues = z.infer<typeof formSchema>;

// -----------------
// Hook
// -----------------
export function useLeaveTypeForm() {
  const router = useRouter();
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const [listing, setListing] = useState<QuotaConfigurationDetailLocal[]>([])
  const [loadingType, setLoadingType] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const resolver = zodResolver(formSchema) as unknown as Resolver<
    LeaveConfigValues
  >;

  const queryClient = useQueryClient();

  const { data: jobLevel } = useQuery<PaginatedResponse<JobLevel>>({
    queryKey: ["jobLevel"],
    queryFn: getJobLevels,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: detailData,
  } = useQuery({
    queryKey: ["leaveDetail", selectedId],
    queryFn: () => getLeaveTypeDetail(selectedId),
    enabled: !!selectedId,
    placeholderData: keepPreviousData,
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

  useEffect(() => {
    if (detailData?.data) {
      const detail = detailData.data;

      const mappedEntitlements = detail.entitlements.map((item: LeaveConfigEntitle) => ({
        id: item.id,
        job_level: Number(item.job_level),
        quota_days: item.quota_days,
        carry_over_allowed: item.carry_over_allowed,
        max_carry_over_days: item.max_carry_over_days,
        carry_over_expiry: item.carry_over_expiry,
        deduct_employee_balance: item.deduct_employee_balance,
      }));
      
      form.reset({
        name: detail.name,
        description: detail.description,
        gender: detail.gender,
        quota_configuration: detail.quota_configuration,
        quota_configuration_detail: mappedEntitlements,
      });

       const mappedEntitlementLocals = detail.entitlements.map((item: LeaveConfigEntitle) => ({
        id: item.id,
        job_level: item.job_level,
        quota_days: String(item.quota_days),
        carry_over_allowed: item.carry_over_allowed,
        max_carry_over_days: String(item.max_carry_over_days),
        carry_over_expiry: String(item.carry_over_expiry),
        deduct_employee_balance: item.deduct_employee_balance,
      }));

      setListing(mappedEntitlementLocals);
    }
  }, [detailData, form]);

  const quotaConfig = useWatch({
    control: form.control,
    name: 'quota_configuration',
  });

  const detailSame = useWatch({
    control: form.control,
    name: 'quota_configuration_detail.0',
  });

  const saveMutationType = useMutation<
    LeaveConfig,
    Error,
    { id?: number; data: LeaveConfigValues }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putLeaveType(id, data);
      }
      return postLeaveType(data);
    },
    onMutate: () => setLoadingType(true),
    onSuccess: () => {
      toast.success(t('leaveTypeSaveSuccess'));
      queryClient.invalidateQueries({ queryKey: ["leaveType"] });
      router.push('/settings/leave-management')
    },
    onError: (err) => {
      toast.error(tCommon('saveFailed', { message: err.message }));
    },
    onSettled: () => setLoadingType(false),
  });

  const onSubmit = (id: number | undefined, values: LeaveConfigValues) => {
    saveMutationType.mutate({ id, data: values });
  };

  const handleDetailData = (id: string) => {
    setSelectedId(id);
  }

  const onBack = () => {
      router.push('/settings/leave-management')
  }

  return {
    form,
    onSubmit,
    quotaConfig,
    detailSame,
    jobLevel,
    loadingType,
    handleDetailData,
    listing,
    onBack
 };
}
