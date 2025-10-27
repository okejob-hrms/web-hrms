'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getLeaveBalance,
  getLeaveType,
  postDeduction,
  postLeaveBalance,
  putDeduction,
  putLeaveBalance,
  removeDeduction,
  removeLeaveBalance
} from '@/services/settings';
import { 
  LeaveBalanceRequest,
  LeaveBalance,
  LeaveConfigItem,
  LeaveBalanceItem,
  LeaveConfig,
} from '@/services/settings/types';
import { PaginatedResponse } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { getJobLevels } from '@/services/job-levels';
import { JobLevel } from '@/services/job-levels/types';
import { useRouter } from 'next/navigation';

// =======================
// Hook
// =======================

export function useLeaveManagement() {
  const router = useRouter();
  // LEAVE TYPE STATE
  const [loadingType, setLoadingType] = useState(false);
  
  
  // LEAVE BALANCE STATE
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [openFormBalance, setOpenFormBalance] = useState(false);
  const [openEditBalance, setOpenEditBalance] = useState(false);
  const [openDeleteBalance, setOpenDeleteBalance] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalanceItem>();

  const queryClient = useQueryClient();



  // LEAVE TYPE

  const { data: leaveTypeData, refetch: leaveTypeRefetch } = useQuery<LeaveConfig>({
    queryKey: ["leaveType"],
    queryFn: getLeaveType,
    staleTime: 1000 * 60 * 5,
  });

  const { data: jobLevel } = useQuery<PaginatedResponse<JobLevel>>({
    queryKey: ["jobLevel"],
    queryFn: getJobLevels,
    staleTime: 1000 * 60 * 5,
  });


  const handleAddType = () => {
    router.push('/settings/leave-management/add')
  };
  const handleEditType = () => {};
  const handleDeleteType = () => {};
  


// LEAVE BALANCE

  const { data: leaveBalanceData, refetch: leaveBalanceRefetch } = useQuery<LeaveBalance>({
    queryKey: ["leaveBalance"],
    queryFn: getLeaveBalance,
    staleTime: 1000 * 60 * 5,
  });

  const saveMutationType = useMutation<
    LeaveBalance,
    Error,
    { id?: number; data: LeaveBalanceRequest }
  >({
    mutationFn: ({ id, data }) => {
      if (id) {
        return putLeaveBalance(id, data);
      }
      return postLeaveBalance(data);
    },
    onMutate: () => setLoadingBalance(true),
    onSuccess: () => {
      toast.success("Leave balance successfully save");
      queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
      leaveBalanceRefetch();
      setOpenFormBalance(false);
      setSelectedBalance(undefined);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoadingBalance(false),
  });

  // mutation for delete
  const deleteMutationType = useMutation<LeaveBalance, Error, number>({
    mutationFn: (id) => removeLeaveBalance(id),
    onSuccess: () => {
      toast.success("Leave balance deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
      leaveBalanceRefetch();
      setOpenDeleteBalance(false);
      setSelectedBalance(undefined);
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });

  const handleSaveLeaveBalance = (id: number | undefined, data: LeaveBalanceRequest) => {
    saveMutationType.mutate({ id, data });
  };

  const handleAddBalance = () => {
    // setSelectedData(undefined);
    // setOpen(true);
  };

  const handleEditBalance = (item: LeaveBalanceItem) => {
    console.log(item);
  };
  const handleDeleteBalance = () => {
    if(selectedBalance){
      deleteMutationType.mutate(selectedBalance.id);
    }
  };

  return {
    // LEAVE TYPE
    leaveTypeData,
    loadingType,
    handleAddType,
    handleEditType,
    handleDeleteType,


    // LEAVE BALANCE
    leaveBalanceData,
    loadingBalance,
    handleSaveLeaveBalance,
    handleAddBalance,
    handleEditBalance,
    handleDeleteBalance,
    openFormBalance,
    setOpenFormBalance,
    setOpenDeleteBalance,
    openEditBalance,
    openDeleteBalance,
    selectedBalance,
    setSelectedBalance,
    jobLevel,
  };
}

