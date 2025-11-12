"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShift, updateAttendanceTime } from "@/services/settings";
import { AttendanceRequest, ShiftResponse } from "@/services/settings/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AttendanceConfigData } from "../settings-time-list/hook";

// -------------------------
// SCHEMA & TYPES
// -------------------------
const companySchema = z.object({
  late_tolerance: z.string().min(1, "Late tolerance must be at least 1"),
  max_late_tolerance: z.string().min(1, "Absent after must be at least 1"),
  workSchedules: z
    .array(
      z.object({
        day_of_week: z.number(),
        schedules: z.array(
          z.object({
            shift_id: z.number(),
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
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function mapToApiPayload(values: CompanyFormValues): AttendanceRequest {
  return {
    late_tolerance: Number(values.late_tolerance),
    max_late_tolerance: Number(values.max_late_tolerance),
    work_schedules: (values.workSchedules ?? [])?.map((day) => ({
      day_of_week: day.day_of_week,
      day_name: DAY_NAMES[day.day_of_week] ?? "",
      has_schedule: (day.schedules?.length ?? 0) > 0,
      total_shifts: day.schedules?.length ?? 0,
      schedules: (day.schedules ?? []).map((s) => ({
        shift_id: s.shift_id,
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
    late_tolerance: String(data?.late_tolerance ?? ""),
    max_late_tolerance: String(data?.max_late_tolerance ?? ""),
    workSchedules: data?.rawWorkSchedules?.map((day) => ({
      day_of_week: day.day_of_week,
      schedules: (day.schedules ?? []).map((s) => {
        return {
          shift_id: s.shift_id,
          shift_name: s.shift_name,
          start_time: s.start_time,
          end_time: s.end_time,
          sequence: s.sequence,
          ends_next_day: s.ends_next_day,
          break_start_time: s.break_start_time,
          break_end_time: s.break_end_time,
        };
      }),
    })),
  };
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// -------------------------
// HOOK
// -------------------------
export function useCompanyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<AttendanceConfigData | null>(null);
  const [branch, setBranch] = useState<string | null>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("dataBranch");
      if (storedData) {
        console.log('JSON.parse(storedData)', JSON.parse(storedData));
        setData(JSON.parse(storedData) as AttendanceConfigData);
        setBranch(JSON.parse(localStorage.getItem("branch") || "null"));
      }
    }
  }, []);

  // Get shift list
  const { data: shiftData } =
    useQuery<ShiftResponse>({
      queryKey: ["shift"],
      queryFn: getShift,
      staleTime: 1000 * 60 * 5,
    });

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: data && shiftData ? mapFromApiResponse(data) : {},
  });

  useEffect(() => {
    if (data && shiftData) {
      form.reset(mapFromApiResponse(data));
    }
  }, [data, shiftData, form]);

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) =>
      updateAttendanceTime(branch ?? "", mapToApiPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceConfig"] });
      toast.success("Update attendance time successful.");
      router.push("/settings/time-attendance/attendance-configuration");
    },
    onError: (err) => {
      console.log(err);
      toast.error("Update attendance time failed.");
    },
  });

  const onSubmit = (values: CompanyFormValues) => {
    if (!branch) {
      toast.error("Please select a branch before updating attendance time.");
      return;
    }
    mutation.mutate(values);
  };

  const handleBack = () => {
    router.back();
  };

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    dataWorkSchedule: data,
    handleBack,
    daysOfWeek,
    shiftData,
  };
}
