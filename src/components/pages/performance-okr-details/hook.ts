/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobPosition } from "@/services/job-position";
import { getJobLevels } from "@/services/job-levels";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IMutateKPIRequest } from "@/services/performances/kpi/types";
import { getAllKPIs, postAddKPI } from "@/services/performances/kpi";
import { ApiErrorResponse } from "@/lib/types";
import {
  createOKRKeyResult,
  createOKRObjective,
  getOKRCycleDetails,
} from "@/services/okr";
import { useParams } from "next/navigation";
import {
  IOKRCycleRequest,
  IOKRKeyResultRequest,
  IOKRObjectiveRequest,
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
