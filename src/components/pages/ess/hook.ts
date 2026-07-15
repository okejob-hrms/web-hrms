'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { getHandoverItems, getOffboarding, getOffboardingProgress } from '@/services/offboarding-employee';
import { getFields } from '@/services/form';
import { getEmployees } from '@/services/employees';
import { useDebounce } from '@/hooks/use-debounce';
import { getAttendanceDashboardEmployee, getWaitingDashboardEmployee } from '@/services/ess';

export interface USEESSProps {
  formId?: number;
}

export function useESS({ 
  formId,
}: USEESSProps = {}) {
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const debouncedEmployee = useDebounce(searchEmployee, 300);
  const [filter, setFilter] = useState({
    start_date: "",
    end_date: "",
  });

// ==========  DASHBOARD
  const { data: attendanceStat, isLoading: attendanceStatLoading } = useQuery({
    queryKey: ['attendanceStat', filter],
    queryFn: () => getAttendanceDashboardEmployee(filter),
  });

  const { data: waitingStat, isLoading: waitingStatLoading } = useQuery({
    queryKey: ['waitingStat'],
    queryFn: () => getWaitingDashboardEmployee(),
  });

// ========== END DASHBOARD


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
    queryFn: () => getOffboardingProgress(offboardingResponse?.data?.id),
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
          ? { search: debouncedEmployee, per_page: 10000 }
          : { per_page: 10000 },
      ),
    enabled: openFormModal,
    // placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { 
    data: handoverResponse, 
    isLoading: handoverLoading,
    refetch: refetchHandover 
  } = useQuery({
    queryKey: ['handoverItems', 'work'],
    queryFn: () => getHandoverItems({category: 'work'}),
    enabled: !!offboardingResponse?.data?.id,
  });

  const { 
    data: documentHandoverResponse, 
    isLoading: documentHandoverLoading 
  } = useQuery({
    queryKey: ['handoverItems', 'document'],
    queryFn: () => getHandoverItems({category: 'document'}),
    enabled: !!offboardingResponse?.data?.id,
  });
  
  return {
    filter,
    setFilter,
    attendanceStat,
    attendanceStatLoading,
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
    setSearchEmployee,
    handoverItems: handoverResponse?.data || [],
    handoverLoading: offboardingLoading || handoverLoading,
    refetchHandover,
    documentHandovers: documentHandoverResponse?.data || [], // Return document specific data
    documentHandoverLoading,
    waitingStat,
    waitingStatLoading,
  };
}
