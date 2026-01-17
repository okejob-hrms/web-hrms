'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceStat, getAttStat, getAttStatList } from '@/services/dashboard';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';
import { getOffboarding, getOffboardingProgress } from '@/services/offboarding-employee';
import { getFields } from '@/services/form';
import { getEmployees } from '@/services/employees';
import { useDebounce } from '@/hooks/use-debounce';

export interface USEESSProps {
  formId?: number;
}

export function useESS({ 
  formId,
}: USEESSProps = {}) {
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const debouncedEmployee = useDebounce(searchEmployee, 300);
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

  const {
    data: formFieldsResponse,
    isLoading: formFieldsLoading,
    isFetching: formFieldsFetching,
  } = useQuery({
    queryKey: ['formFields', formId], 
    queryFn: async () => {
      try {
        return await getFields({ form_id: formId! });
      } catch (err) {
        console.error("CRITICAL ERROR IN SERVICE:", err);
        throw err;
      }
    },
    enabled: !!formId, 
    retry: false,
    staleTime: 0,
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["supervisor-assessment-Employees", debouncedEmployee],
    queryFn: () =>
      getEmployees(
        debouncedEmployee
          ? { search: debouncedEmployee, per_page: 50 }
          : { per_page: 50 },
      ),
    enabled: openFormModal,
    // placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
    formFields: formFieldsResponse?.data,
    formFieldsLoading,
    error,
    setOpenFormModal,
    openFormModal,
    employees,
    isLoadingEmployees,
    searchEmployee,
    setSearchEmployee
  };
}
