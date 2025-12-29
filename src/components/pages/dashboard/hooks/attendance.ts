'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAgeStat, getAttendanceStat, getEmployeeStat, getExperienceStat, getGenderStat, getOffboardingList, getOffboardingStat } from '@/services/dashboard';
import { ListOff } from '@/services/dashboard/types';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';
import { getJobPosition } from '@/services/job-position';

export function useDashboardAnalytics() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    branch_id: "",
    department_id: "",
  });


// ==========  ATTENDANCE
  const { data: attendanceStat, isLoading: attendanceStatLoading } = useQuery({
    queryKey: ['attendanceStat', filters],
    queryFn: () => getAttendanceStat(filters),
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: dataList,
    isLoading: loadingList,
  } = useQuery({
    queryKey: ["list", pagination, search],
    queryFn: () => getOffboardingList(pagination, search),
  });

  const dataPagination: PaginatedResponse<ListOff> = {
    current_page: dataList?.pagination.current_page ?? 1,
    current_page_url: `${dataList?.pagination.first ?? ''}`,
    first_page_url: dataList?.pagination.first ?? '',
    from: dataList?.pagination.from ?? 0,
    last_page: dataList?.pagination.last_page ?? 1,
    next_page_url: dataList?.pagination.next ?? null,
    path: 'api/v1/payruns',
    per_page: dataList?.pagination.per_page ?? 10,
    prev_page_url: dataList?.pagination.prev ?? null,
    to: dataList?.pagination.to ?? 0,
    total: dataList?.pagination.total ?? 0,
    data: dataList?.data ?? [],
  };
// ========== END ATTENDANCE


// ==========  EMPLOYEE
  const { data: employeeStat, isLoading: employeeStatLoading } = useQuery({
    queryKey: ['employeeStat', filters],
    queryFn: () => getEmployeeStat(filters),
  });
// ==========  END EMPLOYEE


// ==========  EXPERIENCE
  const { data: experienceStat, isLoading: experienceStatLoading } = useQuery({
    queryKey: ['experienceStat', filters],
    queryFn: () => getExperienceStat(filters),
  });
// ==========  END EXPERIENCE

// ==========  AGE
  const { data: ageStat, isLoading: ageStatLoading } = useQuery({
    queryKey: ['ageStat', filters],
    queryFn: () => getAgeStat(filters),
  });
// ==========  END AGE

// ==========  GENDER
  const { data: genderStat, isLoading: genderStatLoading } = useQuery({
    queryKey: ['genderStat', filters],
    queryFn: () => getGenderStat(filters),
  });
// ==========  END GENDER

  const { data: positions } = useQuery({
    queryKey: ["job-position"],
    queryFn: getJobPosition,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    attendanceStat,
    attendanceStatLoading,
    dataList,
    loadingList,
    dataPagination,
    pagination,
    setPagination,
    search,
    setSearch,
    filters,
    setFilters,
    employeeStat,
    employeeStatLoading,
    experienceStat,
    experienceStatLoading,
    ageStat,
    ageStatLoading,
    genderStat,
    genderStatLoading,
    positions,
  };
}
