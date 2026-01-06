'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdditionalList, getAdditionalListDetail, getAgeStat, getAgeStatList, getAttendanceStat, getAttStat, getAttStatList, getEmployeeStat, getExperienceStat, getExperienceTrend, getExpStatList, getGenderStat, getOffboardingList, getOffboardingStat } from '@/services/dashboard';
import { AdditionalListDetailData, AgeListData, AttListData, ExpTrendListData } from '@/services/dashboard/types';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';
import { getBranches, getBranchesAll } from '@/services/settings';
import { getDepartment } from '@/services/department';

export function useDashboardAnalytics() {
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
  const [paginationAge, setPaginationAge] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchAge, setSearchAge] = useState('');

  const {
    data: branchesData,
  } = useQuery({
    queryKey: ["company-branches"],
    queryFn: async () => {
      const response = await getBranchesAll();
      return response.data ?? [];
    },
  });

  const {
    data: departmentData,
  } = useQuery({
    queryKey: ["departments", pagination],
    queryFn: () => getDepartment(pagination),
  });
  


// ==========  ATTENDANCE
  const { data: attendanceStat, isLoading: attendanceStatLoading } = useQuery({
    queryKey: ['attendanceStat', filter],
    queryFn: () => getAttendanceStat(filter),
  });

  const { data: attendanceStatDetails, isLoading: attendanceStatLoadingDetails } = useQuery({
    queryKey: ['attendanceStatDetails', filters],
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
    queryKey: ["listAtt", pagination, search, filters],
    queryFn: () => getAttStatList(pagination, search, filters),
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
    queryKey: ['employeeStat', filter],
    queryFn: () => getEmployeeStat(filter),
  });
// ==========  END EMPLOYEE


// ==========  EXPERIENCE
  const { data: experienceStat, isLoading: experienceStatLoading } = useQuery({
    queryKey: ['experienceStat', filter],
    queryFn: () => getExperienceStat(filter),
  });

  const { data: experienceStatDetail, isLoading: experienceStatLoadingDetail } = useQuery({
    queryKey: ['experienceStatDetail', filters],
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
    queryKey: ["listExpTrend", paginationExp, searchExp, filters],
    queryFn: () => getExpStatList(paginationExp, searchExp, filters),
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
    queryKey: ['ageStat', filter],
    queryFn: () => getAgeStat(filter),
  });

  const {
    data: dataListAge,
    isLoading: loadingListAge,
  } = useQuery({
    queryKey: ["listAge", paginationExp, searchAge],
    queryFn: () => getAgeStatList(paginationExp, searchAge),
  });

  const dataPaginationAge: PaginatedResponse<AgeListData> = {
    current_page: dataListAge?.pagination.current_page ?? 1,
    current_page_url: `${dataListAge?.pagination.first ?? ''}`,
    first_page_url: dataListAge?.pagination.first ?? '',
    from: dataListAge?.pagination.from ?? 0,
    last_page: dataListAge?.pagination.last_page ?? 1,
    next_page_url: dataListAge?.pagination.next ?? null,
    path: 'api/v1/Ageendance',
    per_page: dataListAge?.pagination.per_page ?? 10,
    prev_page_url: dataListAge?.pagination.prev ?? null,
    to: dataListAge?.pagination.to ?? 0,
    total: dataListAge?.pagination.total ?? 0,
    data: dataListAge?.data ?? [],
  };
// ==========  END AGE

// ==========  GENDER
  const { data: genderStat, isLoading: genderStatLoading } = useQuery({
    queryKey: ['genderStat', filter],
    queryFn: () => getGenderStat(filter),
  });
// ==========  END GENDER

// ==========  ADDITIONAL
  const { data: additionalStat, isLoading: additionalStatLoading } = useQuery({
    queryKey: ['additionalStat', filter],
    queryFn: () => getAdditionalList(filter),
  });

  const {
    data: additionalStatDetail,
    isLoading: additionalStatDetailLoading,
  } = useQuery({
    queryKey: ["listAdditional", paginationAdd, searchAdd, typeAdditional],
    queryFn: () => getAdditionalListDetail(paginationAdd, searchAdd, typeAdditional),
    enabled: !!typeAdditional,
  });
  
const dataPaginationAdditionalDetail: PaginatedResponse<AdditionalListDetailData> =
  useMemo(() => ({
    current_page: additionalStatDetail?.pagination.current_page ?? 1,
    current_page_url: additionalStatDetail?.pagination.first ?? '',
    first_page_url: additionalStatDetail?.pagination.first ?? '',
    from: additionalStatDetail?.pagination.from ?? 0,
    last_page: additionalStatDetail?.pagination.last_page ?? 1,
    next_page_url: additionalStatDetail?.pagination.next ?? null,
    path: 'api/v1/dashboard/analytic/additional-detail',
    per_page:
      additionalStatDetail?.pagination.per_page ?? paginationAdd.pageIndex,
    prev_page_url: additionalStatDetail?.pagination.prev ?? null,
    to: additionalStatDetail?.pagination.to ?? 0,
    total: additionalStatDetail?.pagination.total ?? 0,
    data: additionalStatDetail?.data ?? [],
  }), [additionalStatDetail, paginationAdd.pageSize]);

// ==========  END ADDITIONAL

  return {
    filter,
    setFilter,
    attendanceStatDetails,
    attendanceStatLoadingDetails,
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
    dataListAge,
    loadingListAge,
    dataPaginationAge,
    paginationAge,
    setPaginationAge,
    searchAge,
    setSearchAge,
    branchesData,
    departmentData,
    experienceStatDetail,
    experienceStatLoadingDetail,
  };
}
