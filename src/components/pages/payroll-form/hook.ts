"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Payslip, RequestPayrollGroup } from "@/services/payroll/types";
import { Filters } from "./types";
import { getPayrollDetail, getPayrollEmployee } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";

export function usePayrollDetail() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    date: '',
    search: '',
  });
  const [currentStep, setCurrentStep] = React.useState(1);
  const [id, setId] = React.useState('');
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

  const handleAddGroup = (data: RequestPayrollGroup) => {
    console.log('data', data);
  }

  const handleCancel = () => {
    router.push('/payroll');
  }

  const handleNext = () => {
    setCurrentStep(2);
  }

  const handleBack = () => {
    setCurrentStep(1);
  }

  const handleSubmit = () => {
    router.push('/payroll');
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
    setOpenDelete,
    openDelete,
    filters,
    setFilters,
    setOpenAdd,
    openAdd,
    handleAddGroup,
    handleCancel,
    handleNext,
    currentStep,
    getDetail,
    detailData,
    handleBack,
    handleSubmit,
  };
}
