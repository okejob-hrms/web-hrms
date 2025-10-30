/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { ApiErrorResponse, PaginatedResponse } from "@/lib/types";
import {
  getAllForm,
  postCreateForm,
  postAddField,
  getFormById,
  postUpdateForm,
} from "@/services/form";
import {
  IFormTemplate,
  IFormField,
  IMutateFormRequest,
} from "@/services/form/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormFieldData {
  label: string;
  type: string;
  is_required: boolean;
  order: number;
  options?: string[];
}

interface FormTemplateFormData {
  name: string;
  type: string;
  questions: FormFieldData[];
}

const formSchema = z.object({
  name: z.string().min(2, "Form Name must be at least 2 characters"),
  type: z.string().min(1, "Form Usage is required"),
  questions: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      type: z.string().min(1, "Type is required"),
      is_required: z.boolean(),
      order: z.number(),
      options: z.array(z.string()).optional(),
    }),
  ),
}) satisfies z.ZodType<FormTemplateFormData>;

export type TemplateFormSchema = FormTemplateFormData;

interface UseFormTemplateAddProps {
  editFormId?: number;
  initialData?: Partial<TemplateFormSchema>;
}

export function useFormTemplateAdd({
  editFormId,
  initialData,
}: UseFormTemplateAddProps = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<TemplateFormSchema>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      questions: [],
      ...initialData,
    },
  });

  const {
    data: formsData,
    isLoading: isFormsLoading,
    error: formsError,
  } = useQuery<PaginatedResponse<IFormTemplate>>({
    queryKey: ["form"],
    queryFn: getAllForm,
  });

  const { data: editFormData, isLoading: isEditFormLoading } = useQuery({
    queryKey: ["form", editFormId],
    queryFn: () => getFormById(editFormId!),
    enabled: !!editFormId,
  });

  React.useEffect(() => {
    if (editFormData?.data && editFormId) {
      const formData = editFormData.data;
      const questions: FormFieldData[] = formData.fields.map((field) => ({
        label: field.label,
        type: field.type,
        is_required: field.is_required,
        order: field.order,
        options: Array.isArray(field.options) ? field.options : [],
        description: field.description || "",
      }));
      form.reset({
        name: formData.name,
        type: formData.id.toString(),
        questions: questions,
      });
    }
  }, [editFormData, editFormId, form]);

  const createFormMutation = useMutation({
    mutationFn: postCreateForm,
    onSuccess: () => {
      toast.success("Create form successfully!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.push("/settings/form-template");
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
              toast.error(errorData.message || "Failed to create form");
            })
            .catch(() => {
              toast.error("Failed to create form: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to create form: Server error");
        }
      } else {
        toast.error(
          `Failed to create form: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: ({
      form_id,
      payload,
    }: {
      form_id: number;
      payload: IMutateFormRequest;
    }) => postUpdateForm(form_id, payload),
    onSuccess: () => {
      toast.success("Form updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", editFormId] });
      router.push("/settings/form-template");
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
              toast.error(errorData.message || "Failed to update form");
            })
            .catch(() => {
              toast.error("Failed to update form: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to update form: Server error");
        }
      } else {
        toast.error(
          `Failed to update form: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const addFieldMutation = useMutation({
    mutationFn: ({
      form_id,
      fields,
    }: {
      form_id: number;
      fields: IFormField[];
    }) => postAddField(form_id, { form_id, fields }),
  });

  const formOptions = React.useMemo(() => {
    if (formsData?.data) {
      return formsData.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [formsData?.data]);

  const handleSubmit = async (values: TemplateFormSchema) => {
    try {
      const formTypeMap: Record<string, number> = {
        "1": 1,
        "2": 2,
        "3": 3,
      };

      const typeNumber = formTypeMap[values.type] || parseInt(values.type);

      if (editFormId) {
        const payload = {
          name: values.name,
          // type: typeNumber,
          type: 1,
          description: `Form template: ${values.name}`,
        };
        const updateResponse = await updateFormMutation.mutateAsync({
          form_id: editFormId,
          payload,
        });

        if (updateResponse.data && values.questions.length > 0) {
          const formId = updateResponse.data.id;
          const fields: IFormField[] = values.questions.map(
            (question, index) => ({
              label: question.label,
              type: question.type,
              is_required: question.is_required,
              order: index,
              options: question.options,
            }),
          );

          await addFieldMutation.mutateAsync({
            form_id: formId,
            fields: fields,
          });
        }

        form.reset();

        return { success: true, formId: editFormId, data: updateResponse.data };
      } else {
        const formResponse = await createFormMutation.mutateAsync({
          name: values.name,
          type: typeNumber,
          description: `Form template: ${values.name}`,
        });

        if (formResponse.data && values.questions.length > 0) {
          const formId = formResponse.data.id;
          const fields: IFormField[] = values.questions.map(
            (question, index) => ({
              label: question.label,
              type: question.type,
              is_required: question.is_required,
              order: index,
              options: question.options,
            }),
          );

          await addFieldMutation.mutateAsync({
            form_id: formId,
            fields: fields,
          });
        }

        form.reset();

        return { success: true, formId: formResponse.data?.id };
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      return { success: false, error };
    }
  };

  const isLoading =
    createFormMutation.isPending ||
    updateFormMutation.isPending ||
    addFieldMutation.isPending ||
    isEditFormLoading;

  return {
    forms: formsData?.data ?? [],
    formOptions,
    isFormsLoading,
    formsError,
    formSchema,
    handleSubmit,
    form,
    isLoading,
    createFormMutation,
    updateFormMutation,
    addFieldMutation,
    isEditMode: !!editFormId,
  };
}
