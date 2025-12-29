'use client';

import { useQuery } from '@tanstack/react-query';
import { getPendingStat } from '@/services/dashboard';

export function useDashboardPending() {
  const { data: pendingStat, isLoading: pendingStatLoading } = useQuery({
    queryKey: ['pendingStat'],
    queryFn: () => getPendingStat(),
  });

  return {
    pendingStat,
    pendingStatLoading,
  };
}
