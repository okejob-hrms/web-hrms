'use client';

import { useQuery } from '@tanstack/react-query';
import { getWorkingSchedule } from '@/services/settings';
import { WorkScheduleReq, WorkScheduleResponse } from '@/services/settings/types';

// =======================
// Types lokal untuk UI
// =======================
export interface CompanyInfo {
  name: string;
  legalEntity: string;
  industry: string;
  email: string;
  phone: string;
  regNumber: string;
  website?: string;
  address: string;
  logo: string | null;
  logo_url: string | null;
}

export interface PayrollInfo {
  bankAccountName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  currency: string;
}

export interface WorkingHour {
  day: string;
  shift: string;
  workingHours: string;
  break: string;
}

// hasil transformasi final untuk UI
export interface AttendanceConfigData {
  late_tolerance: number;
  max_late_tolerance: number;
  workingHours: WorkingHour[];
  rawWorkSchedules: WorkScheduleReq[];
}

// =======================
// Hook
// =======================
export function useAttendance() {
  return useQuery<WorkScheduleResponse, Error, AttendanceConfigData>({
    queryKey: ['workingSchedule'],
    queryFn: getWorkingSchedule,
    select: (res) => {
      const c = res.message;

      const late_tolerance = c.late_tolerance
      const max_late_tolerance = c.max_late_tolerance

      // Map WorkingHours
      const workingHours = c.schedules.flatMap((day) =>
        day.schedules.length > 0
          ? day.schedules.map((s) => ({
              day: day.day_name,
              shift: s.shift_name,
              workingHours: `${s.start_time} - ${s.end_time}`,
              break:
                s.break_start_time && s.break_end_time
                  ? `${s.break_start_time} - ${s.break_end_time}`
                  : "-",
            }))
          : [
              {
                day: day.day_name,
                shift: "Off",
                workingHours: "-",
                break: "-",
              },
            ]
      );

      const rawWorkSchedules = c.schedules;

      return { late_tolerance, max_late_tolerance, workingHours, rawWorkSchedules };
    },
  });
}
