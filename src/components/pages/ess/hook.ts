'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceStat, getAttStat, getAttStatList } from '@/services/dashboard';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';
import { getOffboarding, getOffboardingProgress } from '@/services/offboarding-employee';

export function useESS() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState({
    start_date: "",
    end_date: "",
    branch_id: "",
    department_id: "",
  });

// ==========  ATTENDANCE
  const { data: attendanceStat, isLoading: attendanceStatLoading } = useQuery({
    queryKey: ['attendanceStat', filter],
    queryFn: () => getAttendanceStat(filter),
  });

  const { data: attStat, isLoading: attStatLoading } = useQuery({
    queryKey: ['attStat', filter],
    queryFn: () => getAttStat(filter),
  });

  const { 
    data: offboardingResponse, 
    isLoading: offboardingLoading, 
    error 
  } = useQuery({
    queryKey: ['offboardingStatus'],
    queryFn: () => getOffboarding(),
    retry: false,
  });

  const { 
    data: offboardingProgressResponse, 
    isLoading: offboardingProgressLoading, 
    error: offboardingProgressError, 
  } = useQuery({
    queryKey: ['offboardingProgress', offboardingResponse?.data?.id], 
    queryFn: () => getOffboardingProgress(offboardingResponse?.data?.id || 1),
    enabled: !!offboardingResponse?.data?.id,
    retry: false,
  });
  

// ========== END ATTENDANCE

  return {
    filter,
    setFilter,
    attendanceStat,
    attendanceStatLoading,
    attStat,
    attStatLoading,
    offboardingData: offboardingResponse?.data,
    offboardingLoading,
    offboardingProgress: offboardingProgressResponse?.data,
    offboardingProgressLoading,
    offboardingProgressError,
    error,
  };
}
