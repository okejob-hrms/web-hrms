import { getOvertimeConfig } from "@/services/settings";
import { OvertimeResponse } from "@/services/settings/types";
import { useQuery } from "@tanstack/react-query";

export function useOvertimeConfig() {

  // list late deduction
  const { data: overtimeData } = useQuery<OvertimeResponse>({
    queryKey: ["overtimeDatas"],
    queryFn: getOvertimeConfig,
    staleTime: 1000 * 60 * 5,
  });

  return {
    overtimeData,
  };
}