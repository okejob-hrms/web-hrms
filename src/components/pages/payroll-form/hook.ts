"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdditionalItem, AdditionalRequest, AllowanceItem, AllowanceRequest, OvertimePayrun, OvertimeRequest, Payrun, Payslip, PenaltyPayrun, PenaltyRequest, RequestPayrollGroup, WorkHourPayrun, WorkingHourRequest } from "@/services/payroll/types";
import { Filters } from "./types";
import { getPayrollDetail, getPayrollDetailSpend, getPayrollEmployee, getPayrollViewLog, postFinalPayrun, postRecalculate, postRegenerate, putAdditionalPayrun, putAllowancePayrun, putOvertimePayrun, putPenaltyPayrun, putWorkingHourPayrun } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";
import { AllowanceTypeResponse } from "@/services/salary/types";
import { getAllowanceType } from "@/services/salary";
import { formatCurrency } from "@/lib/utils";

export function usePayrollDetail() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [openConfirmGenerate, setOpenConfirmGenerate] = React.useState(false);
  const [openConfirmRecalculate, setOpenConfirmRecalculate] = React.useState(false);
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

  const [selectedRecalculate, setSelectedRecalculate] = React.useState(0);


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
    refetch: employeeListRefetch,
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

  async function handleDownload(payslip: Payslip, payrun: Payrun) {
    const html2pdf = (await import("html2pdf.js")).default;
    
    const PAYSLIP_TEMPLATE = `
      <div style="background:white;margin:0 auto;padding:50px;font-family: Arial;">
        
        <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
          <div>
          </div>
          <div style="text-align:right;">
            <p style="color:#EF4444;font-weight:600;font-size:12px;">*CONFIDENTIAL</p>
          </div>
        </div>

        <h2 style="color:#2B88C4;font-weight:600;font-size:18px;margin-bottom:12px;">Payroll Details</h2>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;row-gap:8px;margin-bottom:24px;">
          <div><p style="font-size:12px;margin-bottom:0px">Payroll Period</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payrun.period_label}</p></div>
          <div><p style="font-size:12px;margin-bottom:0px;">Employee Name/ID</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payslip.employee.name}/${payslip.employee.id}</p></div>
          <div><p style="font-size:12px;margin-bottom:0px;">Position</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payslip.employee.job_title}</p></div>
          <div><p style="font-size:12px;margin-bottom:0px;">Job Level</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payslip.employee.job_level}</p></div>
          <div><p style="font-size:12px;margin-bottom:0px;">Department</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payslip.employee.department}</p></div>
          <div><p style="font-size:12px;margin-bottom:0px;">Taxpayer ID (NPWP)</p><p style="font-weight:600;font-size: 14px; margin-bottom:0px;">${payslip.employee.npwp}</p></div>
        </div>

        <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:separate;border-spacing:0;border:1px solid #D1D5DB;border-radius:12px;overflow:hidden;">
          <thead style="background:#F3F4F6;">
            <tr>
              <th style="padding:12px; text-align:left; vertical-align: middle; width:50%; border-right:1px solid #D1D5DB; border-top-left-radius: 12px;">
                <div style="padding-bottom: 16px">Earnings</div>
              </th>
              <th style="padding:12px; text-align:left; vertical-align: middle; border-top-right-radius: 12px;">
                <div style="padding-bottom: 16px">Deductions</div>
              </th>

            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="padding:12px;border-right:1px solid #D1D5DB;vertical-align:top;">
                <div style="display:flex;justify-content:space-between;margin-bottom: 20px;"><span>Basic Salary</span><span style="padding-left: 20px;">Rp${formatCurrency(Number(payslip.employee.salary_nett))}</span></div>
                ${payslip.allowance.map((item, i) => {
                  return `<div key={${i}} style="display:flex;justify-content:space-between;margin-bottom: 20px;"><span>${item.allowance_name}</span><span style="padding-left: 20px;">Rp${formatCurrency(Number(item.allowance_value))}</span></div>`
                })}
                <div style="display:flex;justify-content:space-between;margin-bottom: 20px;"><span>Additional Earnings</span><span style="padding-left: 20px;">Rp${formatCurrency(Number(payslip.total_additional_earnings))}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom: 20px;"><span>Overtime</span><span style="padding-left: 20px;">Rp${formatCurrency(Number(payslip.total_overtime))}</span></div>
              </td>

              <td style="padding:12px;vertical-align:top;">
                ${payslip.deduction
                  .map((item, i) => {
                    return `<div key="${i}" style="display:flex;justify-content:space-between;margin-bottom: 20px;">
                              <span>${item.name}</span>
                              <span style="padding-left: 20px;">Rp${formatCurrency(Number(item.amount))}</span>
                            </div>`;
                  })
                  .join("")}
              </td>
            </tr>

            <tr style="background:#F3F4F6;border-top:1px solid #D1D5DB;">
              <td colspan="2" style="padding:10px 12px; font-weight:600; text-align:right; vertical-align: middle; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                <div style="padding-bottom: 16px">
                  Take Home Pay &nbsp; Rp${formatCurrency(Number(payslip.net_pay))}
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        <p style="font-size:12px;color:#EF4444;margin-top:24px;line-height:1.6; font-weight: 600;">
          Notes
        </p>
        <p style="font-size:10px;line-height:1.6;">
          HARAP DIPERHATIKAN, ISI PERNYATAAN INI ADALAH RAHASIA KECUALI ANDA
          DIMINTA UNTUK MENGUNGKAPKANNYA UNTUK KEPERLUAN PAJAK, HUKUM, ATAU
          KEPENTINGAN PEMERINTAH. SETIAP PELANGGARAN ATAS KEWAJIBAN MENJAGA
          KERAHASIAAN INI AKAN DIKENAKAN SANKSI, YANG MUNGKIN BERUPA TINDAKAN
          KEDISIPLINAN.
        </p>

      </div>
    `;

    const container = document.createElement("div");
    container.innerHTML = PAYSLIP_TEMPLATE;

    document.body.appendChild(container);

    // tunggu dulu 100ms supaya DOM siap
    await new Promise(resolve => setTimeout(resolve, 100));

    const pdfBlob = await html2pdf()
      .set({
        margin: 10,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(container)
      .outputPdf("blob");

    document.body.removeChild(container);

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  }

  const mutationPostRegenerate = useMutation({
    mutationFn: (payrunId: string) => postRegenerate(payrunId),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Payrun successfully regenerate");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      detailDataRefetch();
      auditTrailRefetch();
      employeeListRefetch();
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

  const mutationPostRecalculate = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: {payslip_id: number} }) => postRecalculate(id, payload),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Payrun successfully recalculate");
      queryClient.invalidateQueries({ queryKey: ["payslip"] });
      detailDataRefetch();
      auditTrailRefetch();
      employeeListRefetch();
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
    onSettled: () => setLoading(false),
  });

  const handleRecalculate = (idx: string) => {
    if (!idx) {
      toast.error("Payroll ID not found");
      return;
    }

    setOpenConfirmRecalculate(true);
    setSelectedRecalculate(Number(idx));
  };


  const handleRegenerateCalculate = () => {
    mutationPostRecalculate.mutate({
      id: id,
      payload: {payslip_id: selectedRecalculate},
    });
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

    //download
    handleDownload,
    handleRegenerate,
    openConfirmGenerate,
    setOpenConfirmGenerate,

    handleRecalculate,
    openConfirmRecalculate,
    setOpenConfirmRecalculate,
    handleRegenerateCalculate,

  };
}
