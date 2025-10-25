import { getLeaveTypes } from "@/services/employees/leave-types";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import * as React from "react";

export const useLeaveTypeTable = () => {
  const router = useRouter();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: leaveTypes } = useQuery({
    queryKey: ["leave-types", pagination],
    queryFn: () => getLeaveTypes(pagination),
  });

  const handleEdit = (id: number) => {
    router.push(`settings/leave-configuration/edit/${id}`);
  };

  const handleDetailNavigation = (id: number) => {
    router.push(`settings/leave-configuration/${id}`);
  };

  const handleNavigateAddTypePage = () => {
    router.push(`settings/leave-configuration/add`);
  };

  return {
    handleEdit,
    handleDetailNavigation,
    handleNavigateAddTypePage,
    leaveTypes,
    pagination,
    setPagination,
  };
};
