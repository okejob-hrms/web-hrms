"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOvertime, deleteOvertime, getOvertime, getOvertimeEmployee, putOvertime, putOvertimeeEmployee, putOvertimeStatus } from "@/services/overtime";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import { Filters } from "./types";
import { OvertimeListItem, RequestOvertime, RequestOvertimeStatus } from "@/services/overtime/types";
import dayjs from "dayjs";

interface ApiErrorResponse {
  status?: string;
  message?: string;
  error_code?: string | null;
}

export function useOvertime(isEmployee: boolean) {
  const extractErrorMessage = async (error: unknown): Promise<string> => {
    // fetch-style error
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const response = (error as { response?: Response }).response;

      if (response && typeof response.json === "function") {
        try {
          const data = (await response.json()) as ApiErrorResponse;
          return data.message ?? "Something went wrong";
        } catch {
          return "Something went wrong";
        }
      }
    }

    // axios-style error
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const data = (error as {
        response?: { data?: ApiErrorResponse };
      }).response?.data;

      if (data?.message) return data.message;
    }

    // native Error
    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong";
  };

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openApprove, setOpenApprove] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<OvertimeListItem>();

  const [selectedId, setSelectedId] = React.useState<string>('');
  const [filters, setFilters] = React.useState<Filters>(() => {
    const now = dayjs();
    return {
      date: '',
      start_date: now.startOf('month').format('YYYY-MM-DD'),
      end_date: now.endOf('month').format('YYYY-MM-DD'),
      search: '',
      status: 1,
    };
  });
  const queryClient = useQueryClient();

  const {
    data: overtimeData,
    isLoading,
    isFetching,
    isRefetching,
    refetch: refetchOvertime,
  } = useQuery({
    queryKey: [
      "overtime",
      pagination,
      filters.search,
      filters.date,
      filters.start_date,
      filters.end_date,
      filters.status,
    ],
    queryFn: () => getOvertime(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !isEmployee,
  });

  const {
    data: overtimeDataEmployee,
    refetch: refetchOvertimeEmployee,
  } = useQuery({
    queryKey: [
      "overtimeEmployee",
      pagination,
      filters.search,
      filters.date,
      filters.start_date,
      filters.end_date,
      filters.status,
    ],
    queryFn: () => getOvertimeEmployee(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!isEmployee,
  });
  
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RequestOvertimeStatus }) =>
      putOvertimeStatus(id, payload),
    onSuccess: () => {
      toast.success('Success update overtime status');
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
      queryClient.invalidateQueries({ queryKey: ['overtimeEmployee'] });
      setOpenApprove(false);
      setOpenReject(false);
      setOpenDetail(false);
      setOpenEdit(false);
    },
    onError: async (err) => {
      const message = await extractErrorMessage(err);
      toast.error(message);
    },
  });

  const { mutate: updateOvertime } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RequestOvertime }) =>
      putOvertime(id, payload),
    onSuccess: () => {
      toast.success('Success update overtime request');
      setOpenApprove(false);
      setOpenReject(false);
      setOpenDetail(false);
      setOpenEdit(false);
      refetchOvertime();
    },
    onError: async (err) => {
      const message = await extractErrorMessage(err);
      toast.error(message);
    },
  });

  const { mutate: updateOvertimeEmployee } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RequestOvertime }) =>
      putOvertimeeEmployee(id, payload),
    onSuccess: () => {
      toast.success('Success update overtime request');
      setOpenApprove(false);
      setOpenReject(false);
      setOpenDetail(false);
      setOpenEdit(false);
      setOpenAdd(false);
      refetchOvertimeEmployee();
    },
    onError: async (err) => {
      const message = await extractErrorMessage(err);
      toast.error(message);
    },
  });
  
  const { mutate: removeOvertime } = useMutation({
    mutationFn: (id: number) => deleteOvertime(id),
    onSuccess: () => {
      toast.success("Success delete overtime");
      setOpenDelete(false);
      refetchOvertime();
    },
    onError: async (err) => {
      const message = await extractErrorMessage(err);
      toast.error(message);
    },
  });

  const { mutate: mutateAddOvertime, isPending: isPendingCreate } =
    useMutation({
      mutationFn: (params: RequestOvertime) => addOvertime(params),
      onSuccess: () => {
        toast.success('Success create overtime request');
        setOpenApprove(false);
        setOpenReject(false);
        setOpenDetail(false);
        setOpenEdit(false);
        setOpenAdd(false);
        refetchOvertimeEmployee();
      },
    onError: async (err) => {
      const message = await extractErrorMessage(err);
      toast.error(message);
    },
    });

  const handleApprove = () => {
    if (!selectedId) return;
    const dataPayload = {
      status: 2,
    }
    updateStatus({ id: Number(selectedId), payload: dataPayload });
  };

  const handleReject = () => {
    if (!selectedId) return;
    const dataPayload = {
      status: 3,
    }
    updateStatus({ id: Number(selectedId), payload: dataPayload });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeOvertime(Number(selectedId));
  };

  const handleEdit = (data: RequestOvertime) => {
    if (!selectedId) return;

    const dataConvert: RequestOvertime = {
      ...data,
      start_time: data.start_time.slice(0, 5),
      end_time: data.end_time.slice(0, 5),
    };


    if(isEmployee){
      updateOvertimeEmployee({ id: Number(selectedId), payload: dataConvert });
    }else{
      updateOvertime({ id: Number(selectedId), payload: dataConvert });
    }
  }

  const handleAdd = (data: RequestOvertime) => {
    const dataConvert: RequestOvertime = {
      ...data,
      start_time: data.start_time.slice(0, 5),
      end_time: data.end_time.slice(0, 5),
    };

    mutateAddOvertime(dataConvert);
  }

  return {
    attendances: overtimeData,
    loading: isLoading || isFetching || isRefetching,
    pagination,
    setPagination,
    setOpenDetail,
    openDetail,
    setSelectedData,
    selectedData,
    setSelectedId,
    handleApprove,
    handleReject,
    handleDelete,
    openApprove,
    setOpenApprove,
    setOpenReject,
    openReject,
    setOpenDelete,
    openDelete,
    filters,
    setFilters,
    openEdit,
    setOpenEdit,
    handleEdit,
    overtimeDataEmployee,
    openAdd,
    setOpenAdd,
    handleAdd,
  };
}
