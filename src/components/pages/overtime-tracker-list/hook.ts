"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOvertime, deleteOvertime, getOvertime, getOvertimeEmployee, putOvertime, putOvertimeeEmployee, putOvertimeStatus } from "@/services/overtime";
import { PaginationState } from "@tanstack/react-table";
import { toast } from "sonner";
import { Filters } from "./types";
import { OvertimeListItem, RequestOvertime, RequestOvertimeStatus } from "@/services/overtime/types";
import dayjs from "dayjs";

export function useOvertime(isEmployee: boolean) {
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
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
    status: 1,
  });
  const queryClient = useQueryClient();

  const {
    data: overtimeData,
    isLoading,
    isFetching,
    isRefetching,
    refetch: refetchOvertime,
  } = useQuery({
    queryKey: ["overtime", pagination, filters.search, filters.date, filters.status],
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
    queryKey: ["overtimeEmployee", pagination, filters.search, filters.date, filters.status],
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
    onError: () => {
      toast.error('Failed update overtime status');
    }
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
    onError: () => {
      toast.error('Failed update overtime request');
    }
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
    onError: () => {
      toast.error('Failed update overtime request');
    }
  });
  
  const { mutate: removeOvertime } = useMutation({
    mutationFn: (id: number) => deleteOvertime(id),
    onSuccess: () => {
      toast.success("Success delete overtime");
      setOpenDelete(false);
      refetchOvertime();
    },
    onError: () => {
      toast.error("Failed delete overtime");
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
      onError: () => {
        toast.error('Failed update overtime request');
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
