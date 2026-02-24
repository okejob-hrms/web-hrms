/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getLeaves,
  deleteLeave,
  updateLeave,
  updateStatusLeave,
  getLeavesEmployee,
} from "@/services/employees/leave";
import { getEmployeeDetail } from "@/services/employees";
import {
  ILeaveEmployeeResponse,
  ILeaveResponse,
  IMutateLeaveRequest,
  IMutateLeaveStatus,
} from "@/services/employees/leave/types";
import { Filters } from "./types";
import { ApiErrorResponse, PaginatedResponse } from "@/lib/types";

export function useLeaveRequest(isEmployee?: boolean) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState<Filters>({
    date: "",
    search: "",
    status: 1,
  });

  const [modalState, setModalState] = React.useState({
    detail: false,
    approve: false,
    delete: false,
    reject: false,
    edit: false,
  });

  const [selectedData, setSelectedData] = React.useState<ILeaveResponse>();
  const [selectedId, setSelectedId] = React.useState<string>("");

  const {
    data: leaves,
    isLoading,
    isFetching,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["leaves", pagination, filters],
    queryFn: () => getLeaves(pagination, filters),
    placeholderData: keepPreviousData,
    enabled: !isEmployee
  });

  //employee Section
  const {
    data: leavesEmployee,
    isLoading: isLoadingEmployee,
  } = useQuery({
    queryKey: ["leavesEmployee", pagination, filters],
    queryFn: () => getLeavesEmployee(pagination, filters),
    placeholderData: keepPreviousData,
    enabled: !!isEmployee
  });

  const leavesEmployeePagination: PaginatedResponse<ILeaveEmployeeResponse> = {
    current_page: leavesEmployee?.pagination.current_page ?? 1,
    current_page_url: `${leavesEmployee?.pagination.first ?? ''}`,
    first_page_url: leavesEmployee?.pagination.first ?? '',
    from: leavesEmployee?.pagination.from ?? 0,
    last_page: leavesEmployee?.pagination.last_page ?? 1,
    next_page_url: leavesEmployee?.pagination.next ?? null,
    path: 'api/emdash/my-leave',
    per_page: leavesEmployee?.pagination.per_page ?? 10,
    prev_page_url: leavesEmployee?.pagination.prev ?? null,
    to: leavesEmployee?.pagination.to ?? 0,
    total: leavesEmployee?.pagination.total ?? 0,
    data: [],
  };

  const { mutate: updateLeaveRequest } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: IMutateLeaveRequest;
    }) => updateLeave(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Successfully updated leave status");
      closeAllModals();
    },
    onError: () => {
      toast.error("Failed to update leave status");
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: IMutateLeaveStatus;
    }) => updateStatusLeave(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Successfully updated leave status");
      closeAllModals();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to update leave status");
            })
            .catch(() => {
              toast.error("Failed to updated leave status: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to updated leave status: Server error");
        }
      } else {
        toast.error(
          `Failed to updated leave status: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const { mutate: removeLeave } = useMutation({
    mutationFn: (id: number) => deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Successfully deleted leave request");
      setModalState((prev) => ({ ...prev, delete: false }));
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || "Failed to delete leave request",
              );
            })
            .catch(() => {
              toast.error("Failed to delete leave request: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to delete leave request: Server error");
        }
      } else {
        toast.error(
          `Failed to delete leave request: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const getEmployeeData = React.useCallback(
    async (user_id: number) => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["employee-detail", user_id],
          queryFn: () => getEmployeeDetail(user_id),
        });
        return data.data;
      } catch (error) {
        console.error("Error fetching employee data:", error);
        return null;
      }
    },
    [queryClient],
  );

  const handleApprove = React.useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (!selectedId) return;
    updateStatus({
      id: Number(selectedId),
      payload: { action: "approve", approver_id: parsedUser?.id },
    });
  }, [selectedId, updateStatus]);

  const handleReject = React.useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (!selectedId) return;
    updateStatus({
      id: Number(selectedId),
      payload: { action: "reject", approver_id: parsedUser?.id },
    });
  }, [selectedId, updateStatus]);

  // const handleDelete = React.useCallback(() => {
  //   if (!selectedId) return;
  //   removeLeave(Number(selectedId));
  // }, [selectedId, removeLeave]);

  const handleDelete = () => {
    if (!selectedId) return;
    removeLeave(Number(selectedId));
  };

  const handleNavigateAddRequestPage = React.useCallback(() => {
    router.push(isEmployee ? "/ess/leave/leave-form" : "/attendance/leave-request/add");
  }, [router]);

  const openModal = React.useCallback((modal: keyof typeof modalState) => {
    setModalState((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = React.useCallback((modal: keyof typeof modalState) => {
    setModalState((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const closeAllModals = React.useCallback(() => {
    setModalState({
      detail: false,
      approve: false,
      delete: false,
      reject: false,
      edit: false,
    });
  }, []);

  const selectLeave = React.useCallback((leave: ILeaveResponse) => {
    setSelectedData(leave);
    setSelectedId(String(leave.id));
  }, []);

  return {
    leaves,
    selectedData,
    selectedId,

    loading: isLoading || isFetching,
    error,

    pagination,
    setPagination,

    filters,
    setFilters,

    modalState,
    openModal,
    closeModal,
    closeAllModals,

    handleApprove,
    handleReject,
    handleDelete,
    handleNavigateAddRequestPage,

    getEmployeeData,
    selectLeave,
    setSelectedData,

    leavesEmployee,
    isLoadingEmployee,
    leavesEmployeePagination,
  };
}
