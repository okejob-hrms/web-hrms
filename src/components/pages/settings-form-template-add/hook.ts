import * as React from "react";
import { PaginatedResponse } from "@/lib/types";
import { getAllForm } from "@/services/form";
import { IFormTemplate } from "@/services/form/types";
import { useQuery } from "@tanstack/react-query";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Form Name must be at least 2 characters"),
  usage: z.string().min(5, "Form Usage must be at least 5 characters"),
});

export type TemplateFormSchema = z.infer<typeof formSchema>;

export function useFormTemplateAdd() {
  const {
    data: formsData,
    isLoading: isFormsLoading,
    error: formsError,
  } = useQuery<PaginatedResponse<IFormTemplate>>({
    queryKey: ["form"],
    queryFn: getAllForm,
  });

  const formOptions = React.useMemo(() => {
    if (formsData?.data) {
      return formsData.data.map((item) => ({
        label: item.name,
        value: item.code,
      }));
    }
    return [];
  }, [formsData?.data]);

  const handleSubmit = (values: TemplateFormSchema) => {};

  return {
    forms: formsData?.data ?? [],
    formOptions,
    isFormsLoading,
    formsError,
    formSchema,
    handleSubmit,
  };
}
