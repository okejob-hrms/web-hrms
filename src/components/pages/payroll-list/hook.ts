"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filters } from "./types";
import { RequestPayrollGroup, ResponsePayrollItem, ResponsePayrollList } from "@/services/payroll/types";
import { getPayroll, postPayrollGroup, postRegenerate } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";

export function usePayroll() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });
  const [formData, setFormData] = React.useState<RequestPayrollGroup>({
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth(),
    auto_send_payslip: false,
    send_payslip_at: new Date().toDateString(),
    notes: '',
  });
  const router = useRouter();
  
  const queryClient = useQueryClient();

  // get list
  const {
    data: payrollData,
    isLoading,
    isFetching,
    isRefetching,
    refetch: payrollDataRefetch
  } = useQuery({
    queryKey: ["payroll", pagination, filters.search, filters.date],
    queryFn: () => getPayroll(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const dataPagination: PaginatedResponse<ResponsePayrollItem> = {
    current_page: payrollData?.pagination.current_page ?? 1,
    current_page_url: `${payrollData?.pagination.first ?? ''}`,
    first_page_url: payrollData?.pagination.first ?? '',
    from: payrollData?.pagination.from ?? 0,
    last_page: payrollData?.pagination.last_page ?? 1,
    next_page_url: payrollData?.pagination.next ?? null,
    path: 'api/v1/payruns',
    per_page: payrollData?.pagination.per_page ?? 10,
    prev_page_url: payrollData?.pagination.prev ?? null,
    to: payrollData?.pagination.to ?? 0,
    total: payrollData?.pagination.total ?? 0,
    data: payrollData?.data ?? [],
  };
  
  const { mutate: removeAttendance } = useMutation({
    mutationFn: (id: number) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Success delete attendance");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete attendance");
    },
  });

  const submitMutation = useMutation<
    ResponsePayrollList,
    Error,
    { data: RequestPayrollGroup }
  >({
    mutationFn: ({ data }) => {
      return postPayrollGroup(data);
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success('Payroll group successfully save');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      payrollDataRefetch();
      setOpenAdd(false);
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleGoDetailEmployee = (id:number) => {
    router.push(`/employee/employee-management/${id}`)
  }

  const handleAddGroup = (values: RequestPayrollGroup) => {
    submitMutation.mutate({data: values})
  }

  const mutationPostRegenerate = useMutation({
    mutationFn: (payrunId: string) => postRegenerate(payrunId),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Payrun successfully regenerate");
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      payrollDataRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleRegenerate = (id: string) => {
    if (!id) {
      toast.error("Payroll ID not found");
      return;
    }
    mutationPostRegenerate.mutate(id)
  }


  return {
    payrollData,
    dataPagination,
    loading: isLoading || isFetching || isRefetching || loading,
    pagination,
    setPagination,
    handleGoDetailEmployee,
    setOpenDelete,
    openDelete,
    filters,
    setFilters,
    setOpenAdd,
    openAdd,
    handleAddGroup, 
    formData,
    setFormData,
    handleRegenerate,
  };
}
