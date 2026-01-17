// hooks/useOKRKeyResultFilter.ts
import { useQuery } from "@tanstack/react-query";
import { getOKRKeyResultGraph } from "@/services/okr/dashboard";
import * as React from "react";

export const useOKRKeyResultFilter = (cycleId: number, keyResultId: number) => {
  const [filters, setFilters] = React.useState<Record<string, any> | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["okrKeyResultGraph", cycleId, keyResultId, filters],
    queryFn: () => getOKRKeyResultGraph(cycleId, keyResultId, filters!),
    enabled: !!filters && !!cycleId && !!keyResultId,
  });

  return {
    filteredData: data?.data,
    isLoading,
    setFilters,
  };
};