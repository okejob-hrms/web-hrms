'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompanyProfile } from '@/services/settings';
import { CompanyRequest } from '@/services/settings/types';
import { CompanyProfileData, useCompanyProfile } from '../settings-company-profile/hook';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { uploadAttachment } from "@/services/attachments";

// -------------------------
// SCHEMA & TYPES
// -------------------------
const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  legalEntity: z.string().min(1, 'Legal entity is required'),
  industry: z.string().min(1, 'Industry is required'),
  companyEmail: z.string().email('Invalid email'),
  companyPhone: z.string().min(6, 'Phone is required'),
  registrationNumber: z.string().min(6, 'Registration number is required'),
  website: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  bankAccountName: z.string().min(1, 'Bank account name is required'),
  bankAccountNumber: z.string().min(6, 'Bank account number is required'),
  bankAccountHolder: z.string().min(1, 'Bank account holder is required'),
  currency: z.string().min(1, 'Currency is required'),
  logo: z.string().nullable().optional(),
  // workSchedules: z
  //   .array(
  //     z.object({
  //       day_of_week: z.number(),
  //       schedules: z.array(
  //         z.object({
  //           shift_name: z.string(),
  //           start_time: z.string(),
  //           end_time: z.string(),
  //           sequence: z.number(),
  //           ends_next_day: z.boolean(),
  //           break_start_time: z.string().optional(),
  //           break_end_time: z.string().optional(),
  //         }),
  //       ),
  //     }),
  //   )
  //   .optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

// -------------------------
// MAPPER API <-> FORM
// -------------------------
// const DAY_NAMES: Record<number, string> = {
//   1: 'Monday',
//   2: 'Tuesday',
//   3: 'Wednesday',
//   4: 'Thursday',
//   5: 'Friday',
//   6: 'Saturday',
//   7: 'Sunday',
// };

function mapToApiPayload(values: CompanyFormValues): CompanyRequest {
  return {
    name: values.companyName,
    legal_entity_name: values.legalEntity,
    industry: values.industry,
    email: values.companyEmail,
    phone: values.companyPhone,
    logo: values.logo ?? null,
    business_registration_number: values.registrationNumber,
    website: values.website ?? '',
    address: values.address,
    payroll_bank_name: values.bankAccountName,
    payroll_bank_account_number: values.bankAccountNumber,
    payroll_bank_account_name: values.bankAccountHolder,
    payroll_currency: values.currency,
    // work_schedules: (values.workSchedules ?? [])?.map((day) => ({
    //   day_of_week: day.day_of_week,
    //   day_name: DAY_NAMES[day.day_of_week] ?? '',
    //   has_schedule: (day.schedules?.length ?? 0) > 0,
    //   total_shifts: day.schedules?.length ?? 0,
    //   schedules: (day.schedules ?? []).map((s) => ({
    //     shift_name: s.shift_name,
    //     start_time: s.start_time,
    //     end_time: s.end_time,
    //     sequence: s.sequence,
    //     ends_next_day: s.ends_next_day,
    //     break_start_time: s.break_start_time,
    //     break_end_time: s.break_end_time,
    //   })),
    // })),
  };
}

function mapFromApiResponse(data: CompanyProfileData): CompanyFormValues {
  return {
    companyName: data?.companyInfo?.name,
    legalEntity: data?.companyInfo?.legalEntity,
    industry: data?.companyInfo?.industry,
    companyEmail: data?.companyInfo?.email,
    companyPhone: data?.companyInfo?.phone,
    registrationNumber: data?.companyInfo?.regNumber,
    website: data?.companyInfo?.website,
    address: data?.companyInfo?.address,
    bankAccountName: data?.payrollInfo?.bankAccountName,
    bankAccountNumber: data?.payrollInfo?.bankAccountNumber,
    bankAccountHolder: data?.payrollInfo?.bankAccountHolder,
    currency: data?.payrollInfo?.currency,
    logo: data?.companyInfo?.logo,
    // workSchedules: data?.rawWorkSchedules?.map((day) => ({
    //   day_of_week: day.day_of_week,
    //   schedules: (day.schedules ?? []).map((s) => ({
    //     shift_name: s.shift_name,
    //     start_time: s.start_time,
    //     end_time: s.end_time,
    //     sequence: s.sequence,
    //     ends_next_day: s.ends_next_day,
    //     break_start_time: s.break_start_time,
    //     break_end_time: s.break_end_time,
    //   })),
    // })),
  };
}

const daysOfWeek = [
  'Monday',    
  'Tuesday',   
  'Wednesday', 
  'Thursday',  
  'Friday',    
  'Saturday',  
  'Sunday',    
];

// -------------------------
// HOOK
// -------------------------
export function useCompanyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useCompanyProfile();
  const [imagePhoto, setImagePhoto] = useState(`https://bucket.okejobhub.fun/${data?.companyInfo.logo}`);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: data ? mapFromApiResponse(data) : {},
  });

  // Refill values ketika data berubah
  useEffect(() => {
    if (data && !isLoading) {
      form.reset(mapFromApiResponse(data));
    }
  }, [data, isLoading, form]);

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) => 
      updateCompanyProfile(mapToApiPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      toast.success("Update company successful.");
      router.push('/settings/company-profile')
    },
    onError: () => {
      toast.error("Update company failed.");
    }
  });

  const onSubmit = (values: CompanyFormValues) => {
    // console.log(values);
    mutation.mutate(values);
  };


  const handleBack = () => {
    router.back();
  }
    const {
    mutate: uploadLogo,
    isPending: isUploadingLogo,
  } = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (res) => {
      const photoUrl = res.data.path;
      form.setValue("logo", photoUrl, { shouldValidate: true });
      setImagePhoto(res.data.url);
      toast.success("Logo uploaded successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to upload logo: ${error.message}`);
    },
  });


  return {
    form, 
    onSubmit, 
    isLoading,
    isSubmitting: mutation.isPending,
    dataWorkSchedule: data,
    handleBack,
    daysOfWeek,
    uploadLogo,
    isUploadingLogo,
    imagePhoto,
  };
}
