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
import { ApiErrorResponse } from "@/lib/types";
import { useFormContext } from "react-hook-form";

export const useKPIs = () => {
  const queryClient = useQueryClient();
  const form = useFormContext();
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
      toast.success("Delete KPI successfully!");
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
              toast.error(errorData.message || "Failed to delete KPI");
            })
            .catch(() => {
              toast.error("Failed to delete KPI: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to delete KPI: Server error");
        }
      } else {
        toast.error(
          `Failed to delete KPI: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const addKPIMutation = useMutation({
    mutationFn: postAddKPI,
    onSuccess: () => {
      toast.success("Add new KPI successfully!");
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
              toast.error(errorData.message || "Failed to add KPI");
            })
            .catch(() => {
              toast.error("Failed to add KPI: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add KPI: Server error");
        }
      } else {
        toast.error(`Failed to add KPI: ${error.message || "Unknown error"}`);
      }
    },
  });

  const updateKPIMutation = useMutation({
    mutationFn: ({ params, id }: { params: IMutateKPIRequest; id: number }) =>
      updateKPI(params, id),
    onSuccess: () => {
      toast.success("Update KPI successfully!");
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
              toast.error(errorData.message || "Failed to update KPI");
            })
            .catch(() => {
              toast.error("Failed to update KPI: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to update KPI: Server error");
        }
      } else {
        toast.error(
          `Failed to update KPI: ${error.message || "Unknown error"}`,
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

  const frequencyOptions = [
    { label: "Not Set", value: "0" },
    { label: "Daily", value: "1" },
    { label: "Weekly", value: "2" },
    { label: "Monthly", value: "3" },
    { label: "Quarterly", value: "4" },
    { label: "Yearly", value: "5" },
  ];

  const formatOptions = [
    { label: "Number", value: "0" },
    { label: "Number Decimal", value: "1" },
    { label: "Percent", value: "2" },
    { label: "Percent Decimal", value: "3" },
    { label: "Currency IDR", value: "4" },
    { label: "Time Seconds", value: "5" },
    { label: "Time Minutes", value: "6" },
    { label: "Time Hours", value: "7" },
    { label: "Time Days", value: "8" },
    { label: "Time Months", value: "9" },
    { label: "Time Years", value: "10" },
  ];

  const aggregationOptions = [
    { label: "None", value: "0" },
    { label: "Sum", value: "1" },
    { label: "Average", value: "2" },
  ];

  const directionOptions = [
    { label: "None", value: "0" },
    { label: "Up", value: "1" },
    { label: "Down", value: "2" },
  ];

  const getFrequencyLabel = (frequency: number): string => {
    const labels = {
      0: "Not Set",
      1: "Daily",
      2: "Weekly",
      3: "Monthly",
      4: "Quarterly",
      5: "Yearly",
    };
    return labels[frequency as keyof typeof labels] || "Unknown";
  };

  const getDirectionLabel = (direction: number): string => {
    const labels = {
      0: "None",
      1: "Up",
      2: "Down",
    };
    return labels[direction as keyof typeof labels] || "Unknown";
  };

  const formatTarget = (target: number, format: number): string => {
    const formats = {
      0: (val: number) => val.toLocaleString("id-ID"), // Number (1,234)
      1: (val: number) =>
        val.toLocaleString("id-ID", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }), // Number Decimal (1,234.56)
      2: (val: number) => `${val}%`, // Percent (12%)
      3: (val: number) => `${val.toFixed(2)}%`, // Percent Decimal (12.34%)
      4: (val: number) => `Rp ${val.toLocaleString("id-ID")}`, // Currency IDR
      5: (val: number) => `${val} secs`, // Time Seconds
      6: (val: number) => `${val} mins`, // Time Minutes
      7: (val: number) => `${val} hrs`, // Time Hours
      8: (val: number) => `${val} days`, // Time Days
      9: (val: number) => `${val} mths`, // Time Months
      10: (val: number) => `${val} yrs`, // Time Years
    };

    const formatter = formats[format as keyof typeof formats];
    return formatter ? formatter(target) : target.toString();
  };

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
