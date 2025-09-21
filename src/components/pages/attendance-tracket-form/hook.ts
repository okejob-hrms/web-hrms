'use client';

// import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';

// -------------------------
// SCHEMA & TYPES
// -------------------------
const attendanceSchema = z.object({
  employee_id: z.number().min(1, "Employee is required"),
  attendance_date: z.string().min(1, "Attendance Date is required"),
  clock_in_at: z.string().min(1, "Clock-in time is required"),
  clock_out_at: z.string().min(1, "Clock-out time is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

// -------------------------
// HOOK
// -------------------------
export function useAttendenceForm() {
  const router = useRouter();
//   const queryClient = useQueryClient();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {},
  });

//   const mutation = useMutation({
//     mutationFn: (values: AttendanceFormValues) => 
//       updateCompanyProfile(mapToApiPayload(values)),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
//       toast.success("Create company successful.");
//     },
//     onError: () => {
//       toast.error("Create company failed.");
//     }
//   });

  const onSubmit = (values: AttendanceFormValues) => {
    console.log(values);
    // mutation.mutate(values);
  };


  const handleBack = () => {
    router.back();
  }


  return {
    form, 
    onSubmit, 
    handleBack
  };
}
