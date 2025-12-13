/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobPosition } from "@/services/job-position";
import { getJobLevels } from "@/services/job-levels";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IMutateKPIRequest } from "@/services/performances/kpi/types";
import { postAddKPI } from "@/services/performances/kpi";
import { ApiErrorResponse } from "@/lib/types";

export const useOKRDetails = () => {
  const queryClient = useQueryClient();
  const [searchOKR, setSearchOKR] = React.useState("");
  const [openFormObjective, setOpenFormObjective] = React.useState(false);
  const [openFormKpi, setOpenFormKpi] = React.useState(false);

  const formKpi = useForm();

  const { data: jobPositions } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: getJobPosition,
  });

  const { data: jobLevels } = useQuery({
    queryKey: ["jobLevels"],
    queryFn: getJobLevels,
  });

  const addKpiMutation = useMutation({
    mutationFn: postAddKPI,
    onSuccess: () => {
      toast.success("Add new Key Result successfully!");
      queryClient.invalidateQueries({ queryKey: ["okr-details"] }); // Assuming there is a query key for OKR details
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

  const handleSaveKpi = (data: IMutateKPIRequest) => {
    addKpiMutation.mutate(data);
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

  return {
    searchOKR,
    setSearchOKR,
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
    formKpi,
  };
};
