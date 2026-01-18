'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPayrollDashboard, getPayrollTrend } from '@/services/dashboard';

export function useDashboardPayroll() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });

  const { data: payrolls, isLoading: payrollsLoading } = useQuery({
    queryKey: ['payrolls'],
    queryFn: () => getPayrollDashboard(),
  });

  const { data: payrollTrend, isLoading: payrollTrendLoading } = useQuery({
    queryKey: ['payrollTrend', filters],
    queryFn: () => getPayrollTrend(filters),
  });

  return {
    payrolls,
    payrollsLoading,
    search,
    setSearch,
    filters,
    setFilters,
    payrollTrend,
    payrollTrendLoading,
  };
}
