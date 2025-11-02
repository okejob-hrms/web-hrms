"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequestPayrollGroup } from "@/services/payroll/types";
import { Filters } from "./types";

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
  const [formData, setFormData] = React.useState<RequestPayrollGroup>({
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth(),
    auto_send_payslip: false,
    send_payslip_at: new Date().toDateString(),
    notes: '',
  });
  const [currentStep, setCurrentStep] = React.useState(1);
  const router = useRouter();
  
  const queryClient = useQueryClient();

  // get list
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance", pagination, filters.search, filters.date],
    queryFn: () => getAttendance(pagination, filters),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  
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

  const hasNextPage = !!paginatedData?.data?.next_page_url;
  const hasPreviousPage = !!paginatedData?.data?.prev_page_url;

  const handleGoDetailEmployee = (id:number) => {
    router.push(`/employee/employee-management/${id}`)
  }

  const handleAddGroup = (data: RequestPayrollGroup) => {
    console.log('data', data);
  }

  const handleCancel = () => {
    if(currentStep === 1) {
        router.back();
    }else {
        setCurrentStep(2);
    }
  }

  const handleNext = () => {
    if(currentStep === 1) {
        setCurrentStep(2);
    }else {
        router.push('/payroll');
    }
  }

  return {
    attendances: paginatedData,
    loading: isLoading || isFetching || isRefetching,
    hasNextPage,
    hasPreviousPage,
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
    handleCancel,
    handleNext,
    currentStep,
  };
}
