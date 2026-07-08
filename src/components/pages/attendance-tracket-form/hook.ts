'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ShiftByDayResponse } from '@/services/settings/types';
import { getShiftTodayWithId } from '@/services/settings';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEmployees } from '@/services/employees';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  getAttendanceDetailById,
  postAttendance,
  putAttendance,
} from '@/services/attendance';
import { AttendanceDetail } from '@/services/attendance/types';
import { ApiErrorResponse } from '@/lib/types';
import { useTranslations } from 'next-intl';

export type AttendanceFormValues = {
  user_id: string;
  attendance_date: Date;
  shift_id: number;
  clock_in_at: string;
  clock_out_at: string;
  latitude?: number;
  longitude?: number;
  note?: string;
};

type AttendancePayload = Omit<
  AttendanceFormValues,
  'attendance_date' | 'user_id'
> & {
  user_id: number;
  attendance_date: string;
};

export function useAttendenceForm() {
  const t = useTranslations('attendance');
  const pathname = usePathname();
  const isAddMode = pathname.endsWith('/add');

  const attendanceSchema = useMemo(
    () =>
      z.object({
        user_id: z
          .string({ error: t('employeeRequired') })
          .min(1, t('employeeRequired')),
        attendance_date: z.date({ error: t('attendanceDateRequired') }),
        shift_id: z
          .number({ error: t('shiftRequired') })
          .min(1, t('shiftRequired')),
        clock_in_at: z
          .string({ error: t('clockInRequired') })
          .min(1, t('clockInRequired')),
        clock_out_at: z
          .string({ error: t('clockOutRequired') })
          .min(1, t('clockOutRequired')),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        note: z.string().optional(),
      }),
    [t],
  );

  const defaultMap = {
    lat: -6.2088,
    lng: 106.8456,
  };
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
    queryFn: () => getShiftTodayWithId(selectedDate, selectedId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: employeesList } = useQuery({
    queryKey: [
      'employees',
      {
        page: 1,
        per_page: 50000,
      },
    ],
    queryFn: () =>
      getEmployees({
        page: 1,
        per_page: 50000,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: detailData } = useQuery({
    queryKey: ['attendanceDetailById', selectedAttendance],
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
      user_id: String(Number(selectedId)) ?? '',
      attendance_date: dayjs(data.attendance_date).toDate(),
      shift_id: data.metadata.shift_id ?? 0,
      clock_in_at: data.clock.in_at ?? '',
      clock_out_at: data.clock.out_at ?? '',
      latitude: Number(data.location.latitude) ?? undefined,
      longitude: Number(data.location.longitude) ?? undefined,
      note: data.notes ?? '',
    };
  };

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      user_id: '',
      clock_in_at: '',
      clock_out_at: '',
      note: '',
    },
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

  const mutation = useMutation<
    unknown,
    Error,
    { selectedId?: string; attendanceId: string; payload: AttendancePayload }
  >({
    mutationFn: ({ attendanceId, payload }) => {
      if (!isAddMode) {
        return putAttendance(attendanceId, payload);
      }
      return postAttendance(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success(
        isAddMode ? t('createAttendanceSuccess') : t('updateAttendanceSuccess'),
      );
      setIsLoading(false);
      router.push('/attendance/attendance-tracker');
    },
    onError: async (error) => {
      setIsLoading(false);
      const fallback = isAddMode
        ? t('createAttendanceFailed')
        : t('updateAttendanceFailed');

      const response = (error as Error & { response?: Response })?.response;
      if (!response) {
        toast.error(fallback);
        return;
      }

      try {
        const data: ApiErrorResponse = await response.json();

        if (data.errors) {
          Object.entries(data.errors).forEach(([fieldName, messages]) => {
            if (messages?.[0]) {
              form.setError(fieldName as keyof AttendanceFormValues, {
                type: 'server',
                message: messages[0],
              });
            }
          });
        }

        const detailMessages = data.errors
          ? Array.from(new Set(Object.values(data.errors).flat()))
          : [];
        const cleanMessage = data.message?.replace(
          /\s*\(and \d+ more errors?\)\.?$/i,
          '',
        );

        toast.error(detailMessages.join(' ') || cleanMessage || fallback);
      } catch {
        toast.error(fallback);
      }
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'user_id' && value.user_id) {
        const selectedUser = employeesList?.data?.data.find(
          (u) => String(u.user_id) === value.user_id,
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
      attendance_date: dayjs(values.attendance_date).format('YYYY-MM-DD'),
      user_id: Number(values.user_id),
    };

    if (selectedId) {
      payload = { ...payload, status: 0 };
    }

    mutation.mutate({
      selectedId,
      attendanceId: String(detailData?.data.id),
      payload,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSetMap = () => {
    setMap(selectedMap);
    setOpenMap(false);
  };

  const handleDetailData = useCallback((id: string, slug: string) => {
    setSelectedId(id);
    setSelectedAttendance(slug);
  }, []);

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
    setSelectedId,
  };
}
