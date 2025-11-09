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
} from "@/services/employees/leave";
import { getEmployeeDetail } from "@/services/employees";
import {
  ILeaveResponse,
  IMutateLeaveRequest,
  IMutateLeaveStatus,
} from "@/services/employees/leave/types";
import { Filters } from "./types";
import { ApiErrorResponse } from "@/lib/types";

export function useLeaveRequest() {
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
  });

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
    if (!selectedId) return;
    updateStatus({
      id: Number(selectedId),
      payload: { action: "approve" },
    });
  }, [selectedId, updateStatus]);

  const handleReject = React.useCallback(() => {
    if (!selectedId) return;
    updateStatus({
      id: Number(selectedId),
      payload: { action: "reject" },
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
    router.push("/attendance/leave-request/add");
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
  };
}
