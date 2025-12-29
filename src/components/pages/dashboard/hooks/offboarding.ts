'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOffboardingList, getOffboardingStat } from '@/services/dashboard';
import { ListOff } from '@/services/dashboard/types';
import { PaginatedResponse } from '@/lib/types';
import { PaginationState } from '@tanstack/react-table';

export function useDashboardOffboarding() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });


  const { data: offStat, isLoading: offStatLoading } = useQuery({
    queryKey: ['offStat', filters],
    queryFn: () => getOffboardingStat(filters),
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

  return {
    offStat,
    offStatLoading,
    dataList,
    loadingList,
    dataPagination,
    pagination,
    setPagination,
    search,
    setSearch,
    filters,
    setFilters,
  };
}
