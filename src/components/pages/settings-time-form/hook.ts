'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAttendanceTime } from '@/services/settings';
import { AttendanceRequest } from '@/services/settings/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AttendanceConfigData, useAttendance } from '../settings-time-list/hook';

// -------------------------
// SCHEMA & TYPES
// -------------------------
const companySchema = z.object({
  late_tolerance: z.number().min(1, 'Late tolerance is required'),
  max_late_tolerance: z.number().min(1, 'Max late is required'),
  workSchedules: z
    .array(
      z.object({
        day_of_week: z.number(),
        schedules: z.array(
          z.object({
            shift_name: z.string(),
            start_time: z.string(),
            end_time: z.string(),
            sequence: z.number(),
            ends_next_day: z.boolean(),
            break_start_time: z.string().optional(),
            break_end_time: z.string().optional(),
          }),
        ),
      }),
    )
    .optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

// -------------------------
// MAPPER API <-> FORM
// -------------------------
const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

function mapToApiPayload(values: CompanyFormValues): AttendanceRequest {
  return {
    late_tolerance: 0,
    max_late_tolerance: 0,
    work_schedules: (values.workSchedules ?? [])?.map((day) => ({
      day_of_week: day.day_of_week,
      day_name: DAY_NAMES[day.day_of_week] ?? '',
      has_schedule: (day.schedules?.length ?? 0) > 0,
      total_shifts: day.schedules?.length ?? 0,
      schedules: (day.schedules ?? []).map((s) => ({
        shift_name: s.shift_name,
        start_time: s.start_time,
        end_time: s.end_time,
        sequence: s.sequence,
        ends_next_day: s.ends_next_day,
        break_start_time: s.break_start_time,
        break_end_time: s.break_end_time,
      })),
    })),
  };
}

function mapFromApiResponse(data: AttendanceConfigData): CompanyFormValues {
  return {
    late_tolerance: data?.late_tolerance,
    max_late_tolerance: data?.max_late_tolerance,
    workSchedules: data?.rawWorkSchedules?.map((day) => ({
      day_of_week: day.day_of_week,
      schedules: (day.schedules ?? []).map((s) => ({
        shift_name: s.shift_name,
        start_time: s.start_time,
        end_time: s.end_time,
        sequence: s.sequence,
        ends_next_day: s.ends_next_day,
        break_start_time: s.break_start_time,
        break_end_time: s.break_end_time,
      })),
    })),
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
  const { data, isLoading } = useAttendance();

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
      updateAttendanceTime(mapToApiPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      toast.success("Update company successful.");
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


  return {
    form, 
    onSubmit, 
    isLoading,
    isSubmitting: mutation.isPending,
    dataWorkSchedule: data,
    handleBack,
    daysOfWeek,
  };
}
