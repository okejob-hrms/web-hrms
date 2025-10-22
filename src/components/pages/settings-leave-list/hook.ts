'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBranches, getLateDeduction, getLeaveBalance, getShift, getWorkingSchedule, postDeduction, putDeduction, removeDeduction } from '@/services/settings';
import { DeductionRequest, ICompanyBranches, LateDeductions, LeaveBalance, ShiftResponse, WorkScheduleReq, WorkScheduleResponse } from '@/services/settings/types';
import { PaginatedResponse } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// =======================
// Hook
// =======================

export function useLateDeduction() {
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const queryClient = useQueryClient();

  // list leaveBalance
  const { data: leaveBalanceData, refetch: leaveBalanceRefetch } = useQuery<LeaveBalance>({
    queryKey: ["leaveBalance"],
    queryFn: getLeaveBalance,
    staleTime: 1000 * 60 * 5,
  });

  // mutation for save (create/update)
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
      leaveBalanceRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoadingSave(false),
  });

  // mutation for delete
  const deleteMutation = useMutation<PaginatedResponse<LateDeductions>, Error, number>({
    mutationFn: (id) => removeDeduction(id),
    onSuccess: () => {
      toast.success("Late deduction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lateDeduction"] });
      leaveBalanceRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });


  const handleEdit = (item: LateDeductions) => {
    console.log(item);
  };

  const handleDeleteClick = (item: LateDeductions) => {
    console.log(item);
  };

  const handleDeleteConfirm = () => {
    // if (selectedData) {
    //   deleteMutation.mutate(selectedData.id);
    // }
  };

  const handleAdd = () => {
    // setSelectedData(undefined);
    // setOpen(true);
  };

  const handleSaveLateDeduction = (id: number | undefined, data: DeductionRequest) => {
    saveMutation.mutate({ id, data });
  };

  const handleCloseLateDeduction = () => {
    // setOpen(false);
  };

  const handleEditType = () => {};
  const handleDeleteType = () => {};

  return {
    leaveBalanceData,
    open,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAdd,
    handleSaveLateDeduction,
    handleCloseLateDeduction,
    loading,
    handleEditType,
    handleDeleteType,
  };
}

