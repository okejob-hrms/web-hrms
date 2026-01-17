// hooks/useOKRDashboard.ts
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getOKRDashboard } from "@/services/okr/dashboard";

interface ChartPoint {
  label: string;
  value: number;
  target: number;
}

export const useOKRDashboard = () => {
  const params = useParams();

  const id = React.useMemo(() => {
    const idParam = params?.id;
    if (idParam && !isNaN(Number(idParam))) {
      return Number(idParam);
    }
    return null;
  }, [params]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["okrDashboard", id],
    queryFn: () => getOKRDashboard(id!),
    enabled: !!id,
  });

  /**
   * 🔥 FULLY MAPPED DATA (no helper import)
   */
  const objectives = React.useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((objective) => ({
      id: objective.id,
      name: objective.name,
      progress: objective.progress,
      status: objective.status,
      keyResults: objective.key_results.map((kr) => {
        const chartData: ChartPoint[] = kr.labels.map(
          (label: string, index: number) => ({
            label,
            value: kr.data[index] ?? 0,
            target: kr.target_value,
          }),
        );

        return {
          id: kr.id,
          name: kr.name,
          frequency: kr.frequency_label,
          format: kr.format_label,
          averageActual: kr.average_actual_value,
          averageTarget: kr.average_target_value,
          chartData,
        };
      }),
    }));
  }, [data]);

  return {
    objectives,
    isLoading,
    isError,
  };
};
