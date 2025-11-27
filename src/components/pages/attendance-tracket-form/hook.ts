'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShiftByDayResponse } from '@/services/settings/types';
import { getShiftToday } from '@/services/settings';
import { useEffect, useMemo, useState } from 'react';
import { getEmployees } from '@/services/employees';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { getAttendanceDetail, getAttendanceDetailById, postAttendance, putAttendance } from '@/services/attendance';
import { AttendanceDetail } from '@/services/attendance/types';

// -------------------------
// SCHEMA & TYPES
// -------------------------
const attendanceSchema = z.object({
  user_id: z.string().min(1, "Employee is required"),
  attendance_date: z.date(),
  shift_id: z.number().min(1, "Shift is required"),
  clock_in_at: z.string().min(1, "Clock-in time is required"),
  clock_out_at: z.string().min(1, "Clock-out time is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;


type AttendancePayload = Omit<AttendanceFormValues, "attendance_date" | "user_id"> & {
  user_id: number;
  attendance_date: string;
};

// -------------------------
// HOOK
// -------------------------
export function useAttendenceForm() {
  const defaultMap = {
    lat: -6.2088,
    lng: 106.8456,
  }
  const router = useRouter();
  const [openMap, setOpenMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedAttendance, setSelectedAttendance] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [map, setMap] = useState({
    lat: 0,
    lng: 0,
  });
  const [selectedMap, setSelectedMap] = useState({
    lat: -6.2088,
    lng: 106.8456,
  });
  const queryClient = useQueryClient();

   const { data: shiftData } = useQuery<ShiftByDayResponse>({
    queryKey: ['shift', selectedDate, selectedId],
    queryFn: () => getShiftToday(selectedDate, selectedId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: employeesList } = useQuery({
    queryKey: ["employees", {page: 1,
      per_page: 50000,}],
    queryFn: () => getEmployees({page: 1,
      per_page: 50000,}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const {
    data: detailData,
  } = useQuery({
    queryKey: ["attendanceDetailById", selectedAttendance],
    queryFn: () => getAttendanceDetailById(selectedAttendance),
    enabled: !!selectedAttendance,
    placeholderData: keepPreviousData,
  });

  const employeesOptions = useMemo(() => {
    if (employeesList?.data?.data) {
      return employeesList.data.data.map((item) => ({
        label: item.name,
        value: item.user_id.toString(),
        subtitle: item.job_position,
        image: item.photo_profile,
      }));
    }
    return [];
  }, [employeesList?.data]);

  const mapResponseToForm = (data: AttendanceDetail): AttendanceFormValues => {
    return {
      user_id: String(Number(selectedId)) ?? "",
      attendance_date: dayjs(data.attendance_date).toDate(),
      shift_id: data.metadata.shift_id ?? 0,
      clock_in_at: data.clock.in_at ?? "",
      clock_out_at: data.clock.out_at ?? "",
      latitude: Number(data.location.latitude) ?? undefined,
      longitude: Number(data.location.longitude) ?? undefined,
      note: data.notes ?? "",
    };
  };

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues:{},
  });
  
  useEffect(() => {
    if (detailData?.data) {
      setSelectedDate(detailData.data.attendance_date);
      form.reset(mapResponseToForm(detailData.data));

      setSelectedMap({
        lat: Number(detailData.data.location.latitude),
        lng: Number(detailData.data.location.longitude),
      });
    }
  }, [detailData, form]);

  const mutation = useMutation<unknown, unknown, { selectedId?: string; attendanceId:string; payload: AttendancePayload }>({
    mutationFn: ({ selectedId,attendanceId,  payload }) => {
      if (selectedId) {
        return putAttendance(attendanceId, payload);
      }
      return postAttendance(payload);
    },
    onSuccess: (_, { selectedId }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success(selectedId ? "Update attendance successful." : "Create attendance successful.");
      setIsLoading(false);
      router.push('/attendance/attendance-tracker');
    },
    onError: (_, { selectedId }) => {
      toast.error(selectedId ? "Update attendance failed." : "Create attendance failed.");
      setIsLoading(false);
    },
  });

  // setter user default map base on branch
  useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'user_id' && value.user_id) {
      const selectedUser = employeesList?.data?.data.find(
        (u) => String(u.id) === value.user_id
      );
      if (selectedUser?.branch.latitude && selectedUser?.branch.longitude) {
        setSelectedMap({
          lat: Number(selectedUser?.branch.latitude),
          lng: Number(selectedUser?.branch.longitude),
        });
      }
    }
  });

  return () => subscription.unsubscribe();
}, [form, employeesList, defaultMap]);


  const onSubmit = (values: AttendanceFormValues) => {
    setIsLoading(true);
    let payload: AttendancePayload & { status?: number } = {
      ...values,
      attendance_date: dayjs(values.attendance_date).format("YYYY-MM-DD"),
      user_id: Number(values.user_id) + 1,
    };

    if (selectedId) {
      payload = { ...payload, status: 0 };
    }

    mutation.mutate({ selectedId,  attendanceId: String(detailData?.data.id), payload });
  };

  const handleBack = () => {
    router.back();
  }

  const handleSetMap = () => {
    setMap(selectedMap)
    setOpenMap(false);
  }

  const handleDetailData = (id: string, slug: string) => {
    setSelectedId(id);
    setSelectedAttendance(slug);
  }


  return {
    form, 
    onSubmit, 
    handleBack,
    shiftData,
    setOpenMap,
    openMap,
    handleSetMap,
    selectedMap,
    setSelectedMap,
    map,
    employeesOptions,
    handleDetailData,
    isLoading,
    setIsLoading,
    defaultMap,
    setSelectedDate,
  };
}
