'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPayrollDashboard } from '@/services/dashboard';

export function useDashboardPayroll() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    // start_date: "",
    // end_date: "",
    branch_id: "",
    department_id: "",
  });

  const { data: payrolls, isLoading: payrollsLoading } = useQuery({
    queryKey: ['payrolls', filters],
    queryFn: () => getPayrollDashboard(filters),
  });

  return {
    payrolls,
    payrollsLoading,
    search,
    setSearch,
    filters,
    setFilters,
  };
}
