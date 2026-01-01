/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobPosition } from "@/services/job-position";
import { getJobLevels } from "@/services/job-levels";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getAllKPIs } from "@/services/performances/kpi";
import { ApiErrorResponse } from "@/lib/types";
import {
  createOKRKeyResult,
  createOKRObjective,
  getOKRCycleDetails,
  getOKRTrackingPeriods,
  setOKRTrackingPeriods,
} from "@/services/okr";
import { useParams } from "next/navigation";
import {
  IOKRKeyResultRequest,
  IOKRTrackingKeyResult,
  IOKRTrackingPeriodRequest,
} from "@/services/okr/types";

export const useOKRDetails = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const [searchOKR, setSearchOKR] = React.useState("");
  const [searchKPI, setSearchKPI] = React.useState("");
  const [openFormObjective, setOpenFormObjective] = React.useState(false);
  const [openFormKpi, setOpenFormKpi] = React.useState(false);

  const formKpi = useForm();
  const id = React.useMemo(() => {
    const idParam = params?.id;
    if (idParam && !isNaN(Number(idParam))) {
      return Number(idParam);
    }
    return null;
  }, [params]);

  const { data: detailOKRCycle, isLoading: isLoadingDetailOKRCycle } = useQuery(
    {
      queryKey: ["okrCycleDetails", id],
      queryFn: () => getOKRCycleDetails(id!),
      enabled: !!id,
    },
  );

  const { data: jobPositions } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: getJobPosition,
  });

  const { data: jobLevels } = useQuery({
    queryKey: ["jobLevels"],
    queryFn: getJobLevels,
  });

  const { data: kpiData } = useQuery({
    queryKey: ["okrCycles", searchKPI],
    queryFn: () => getAllKPIs(searchKPI ? { search: searchKPI } : undefined),
  });

  const kpiOptions = React.useMemo(() => {
    if (kpiData?.data) {
      return kpiData.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    }
    return [];
  }, [kpiData?.data]);

  const createKeyResult = useMutation({
    mutationFn: createOKRKeyResult,
    onSuccess: () => {
      toast.success("Add new Key Result successfully!");
      queryClient.invalidateQueries({ queryKey: ["okrCycleDetails", id] });
      setOpenFormKpi(false);
      formKpi.reset();
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
                    formKpi.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || "Failed to add Key Result");
            })
            .catch(() => {
              toast.error("Failed to add Key Result: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add Key Result: Server error");
        }
      } else {
        toast.error(
          `Failed to add Key Result: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const createObjectiveMutation = useMutation({
    mutationFn: createOKRObjective,
    onSuccess: () => {
      toast.success("Add new Objective successfully!");
      queryClient.invalidateQueries({ queryKey: ["okr-details"] });
      setOpenFormObjective(false);
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
                    // formObjective.setError(fieldName as any, {
                    //   type: "server",
                    //   message: messages[0],
                    // });
                  },
                );
              }
              toast.error(errorData.message || "Failed to add Objective");
            })
            .catch(() => {
              toast.error("Failed to add Objective: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add Objective: Server error");
        }
      } else {
        toast.error(
          `Failed to add Objective: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const handleSaveKpi = (data: IOKRKeyResultRequest) => {
    createKeyResult.mutate(data);
  };

  const handleSaveObjective = (data: { title: string }) => {
    createObjectiveMutation.mutate({
      okr_cycle_id: id!,
      title: data.title,
    });
  };

  const handleOpenKeyResultForm = (objective_id: number) => {
    setOpenFormKpi(true);
    formKpi.reset();
    formKpi.setValue("objective_id", objective_id);
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
    { label: "Latest", value: "0" },
    { label: "Sum", value: "1" },
    { label: "Average", value: "2" },
  ];

  const directionOptions = [
    { label: "Higher is Better", value: "0" },
    { label: "Lower is Better", value: "1" },
  ];

  return {
    searchOKR,
    setSearchOKR,
    searchKPI,
    setSearchKPI,
    openFormObjective,
    setOpenFormObjective,
    openFormKpi,
    setOpenFormKpi,
    jobPositionOptions,
    jobLevelOptions,
    frequencyOptions,
    formatOptions,
    aggregationOptions,
    directionOptions,
    handleSaveKpi,
    handleSaveObjective,
    handleOpenKeyResultForm,
    formKpi,
    kpiOptions,
    detailOKRCycle,
    isLoadingDetailOKRCycle,
  };
};

const transformTrackingDataToTableRows = (
  keyResults: IOKRTrackingKeyResult[],
) => {
  return keyResults.map((kr) => {
    const row: Record<string, any> = {
      name: kr.title,
      okr_key_result_id: kr.okr_key_result_id,
      okr_cycle_id: kr.okr_cycle_id,
      frequency: kr.frequency,
      start_at: kr.start_at,
      end_at: kr.end_at,
    };

    kr.tracking_table.forEach((period) => {
      row[`period_${period.period_id}`] = {
        period_id: period.period_id,
        label: period.label,
        actual: period.actual_value,
        target: period.target_value,
      };
    });

    row.tracking_periods = kr.tracking_table.map((period) => ({
      period_id: period.period_id,
      label: period.label,
    }));

    return row;
  });
};

export const useOKRTrackingPeriods = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const [periodType, setPeriodType] = React.useState("4");
  const [searchKeyResult, setSearchKeyResult] = React.useState("");
  const [editedValues, setEditedValues] = React.useState<
    Record<string, IOKRTrackingPeriodRequest>
  >({});

  const id = React.useMemo(() => {
    const idParam = params?.id;
    if (idParam && !isNaN(Number(idParam))) {
      return Number(idParam);
    }
    return null;
  }, [params]);

  const {
    data: trackingPeriodsData,
    isLoading: isLoadingTrackingPeriods,
    refetch: refetchTrackingPeriods,
  } = useQuery({
    queryKey: ["okrTrackingPeriods", id, periodType],
    queryFn: () => getOKRTrackingPeriods(id!, periodType),
    enabled: !!id,
  });

  const saveTrackingPeriodsMutation = useMutation({
    mutationFn: async (values: IOKRTrackingPeriodRequest[]) => {
      return setOKRTrackingPeriods(id!, values);
    },
    onSuccess: () => {
      toast.success("Tracking periods saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["okrTrackingPeriods", id, periodType],
      });
      setEditedValues({});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to save tracking periods: ${error.message || "Unknown error"}`,
      );
    },
  });

  const handleUpdateValue = (
    keyResultId: number,
    periodId: number,
    actualValue: number,
  ) => {
    const key = `${keyResultId}_${periodId}`;
    setEditedValues((prev) => ({
      ...prev,
      [key]: {
        key_result_id: keyResultId,
        tracking_period_id: periodId,
        actual_value: actualValue,
      },
    }));
  };

  const handleSaveTrackingPeriods = () => {
    const values = Object.values(editedValues);
    if (values.length === 0) {
      toast.info("No changes to save");
      return;
    }
    saveTrackingPeriodsMutation.mutate(values);
  };

  const tableData = React.useMemo(() => {
    if (!trackingPeriodsData?.data?.key_result) {
      return [];
    }

    const rows = transformTrackingDataToTableRows(
      trackingPeriodsData.data.key_result,
    );

    if (searchKeyResult) {
      return rows.filter((row) =>
        row.name.toLowerCase().includes(searchKeyResult.toLowerCase()),
      );
    }

    return rows;
  }, [trackingPeriodsData?.data?.key_result, searchKeyResult]);

  const periodColumns = React.useMemo(() => {
    if (!trackingPeriodsData?.data?.key_result?.[0]?.tracking_table) {
      return [];
    }

    return trackingPeriodsData.data.key_result[0].tracking_table.map(
      (period) => ({
        period_id: period.period_id,
        label: period.label,
        key: `period_${period.period_id}`,
      }),
    );
  }, [trackingPeriodsData?.data?.key_result]);

  const cycleInfo = React.useMemo(() => {
    return trackingPeriodsData?.data?.cycle || null;
  }, [trackingPeriodsData?.data?.cycle]);
  const objectiveFrequency = React.useMemo(() => {
    return trackingPeriodsData?.data?.objective_frequency || "";
  }, [trackingPeriodsData?.data?.objective_frequency]);

  const handlePeriodTypeChange = (newPeriodType: string) => {
    setPeriodType(newPeriodType);
    setEditedValues({});
  };

  return {
    periodType,
    setPeriodType,
    handlePeriodTypeChange,
    searchKeyResult,
    setSearchKeyResult,
    trackingPeriodsData,
    isLoadingTrackingPeriods,
    refetchTrackingPeriods,
    tableData,
    periodColumns,
    cycleInfo,
    objectiveFrequency,
    okrCycleId: id,
    editedValues,
    handleUpdateValue,
    handleSaveTrackingPeriods,
    isSaving: saveTrackingPeriodsMutation.isPending,
  };
};
