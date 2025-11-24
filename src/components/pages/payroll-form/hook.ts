"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdditionalItem, AdditionalRequest, AllowanceItem, AllowanceRequest, OvertimePayrun, OvertimeRequest, Payslip, PenaltyPayrun, PenaltyRequest, RequestPayrollGroup, WorkHourPayrun, WorkingHourRequest } from "@/services/payroll/types";
import { Filters } from "./types";
import { getPayrollDetail, getPayrollDetailSpend, getPayrollEmployee, getPayrollViewLog, postFinalPayrun, putAdditionalPayrun, putAllowancePayrun, putOvertimePayrun, putPenaltyPayrun, putWorkingHourPayrun } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";
import { AllowanceTypeResponse } from "@/services/salary/types";
import { getAllowanceType } from "@/services/salary";

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
  const [idRow, setIdRow] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const [openAllowance, setOpenAllowance] = React.useState(false);
  const [allowances, setAllowances] = React.useState<AllowanceItem[]>();
  
  const [openWorkingHour, setOpenWorkingHour] = React.useState(false);
  const [workingHours, setWorkingHours] = React.useState<WorkHourPayrun>({
    working_days: 0,
    working_hours: 0,
  });

  const [openOvertime, setOpenOvertime] = React.useState(false);
  const [overtimes, setOvertimes] = React.useState<OvertimePayrun>({
    overtime_amount: 0,
  });

  const [openAdditional, setOpenAdditional] = React.useState(false);
  const [additionals, setAdditionals] = React.useState<AdditionalItem[]>();
  
  const [openPenalty, setOpenPenalty] = React.useState(false);
  const [penaltys, setPenaltys] = React.useState<PenaltyPayrun>({
    penalties_amount: 0,
  });

  const [paginationAudit, setPaginationAudit] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });


  const queryClient = useQueryClient();

  // get list
  const {
    data: detailData,
    refetch: detailDataRefetch,
  } = useQuery({
    queryKey: ["detailPayroll", id],
    queryFn: () => getPayrollDetail(id),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  // get spend
  const {
    data: detailDataSpend,
    refetch: detailDataSpendRefetch,
    isLoading: loadingdetailDataSpend,
  } = useQuery({
    queryKey: ["detailPayrollSpend", id],
    queryFn: () => getPayrollDetailSpend(id),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!id,
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
    enabled: !!id,
  });

  const {
    data: auditTrail,
    isLoading: auditTrailLoading,
    refetch: auditTrailRefetch,
  } = useQuery({
    queryKey: ["auditTrail", id, paginationAudit],
    queryFn: () => getPayrollViewLog(id, paginationAudit),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  //getAllowance
  const { data: allowanceType} =
    useQuery<AllowanceTypeResponse>({
      queryKey: ['getAllowance'],
      queryFn: getAllowanceType,
      staleTime: 1000 * 60 * 5,
      enabled: !!id,
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
      router.push('/payroll/list');
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleCancel = () => {
    router.push('/payroll/list');
  }

  const handleNext = () => {
    detailDataSpendRefetch();
    if(!loadingdetailDataSpend){
      setCurrentStep(2);
    }
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

  const mutationPutAllowance = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AllowanceRequest }) =>
      putAllowancePayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success("Allowance successfully updated");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      setOpenAllowance(false);
      detailDataRefetch();
      auditTrailRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

   const handleSaveAllowance = () => {
    const data: AllowanceRequest = {
      payslip_id: Number(idRow),
      allowance: allowances || []
    }
    mutationPutAllowance.mutate({id: id, payload: data})
  };


  const mutationPutWorkingHour = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkingHourRequest }) =>
      putWorkingHourPayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success("Working Hour successfully updated");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      setOpenWorkingHour(false);
      detailDataRefetch();
      auditTrailRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

   const handleSaveWorkingHour = () => {
    const data: WorkingHourRequest = {
      payslip_id: Number(idRow),
      ...workingHours
    }
    mutationPutWorkingHour.mutate({id: id, payload: data})
  };

  const mutationPutOvertime = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OvertimeRequest }) =>
      putOvertimePayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success("Overtime successfully updated");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      setOpenOvertime(false);
      detailDataRefetch();
      auditTrailRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

   const handleSaveOvertime = () => {
    const data: OvertimeRequest = {
      payslip_id: Number(idRow),
      ...overtimes
    }
    mutationPutOvertime.mutate({id: id, payload: data})
  };

  const mutationPutAdditional = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdditionalRequest }) =>
      putAdditionalPayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success("Additional successfully updated");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      setOpenAdditional(false);
      detailDataRefetch();
      auditTrailRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

   const handleSaveAdditional = () => {
    const data: AdditionalRequest = {
      payslip_id: Number(idRow),
      earnings: additionals || []
    }
    mutationPutAdditional.mutate({id: id, payload: data})
  };

  const mutationPutPenalty = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PenaltyRequest }) =>
      putPenaltyPayrun(id, payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      toast.success("Penalty successfully updated");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      setOpenPenalty(false);
      detailDataRefetch();
      auditTrailRefetch();
    },

    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },

    onSettled: () => setLoading(false),
  });

   const handleSavePenalty = () => {
    const data: PenaltyRequest = {
      payslip_id: Number(idRow),
      ...penaltys
    }
    mutationPutPenalty.mutate({id: id, payload: data})
  };


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
    setIdRow,

    //allowance
    openAllowance,
    setOpenAllowance,
    allowances,
    setAllowances,
    handleSaveAllowance,
    allowanceType,

    //working_hour
    openWorkingHour,
    setOpenWorkingHour,
    workingHours,
    setWorkingHours,
    handleSaveWorkingHour,

    //overtime
    openOvertime,
    setOpenOvertime,
    overtimes,
    setOvertimes,
    handleSaveOvertime,

    //Additional
    openAdditional,
    setOpenAdditional,
    additionals,
    setAdditionals,
    handleSaveAdditional,

    //penalties
    openPenalty,
    setOpenPenalty,
    penaltys,
    setPenaltys,
    handleSavePenalty,

    //detailDataSpend
    detailDataSpend,
    loadingdetailDataSpend,


    //audit trail
    paginationAudit,
    setPaginationAudit,
    auditTrail,
    auditTrailLoading,
  };
}
