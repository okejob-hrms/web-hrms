import { getOvertimeConfig } from "@/services/settings";
import { OvertimeApiModel } from "@/services/settings/types";
import { useQuery } from "@tanstack/react-query";

export function useOvertimeConfig() {

  // list late deduction
  const { data: overtimeData } = useQuery<OvertimeApiModel>({
    queryKey: ["overtimeDatas"],
    queryFn: getOvertimeConfig,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return {
    overtimeData,
  };
}