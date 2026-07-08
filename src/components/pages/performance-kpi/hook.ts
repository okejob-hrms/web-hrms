/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteKPI,
  getAllKPIs,
  getKPIDetails,
  postAddKPI,
  updateKPI,
} from "@/services/performances/kpi";
import { IKPI, IMutateKPIRequest } from "@/services/performances/kpi/types";
import { getJobPosition } from "@/services/job-position";
import { getJobLevels } from "@/services/job-levels";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale, toIntlLocale } from "@/lib/i18n/locale";
import { ApiErrorResponse } from "@/lib/types";
import { useFormContext } from "react-hook-form";

export const useKPIs = () => {
  const queryClient = useQueryClient();
  const form = useFormContext();
  const t = useTranslations("performance");
  const tStatus = useTranslations("status");
  const locale = resolveLocale(useLocale());
  const intlLocale = toIntlLocale(locale);
  const [openForm, setOpenForm] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleteKpiId, setDeleteKpiId] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editKpiId, setEditKpiId] = React.useState<number | null>(null);
  const [detailKpiId, setDetailKpiId] = React.useState<number | null>(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["kpis", pagination.pageIndex, pagination.pageSize, searchTerm],
    queryFn: () =>
      getAllKPIs({
        page: (pagination.pageIndex + 1).toString(),
        per_page: pagination.pageSize.toString(),
        search: searchTerm || undefined,
      }),
  });

  const { data: kpiDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["kpi-details", editKpiId],
    queryFn: () => getKPIDetails(editKpiId!),
    enabled: !!editKpiId && openForm,
  });

  const { data: kpiDetailData, isLoading: isLoadingDetailData } = useQuery({
    queryKey: ["kpi-detail-view", detailKpiId],
    queryFn: () => getKPIDetails(detailKpiId!),
    enabled: !!detailKpiId && openDetail,
  });

  const { data: jobPositions, isLoading: jobPositionsLoading } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: getJobPosition,
  });

  const { data: jobLevels, isLoading: jobLevelsLoading } = useQuery({
    queryKey: ["jobLevels"],
    queryFn: getJobLevels,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteKPI(id),
    onSuccess: () => {
      toast.success(t("deleteKpiSuccess"));
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      setOpenDelete(false);
      setDeleteKpiId(null);
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || t("deleteKpiFailed"));
            })
            .catch(() => {
              toast.error(`${t("deleteKpiFailed")}: ${t("kpiServerError")}`);
            });
        } catch {
          toast.error(`${t("deleteKpiFailed")}: ${t("kpiServerError")}`);
        }
      } else {
        toast.error(
          `${t("deleteKpiFailed")}: ${error.message || tStatus("unknown")}`,
        );
      }
    },
  });

  const addKPIMutation = useMutation({
    mutationFn: postAddKPI,
    onSuccess: () => {
      toast.success(t("addKpiSuccess"));
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      setOpenForm(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || t("addKpiFailed"));
            })
            .catch(() => {
              toast.error(`${t("addKpiFailed")}: ${t("kpiServerError")}`);
            });
        } catch {
          toast.error(`${t("addKpiFailed")}: ${t("kpiServerError")}`);
        }
      } else {
        toast.error(
          `${t("addKpiFailed")}: ${error.message || tStatus("unknown")}`,
        );
      }
    },
  });

  const updateKPIMutation = useMutation({
    mutationFn: ({ params, id }: { params: IMutateKPIRequest; id: number }) =>
      updateKPI(params, id),
    onSuccess: () => {
      toast.success(t("updateKpiSuccess"));
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      setOpenForm(false);
      setEditKpiId(null);
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || t("updateKpiFailed"));
            })
            .catch(() => {
              toast.error(`${t("updateKpiFailed")}: ${t("kpiServerError")}`);
            });
        } catch {
          toast.error(`${t("updateKpiFailed")}: ${t("kpiServerError")}`);
        }
      } else {
        toast.error(
          `${t("updateKpiFailed")}: ${error.message || tStatus("unknown")}`,
        );
      }
    },
  });

  const handleNew = () => {
    setEditKpiId(null);
    setOpenForm(true);
  };

  const handleEdit = (id: number) => {
    setEditKpiId(id);
    setOpenForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteKpiId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteKpiId) {
      deleteMutation.mutate(deleteKpiId);
    }
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteKpiId(null);
  };

  const handleDetail = (kpi: IKPI) => {
    setDetailKpiId(kpi.id);
    setOpenDetail(true);
  };

  const handleSave = (params: IMutateKPIRequest) => {
    if (editKpiId) {
      updateKPIMutation.mutate({ params, id: editKpiId });
    } else {
      addKPIMutation.mutate(params);
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditKpiId(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailKpiId(null);
  };

  const jobPositionOptions = React.useMemo(() => {
    if (jobPositions?.data) {
      return jobPositions.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobPositions?.data]);

  const jobLevelOptions = React.useMemo(() => {
    if (jobLevels?.data) {
      return jobLevels.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobLevels?.data]);

  const frequencyOptions = React.useMemo(
    () => [
      { label: t("freqNotSet"), value: "0" },
      { label: t("freqDaily"), value: "1" },
      { label: t("freqWeekly"), value: "2" },
      { label: t("freqMonthly"), value: "3" },
      { label: t("freqQuarterly"), value: "4" },
      { label: t("freqYearly"), value: "5" },
    ],
    [t],
  );

  const formatOptions = React.useMemo(
    () => [
      { label: t("formatNumber"), value: "0" },
      { label: t("formatNumberDecimal"), value: "1" },
      { label: t("formatPercent"), value: "2" },
      { label: t("formatPercentDecimal"), value: "3" },
      { label: t("formatCurrencyIdr"), value: "4" },
      { label: t("formatTimeSeconds"), value: "5" },
      { label: t("formatTimeMinutes"), value: "6" },
      { label: t("formatTimeHours"), value: "7" },
      { label: t("formatTimeDays"), value: "8" },
      { label: t("formatTimeMonths"), value: "9" },
      { label: t("formatTimeYears"), value: "10" },
    ],
    [t],
  );

  const aggregationOptions = React.useMemo(
    () => [
      { label: t("aggNone"), value: "0" },
      { label: t("aggSum"), value: "1" },
      { label: t("aggAverage"), value: "2" },
    ],
    [t],
  );

  const directionOptions = React.useMemo(
    () => [
      { label: t("dirNone"), value: "0" },
      { label: t("dirUp"), value: "1" },
      { label: t("dirDown"), value: "2" },
    ],
    [t],
  );

  const getFrequencyLabel = React.useCallback(
    (frequency: number): string => {
      const labels: Record<number, string> = {
        0: t("freqNotSet"),
        1: t("freqDaily"),
        2: t("freqWeekly"),
        3: t("freqMonthly"),
        4: t("freqQuarterly"),
        5: t("freqYearly"),
      };
      return labels[frequency] ?? tStatus("unknown");
    },
    [t, tStatus],
  );

  const getDirectionLabel = React.useCallback(
    (direction: number): string => {
      const labels: Record<number, string> = {
        0: t("dirNone"),
        1: t("dirUp"),
        2: t("dirDown"),
      };
      return labels[direction] ?? tStatus("unknown");
    },
    [t, tStatus],
  );

  const formatTarget = React.useCallback(
    (target: number, format: number): string => {
      const formats: Record<number, (val: number) => string> = {
        0: (val) => val.toLocaleString(intlLocale),
        1: (val) =>
          val.toLocaleString(intlLocale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        2: (val) => `${val}%`,
        3: (val) => `${val.toFixed(2)}%`,
        4: (val) => `Rp ${val.toLocaleString(intlLocale)}`,
        5: (val) => t("timeSecs", { value: val }),
        6: (val) => t("timeMins", { value: val }),
        7: (val) => t("timeHrs", { value: val }),
        8: (val) => t("timeDays", { value: val }),
        9: (val) => t("timeMths", { value: val }),
        10: (val) => t("timeYrs", { value: val }),
      };

      const formatter = formats[format];
      return formatter ? formatter(target) : target.toString();
    },
    [intlLocale, t],
  );

  return {
    data: kpiData?.data,
    pagination: kpiData?.pagination,
    isLoading,
    handleNew,
    handleEdit,
    handleDelete,
    handleDetail,
    handleSave,
    jobPositionOptions,
    jobLevelOptions,
    frequencyOptions,
    formatOptions,
    aggregationOptions,
    directionOptions,
    openForm,
    getFrequencyLabel,
    getDirectionLabel,
    formatTarget,
    searchTerm,
    setSearchTerm,
    paginationState: pagination,
    setPagination,
    kpiDetails: kpiDetails?.data,
    isLoadingDetails,
    editKpiId,
    handleCloseForm,
    openDetail,
    handleCloseDetail,
    kpiDetailData: kpiDetailData?.data,
    isLoadingDetailData,
    openDelete,
    handleCloseDelete,
    handleConfirmDelete,
    deleteKpiId,
  };
};
