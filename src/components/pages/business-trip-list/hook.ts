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
import {
  approveBusinessTrip,
  getBusinessTripDetail,
  getBusinessTrips,
  rejectBusinessTrip,
} from "@/services/business-trips";
import {
  IBusinessTripActionRequest,
  IBusinessTripResponse,
} from "@/services/business-trips/types";
import { ApiErrorResponse } from "@/lib/types";
import { BusinessTripFilters } from "./types";

export type BusinessTripModalKey = "detail" | "approve" | "reject";

export function useBusinessTrips() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState<BusinessTripFilters>({
    start_date: "",
    end_date: "",
    status: undefined,
    user_id: undefined,
  });

  const [modalState, setModalState] = React.useState({
    detail: false,
    approve: false,
    reject: false,
  });

  const [selectedTrip, setSelectedTrip] = React.useState<
    IBusinessTripResponse | undefined
  >(undefined);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const { data, isLoading, isFetching, isRefetching } = useQuery({
    queryKey: [
      "business-trips",
      pagination,
      filters.start_date,
      filters.end_date,
      filters.status,
      filters.user_id,
    ],
    queryFn: () => getBusinessTrips(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const { data: detailResponse, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["business-trip-detail", selectedId],
    queryFn: () => getBusinessTripDetail(selectedId as number),
    enabled: !!selectedId && modalState.detail,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const closeAllModals = React.useCallback(() => {
    setModalState({ detail: false, approve: false, reject: false });
    setSelectedId(null);
    setSelectedTrip(undefined);
  }, []);

  const handleMutationError = React.useCallback(
    (fallback: string) => async (error: any) => {
      if (error?.response?.json) {
        try {
          const errorData: ApiErrorResponse = await error.response.json();
          toast.error(errorData?.message || fallback);
          return;
        } catch {
          toast.error(`${fallback}: Server error`);
          return;
        }
      }
      toast.error(`${fallback}: ${error?.message ?? "Unknown error"}`);
    },
    [],
  );

  const { mutate: mutateApprove, isPending: isApproving } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: IBusinessTripActionRequest;
    }) => approveBusinessTrip(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-trips"] });
      queryClient.invalidateQueries({ queryKey: ["business-trip-detail"] });
      toast.success("Business trip approved successfully");
      closeAllModals();
    },
    onError: handleMutationError("Failed to approve business trip"),
  });

  const { mutate: mutateReject, isPending: isRejecting } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: IBusinessTripActionRequest;
    }) => rejectBusinessTrip(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-trips"] });
      queryClient.invalidateQueries({ queryKey: ["business-trip-detail"] });
      toast.success("Business trip rejected successfully");
      closeAllModals();
    },
    onError: handleMutationError("Failed to reject business trip"),
  });

  const openModal = React.useCallback((modal: BusinessTripModalKey) => {
    setModalState((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = React.useCallback((modal: BusinessTripModalKey) => {
    setModalState((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const selectTrip = React.useCallback((trip: IBusinessTripResponse) => {
    setSelectedTrip(trip);
    setSelectedId(trip.id);
  }, []);

  const handleApprove = React.useCallback(
    (note?: string | null) => {
      if (!selectedId) return;
      mutateApprove({ id: selectedId, payload: { notes: note ?? null } });
    },
    [selectedId, mutateApprove],
  );

  const handleReject = React.useCallback(
    (note?: string | null) => {
      if (!selectedId) return;
      mutateReject({ id: selectedId, payload: { notes: note ?? null } });
    },
    [selectedId, mutateReject],
  );

  return {
    rows: data?.data ?? [],
    apiPagination: data?.pagination,
    paginationState: pagination,
    setPagination,
    filters,
    setFilters,
    loading: isLoading || isFetching || isRefetching,

    modalState,
    openModal,
    closeModal,
    closeAllModals,

    selectedTrip,
    selectTrip,

    detail: detailResponse?.data,
    loadingDetail: isFetchingDetail,

    handleApprove,
    handleReject,
    isApproving,
    isRejecting,
  };
}
