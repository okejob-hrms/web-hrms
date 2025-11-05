"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Payslip, RequestPayrollGroup } from "@/services/payroll/types";
import { Filters } from "./types";
import { getPayrollDetail, getPayrollEmployee, postFinalPayrun } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";

export function usePayrollDetail() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });
  const [currentStep, setCurrentStep] = React.useState(1);
  const [id, setId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  
  const queryClient = useQueryClient();

  // get list
  const {
    data: detailData,
  } = useQuery({
    queryKey: ["detailPayroll", id],
    queryFn: () => getPayrollDetail(id),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // get list
  const {
    data: employeeList,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["payslip", id, pagination, filters.search, filters.date],
    queryFn: () => getPayrollEmployee(id, pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const dataPagination: PaginatedResponse<Payslip> = {
      current_page: employeeList?.pagination.current_page ?? 1,
      current_page_url: `${employeeList?.pagination.first ?? ''}`,
      first_page_url: employeeList?.pagination.first ?? '',
      from: employeeList?.pagination.from ?? 0,
      last_page: employeeList?.pagination.last_page ?? 1,
      next_page_url: employeeList?.pagination.next ?? null,
      path: 'api/v1/payruns',
      per_page: employeeList?.pagination.per_page ?? 10,
      prev_page_url: employeeList?.pagination.prev ?? null,
      to: employeeList?.pagination.to ?? 0,
      total: employeeList?.pagination.total ?? 0,
      data: employeeList?.data.payslips ?? [],
    };
  
  const mutationPostFinal = useMutation({
    mutationFn: (payrunId: string) => postFinalPayrun(payrunId),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Payrun successfully saved as final");
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setOpenAdd(false);
      setOpenConfirm(false);
      router.push('/payroll');
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleCancel = () => {
    router.push('/payroll');
  }

  const handleNext = () => {
    setCurrentStep(2);
  }

  const handleBack = () => {
    setCurrentStep(1);
  }

  const handleSubmit = (id: string) => {
    if (!id) {
      toast.error("Payroll ID not found");
      return;
    }
    mutationPostFinal.mutate(id)
  }

  const getDetail = (idx: string) => {
    setId(idx)
  }

  return {
    employeeList,
    dataPagination,
    loading: isLoading || isFetching || isRefetching,
    pagination,
    setPagination,
    openConfirm,
    setOpenConfirm,
    filters,
    setFilters,
    setOpenAdd,
    openAdd,
    handleCancel,
    handleNext,
    currentStep,
    getDetail,
    detailData,
    handleBack,
    handleSubmit,
    loadingSave: loading,
  };
}
