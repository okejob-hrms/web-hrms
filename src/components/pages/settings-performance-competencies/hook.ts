/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPerformanceCompetencies,
  postAddPerformanceCompetency,
} from "@/services/performance-competency";
import { IMutatePerformanceCompetency } from "@/services/performance-competency/hook";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export const usePerformanceCompetenciesList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<IMutatePerformanceCompetency>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });
  const [isOpenModalForm, setIsOpenModalForm] = React.useState(false);
  const { data: performanceCompetencies } = useQuery({
    queryKey: ["performance-competencies"],
    queryFn: () => getPerformanceCompetencies(),
  });

  const mutateAddPerformanceCompetency = useMutation({
    mutationFn: (params: IMutatePerformanceCompetency) =>
      postAddPerformanceCompetency(params),
    onSuccess: () => {
      setIsOpenModalForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["performance-competencies"] });
      toast.success("Performance competency added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add performance competency");
    },
  });

  const handleAddNew = () => setIsOpenModalForm(true);

  const handleSave = form.handleSubmit((data: IMutatePerformanceCompetency) => {
    mutateAddPerformanceCompetency.mutate(data);
  });

  return {
    handleAddNew,
    handleSave,
    isOpenModalForm,
    setIsOpenModalForm,
    performanceCompetencies,
    form,
    isSubmitting: mutateAddPerformanceCompetency.isPending,
  };
};
