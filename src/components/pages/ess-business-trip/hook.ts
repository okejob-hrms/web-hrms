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
  cancelEssBusinessTrip,
  createEssBusinessTrip,
  getEssBusinessTripDetail,
  getEssBusinessTrips,
} from "@/services/ess/business-trips";
import { IEssBusinessTripCreateRequest } from "@/services/ess/business-trips/types";
import { IBusinessTripResponse } from "@/services/business-trips/types";
import { ApiErrorResponse } from "@/lib/types";

export type EssBusinessTripModalKey = "detail" | "add" | "cancel";

export function useEssBusinessTrips() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [modalState, setModalState] = React.useState({
    detail: false,
    add: false,
    cancel: false,
  });
  const [statusFilter, setStatusFilter] = React.useState<number | undefined>(
    undefined,
  );
  const [dateFilters, setDateFilters] = React.useState<{
    start_date: string;
    end_date: string;
  }>({
    start_date: "",
    end_date: "",
  });

  const [selectedTrip, setSelectedTrip] = React.useState<
    IBusinessTripResponse | undefined
  >(undefined);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const { data, isLoading, isFetching, isRefetching } = useQuery({
    queryKey: ["ess-business-trips", pagination, statusFilter, dateFilters],
    queryFn: () =>
      getEssBusinessTrips(pagination, {
        status: statusFilter,
        start_date: dateFilters.start_date || undefined,
        end_date: dateFilters.end_date || undefined,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const { data: detailResponse, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["ess-business-trip-detail", selectedId],
    queryFn: () => getEssBusinessTripDetail(selectedId as number),
    enabled: !!selectedId && modalState.detail,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const closeAllModals = React.useCallback(() => {
    setModalState({ detail: false, add: false, cancel: false });
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

  const { mutate: mutateCreate, isPending: isCreating } = useMutation({
    mutationFn: (payload: IEssBusinessTripCreateRequest) =>
      createEssBusinessTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-business-trips"] });
      toast.success("Business trip request submitted successfully");
      setModalState((prev) => ({ ...prev, add: false }));
    },
    onError: handleMutationError("Failed to submit business trip request"),
  });

  const { mutate: mutateCancel, isPending: isCancelling } = useMutation({
    mutationFn: (id: number) => cancelEssBusinessTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-business-trips"] });
      queryClient.invalidateQueries({ queryKey: ["ess-business-trip-detail"] });
      toast.success("Business trip request cancelled successfully");
      closeAllModals();
    },
    onError: handleMutationError("Failed to cancel business trip request"),
  });

  const openModal = React.useCallback((modal: EssBusinessTripModalKey) => {
    setModalState((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = React.useCallback((modal: EssBusinessTripModalKey) => {
    setModalState((prev) => ({ ...prev, [modal]: false }));
    if (modal === "detail") {
      setSelectedId(null);
    }
  }, []);

  const selectTrip = React.useCallback((trip: IBusinessTripResponse) => {
    setSelectedTrip(trip);
    setSelectedId(trip.id);
  }, []);

  const handleCreate = React.useCallback(
    (values: IEssBusinessTripCreateRequest) => {
      mutateCreate(values);
    },
    [mutateCreate],
  );

  const handleCancel = React.useCallback(() => {
    if (!selectedId) return;
    mutateCancel(selectedId);
  }, [selectedId, mutateCancel]);

  return {
    rows: data?.data ?? [],
    apiPagination: data?.pagination,
    paginationState: pagination,
    setPagination,
    loading: isLoading || isFetching || isRefetching,
    statusFilter,
    setStatusFilter,
    dateFilters,
    setDateFilters,

    modalState,
    openModal,
    closeModal,
    closeAllModals,

    selectedTrip,
    selectTrip,

    detail: detailResponse?.data,
    loadingDetail: isFetchingDetail,

    handleCreate,
    handleCancel,
    isCreating,
    isCancelling,
  };
}
