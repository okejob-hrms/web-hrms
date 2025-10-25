import { getLeaveBalances } from "@/services/employees/leave-balances";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import * as React from "react";

export const useLeaveBalanceTable = () => {
  const router = useRouter();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: leaveBalances } = useQuery({
    queryKey: ["leave-balances", pagination],
    queryFn: () => getLeaveBalances(pagination),
  });

  const handleEdit = (id: number) => {
    router.push(`settings/leave-balance/edit/${id}`);
  };

  const handleNewBalance = () => {};
  return {
    handleEdit,
    handleNewBalance,
    leaveBalances,
    pagination,
    setPagination,
  };
};
