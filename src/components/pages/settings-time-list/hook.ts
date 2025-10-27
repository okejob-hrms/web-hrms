"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBranches,
  getLateDeduction,
  getShift,
  getWorkingSchedule,
  postDeduction,
  putDeduction,
  removeDeduction,
} from "@/services/settings";
import {
  DeductionRequest,
  ICompanyBranches,
  LateDeductions,
  ShiftResponse,
  WorkScheduleReq,
  WorkScheduleResponse,
} from "@/services/settings/types";
import { PaginatedResponse } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  enable_late_deduction?: boolean;
}

// =======================
// Hook
// =======================
export function useAttendance() {
  const [selectedBranch, setSelectedBranch] = useState("");

  const { data: shiftData } = useQuery<ShiftResponse>({
    queryKey: ["shift"],
    queryFn: getShift,
    staleTime: 1000 * 60 * 5,
  });

  const attendanceQuery = useQuery<
    WorkScheduleResponse,
    Error,
    AttendanceConfigData
  >({
    queryKey: ["workingSchedule", selectedBranch],
    queryFn: () => getWorkingSchedule(selectedBranch),
    enabled: !!selectedBranch,
    select: (res) => {
      const c = res.data;
      const late_tolerance = c.late_tolerance;
      const max_late_tolerance = c.max_late_tolerance;

      const workingHours = c.schedules.flatMap((day) =>
        day.schedules.length > 0
          ? day.schedules.map((s) => ({
              day: day.day_name,
              shift:
                shiftData?.data.find((a) => a.id === s.shift_id)?.name ?? "Off",
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
            ],
      );

      const rawWorkSchedules = c.schedules.map((day) => ({
        ...day,
        schedules: day.schedules.map((s) => ({
          ...s,
          shift_name:
            s.shift?.name ??
            shiftData?.data.find((sh) => sh.id === s.shift_id)?.name ??
            "Unknown",
        })),
      }));

      return {
        late_tolerance,
        max_late_tolerance,
        workingHours,
        rawWorkSchedules,
      };
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    ...attendanceQuery, // isLoading, data, refetch, dll
    selectedBranch,
    setSelectedBranch,
  };
}

export function useLateDeduction() {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [selectedData, setSelectedData] = useState<LateDeductions>();
  const [branches, setBranches] = useState<ICompanyBranches[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // list late deduction
  const { data: lateDeductionData, refetch: lateDeductionRefetch } = useQuery<
    PaginatedResponse<LateDeductions>
  >({
    queryKey: ["lateDeduction"],
    queryFn: getLateDeduction,
    staleTime: 1000 * 60 * 5,
  });

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBranches();
      setBranches(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // list shift
  const { data: shiftDataList } = useQuery<ShiftResponse>({
    queryKey: ["shiftList"],
    queryFn: getShift,
    staleTime: 1000 * 60 * 5,
  });

  // dropdown shift options
  const shiftOptions =
    shiftDataList?.data?.map((shift) => ({
      value: shift.id.toString(),
      label: shift.name,
    })) ?? [];

  // mutation untuk save (create/update)
  const saveMutation = useMutation<
    PaginatedResponse<LateDeductions>,
    Error,
    { id?: number; data: DeductionRequest }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putDeduction(id, data);
      }
      return postDeduction(data);
    },
    onMutate: () => setLoadingSave(true),
    onSuccess: () => {
      handleCloseLateDeduction();
      toast.success("Late deduction saved successfully");
      queryClient.invalidateQueries({ queryKey: ["lateDeduction"] });
      lateDeductionRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoadingSave(false),
  });

  // mutation untuk delete
  const deleteMutation = useMutation<
    PaginatedResponse<LateDeductions>,
    Error,
    number
  >({
    mutationFn: (id) => removeDeduction(id),
    onSuccess: () => {
      setOpenDelete(false);
      setSelectedData(undefined);
      toast.success("Late deduction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lateDeduction"] });
      lateDeductionRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });

  const handleEdit = (item: LateDeductions) => {
    setSelectedData(item);
    setOpen(true);
  };

  const handleDeleteClick = (item: LateDeductions) => {
    setSelectedData(item);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedData) {
      deleteMutation.mutate(selectedData.id);
    }
  };

  const handleAdd = () => {
    setSelectedData(undefined);
    setOpen(true);
  };

  const handleSaveLateDeduction = (
    id: number | undefined,
    data: DeductionRequest,
  ) => {
    saveMutation.mutate({ id, data });
  };

  const handleCloseLateDeduction = () => {
    setOpen(false);
  };

  return {
    lateDeductionData,
    open,
    setOpen,
    openDelete,
    setOpenDelete,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAdd,
    handleSaveLateDeduction,
    handleCloseLateDeduction,
    shiftOptions,
    loadingSave,
    selectedData,
    branches,
    loading,
  };
}
