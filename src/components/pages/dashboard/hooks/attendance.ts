'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdditionalList, getAdditionalListDetail, getAgeStat, getAttendanceStat, getAttStat, getAttStatList, getEmployeeStat, getExperienceStat, getExperienceTrend, getExpStatList, getGenderStat, getOffboardingList, getOffboardingStat } from '@/services/dashboard';
import { AdditionalListDetailData, AttListData, ExpTrendListData } from '@/services/dashboard/types';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';
import { getJobPosition } from '@/services/job-position';

export function useDashboardAnalytics() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    branch_id: "",
    department_id: "",
  });
  const [paginationExp, setPaginationExp] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchExp, setSearchExp] = useState('');
  const [typeAdditional, setTypeAdditional] = useState('');
  const [paginationAdd, setPaginationAdd] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchAdd, setSearchAdd] = useState('');


// ==========  ATTENDANCE
  const { data: attendanceStat, isLoading: attendanceStatLoading } = useQuery({
    queryKey: ['attendanceStat', filters],
    queryFn: () => getAttendanceStat(filters),
  });

  const { data: attStat, isLoading: attStatLoading } = useQuery({
    queryKey: ['attStat', filters],
    queryFn: () => getAttStat(filters),
  });

  const {
    data: dataListAtt,
    isLoading: loadingListAtt,
  } = useQuery({
    queryKey: ["listAtt", pagination, search],
    queryFn: () => getAttStatList(pagination, search),
  });

  const dataPaginationAtt: PaginatedResponse<AttListData> = {
    current_page: dataListAtt?.pagination.current_page ?? 1,
    current_page_url: `${dataListAtt?.pagination.first ?? ''}`,
    first_page_url: dataListAtt?.pagination.first ?? '',
    from: dataListAtt?.pagination.from ?? 0,
    last_page: dataListAtt?.pagination.last_page ?? 1,
    next_page_url: dataListAtt?.pagination.next ?? null,
    path: 'api/v1/attendance',
    per_page: dataListAtt?.pagination.per_page ?? 10,
    prev_page_url: dataListAtt?.pagination.prev ?? null,
    to: dataListAtt?.pagination.to ?? 0,
    total: dataListAtt?.pagination.total ?? 0,
    data: dataListAtt?.data ?? [],
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

  const { data: experienceTrend, isLoading: experienceTrendLoading } = useQuery({
    queryKey: ['experienceTrend', filters],
    queryFn: () => getExperienceTrend(filters),
  });

  const {
    data: dataListExpTrend,
    isLoading: loadingListExpTrend,
  } = useQuery({
    queryKey: ["listExpTrend", paginationExp, searchExp],
    queryFn: () => getExpStatList(paginationExp, searchExp),
  });

  const dataPaginationExpTrend: PaginatedResponse<ExpTrendListData> = {
    current_page: dataListExpTrend?.pagination.current_page ?? 1,
    current_page_url: `${dataListExpTrend?.pagination.first ?? ''}`,
    first_page_url: dataListExpTrend?.pagination.first ?? '',
    from: dataListExpTrend?.pagination.from ?? 0,
    last_page: dataListExpTrend?.pagination.last_page ?? 1,
    next_page_url: dataListExpTrend?.pagination.next ?? null,
    path: 'api/v1/ExpTrendendance',
    per_page: dataListExpTrend?.pagination.per_page ?? 10,
    prev_page_url: dataListExpTrend?.pagination.prev ?? null,
    to: dataListExpTrend?.pagination.to ?? 0,
    total: dataListExpTrend?.pagination.total ?? 0,
    data: dataListExpTrend?.data ?? [],
  };
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

// ==========  ADDITIONAL
  const { data: additionalStat, isLoading: additionalStatLoading } = useQuery({
    queryKey: ['additionalStat', filters],
    queryFn: () => getAdditionalList(filters),
  });

  const {
    data: additionalStatDetail,
    isLoading: additionalStatDetailLoading,
  } = useQuery({
    queryKey: ["listAdditional", paginationAdd, searchAdd, typeAdditional],
    queryFn: () => getAdditionalListDetail(paginationAdd, searchAdd, typeAdditional),
  });

  const dataPaginationAdditionalDetail: PaginatedResponse<AdditionalListDetailData> = {
    current_page: additionalStatDetail?.pagination.current_page ?? 1,
    current_page_url: `${additionalStatDetail?.pagination.first ?? ''}`,
    first_page_url: additionalStatDetail?.pagination.first ?? '',
    from: additionalStatDetail?.pagination.from ?? 0,
    last_page: additionalStatDetail?.pagination.last_page ?? 1,
    next_page_url: additionalStatDetail?.pagination.next ?? null,
    path: 'api/v1/dashboard/analytic/additional-detail',
    per_page: additionalStatDetail?.pagination.per_page ?? 10,
    prev_page_url: additionalStatDetail?.pagination.prev ?? null,
    to: additionalStatDetail?.pagination.to ?? 0,
    total: additionalStatDetail?.pagination.total ?? 0,
    data: additionalStatDetail?.data ?? [],
  };
// ==========  END ADDITIONAL

  return {
    attendanceStat,
    attendanceStatLoading,
    dataListAtt,
    loadingListAtt,
    dataPaginationAtt,
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
    attStat,
    attStatLoading,
    experienceTrend,
    experienceTrendLoading,
    paginationExp,
    searchExp,
    dataListExpTrend,
    loadingListExpTrend,
    dataPaginationExpTrend,
    setPaginationExp,
    setSearchExp,
    additionalStat,
    additionalStatLoading,
    additionalStatDetail,
    additionalStatDetailLoading,
    dataPaginationAdditionalDetail,
    typeAdditional,
    setTypeAdditional,
    paginationAdd,
    setPaginationAdd,
    searchAdd,
    setSearchAdd,
  };
}
