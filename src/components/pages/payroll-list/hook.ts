"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAttendance, deleteAttendance } from "@/services/attendance";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filters } from "./types";
import { useTranslations } from "next-intl";
import {
  PAYRUN_GAP,
  PAYRUN_PERIOD_NOT_ENDED,
  PayrunRuleError,
  RequestPayrollGroup,
  ResponsePayrollItem,
  ResponsePayrollList,
} from "@/services/payroll/types";
import { getNextPeriod, getPayroll, postPayrollGroup, postRegenerate, readPayrunRuleError } from "@/services/payroll";
import { PaginatedResponse } from "@/lib/types";
import dayjs from "dayjs";
import { PAYSLIP_AUTO_SEND_ENABLED } from "@/lib/feature-flags";
import { MAX_PAY_PERIOD_DAYS, periodDays } from "@/lib/payroll-period";

export function usePayroll() {
  const t = useTranslations('payroll');
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
    period_month: new Date().getMonth() + 1,
    period_start: '',
    period_end: '',
    auto_send_payslip: false,
    send_payslip_at: dayjs().format('YYYY-MM-DD'),
    notes: '',
  });
  const [previousPeriodEnd, setPreviousPeriodEnd] = React.useState<string | null>(null);
  const [ruleError, setRuleError] = React.useState<PayrunRuleError | null>(null);
  const ruleRetry = React.useRef<(() => void) | null>(null);
  const router = useRouter();
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!openAdd) return;

    let cancelled = false;
    getNextPeriod()
      .then((res) => {
        if (cancelled) return;
        setPreviousPeriodEnd(res.data.previous_period_end);
        setFormData((prev) => ({
          ...prev,
          period_start: res.data.period_start,
          period_end: res.data.period_end,
          period_year: res.data.period_year,
          period_month: res.data.period_month,
        }));
      })
      .catch(() => setPreviousPeriodEnd(null));

    return () => {
      cancelled = true;
    };
  }, [openAdd]);

  const askToAcknowledge = async (err: unknown, retry: (code: string) => void) => {
    const rule = await readPayrunRuleError(err);
    if (rule?.error_code === PAYRUN_GAP || rule?.error_code === PAYRUN_PERIOD_NOT_ENDED) {
      const code = rule.error_code;
      ruleRetry.current = () => retry(code);
      setRuleError(rule);
      return true;
    }

    toast.error(`Failed to save: ${rule?.message ?? (err as Error).message}`);
    return false;
  };

  const confirmRule = () => {
    const retry = ruleRetry.current;
    ruleRetry.current = null;
    setRuleError(null);
    retry?.();
  };

  const cancelRule = () => {
    ruleRetry.current = null;
    setRuleError(null);
  };

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
    onError: (err, { data }) => {
      askToAcknowledge(err, (code) =>
        submitMutation.mutate({
          data: {
            ...data,
            ...(code === PAYRUN_GAP
              ? { acknowledge_gap: true }
              : { acknowledge_early_generation: true }),
          },
        }),
      );
    },
    onSettled: () => setLoading(false),
  });

  const handleGoDetailEmployee = (id:number) => {
    router.push(`/employee/employee-management/${id}`)
  }

  const handleAddGroup = (values: RequestPayrollGroup) => {
    if (!values.period_start || !values.period_end) {
      toast.error(t('periodDatesRequired'));
      return;
    }
    if (values.period_end < values.period_start) {
      toast.error(t('periodEndBeforeStart'));
      return;
    }
    if (periodDays(values.period_start, values.period_end) > MAX_PAY_PERIOD_DAYS) {
      toast.error(t('periodTooLong', { max: MAX_PAY_PERIOD_DAYS }));
      return;
    }
    const { acknowledge_gap: _gap, acknowledge_early_generation: _early, ...fresh } = values;
    if (!PAYSLIP_AUTO_SEND_ENABLED) {
      delete fresh.auto_send_payslip;
      delete fresh.send_payslip_at;
    }
    submitMutation.mutate({ data: fresh })
  }

  const mutationPostRegenerate = useMutation({
    mutationFn: ({ payrunId, acknowledge }: { payrunId: string; acknowledge?: boolean }) =>
      postRegenerate(payrunId, { acknowledge_early_generation: acknowledge }),
    onMutate: () => setLoading(true),
    onSuccess: () => {
      toast.success("Payrun successfully regenerate");
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      payrollDataRefetch();
    },
    onError: (err, { payrunId }) => {
      askToAcknowledge(err, () =>
        mutationPostRegenerate.mutate({ payrunId, acknowledge: true }),
      );
    },
    onSettled: () => setLoading(false),
  });

  const handleRegenerate = (id: string) => {
    if (!id) {
      toast.error("Payroll ID not found");
      return;
    }
    mutationPostRegenerate.mutate({ payrunId: id })
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
    previousPeriodEnd,
    handleRegenerate,
    ruleError,
    confirmRule,
    cancelRule,
  };
}
