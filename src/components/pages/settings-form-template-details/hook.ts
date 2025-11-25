/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { ApiErrorResponse, PaginatedResponse } from "@/lib/types";
import {
  getAllForm,
  postCreateForm,
  postAddField,
  getFormById,
  postUpdateForm,
  deleteForm,
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

interface UseFormTemplateDetailsProps {
  editFormId?: number;
  initialData?: Partial<TemplateFormSchema>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useFormTemplateDetails({
  editFormId,
  initialData,
  onSuccess,
  onCancel,
}: UseFormTemplateDetailsProps = {}) {
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const { data: formDetails, isLoading: isEditFormLoading } = useQuery({
    queryKey: ["form-details", editFormId],
    queryFn: () => getFormById(editFormId!),
    enabled: !!editFormId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  React.useEffect(() => {
    if (formDetails?.data && editFormId) {
      const formData = formDetails.data;
      const typeValue = formData.type?.toString() || "";

      if (!typeValue) {
        console.error("No type value found in form data!");
        return;
      }

      const questions: FormFieldData[] =
        formData.groups[0]?.fields?.map((field, index) => ({
          label: field.label || "",
          type: field.type || "",
          is_required: field.is_required || false,
          order: field.order ?? index,
          options: Array.isArray(field.options) ? field.options : [],
          description: field.description || "",
        })) || [];

      console.log("Preparing to reset form with:", {
        name: formData.name,
        type: typeValue,
        questionsCount: questions.length,
      });

      requestAnimationFrame(() => {
        form.reset({
          name: formData.name || "",
          type: typeValue,
          questions: questions,
        });
      });
    }
  }, [formDetails, editFormId, form]);

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Success delete form");
      router.push("/settings/form-template");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete form");
    },
  });

  const handleDelete = () => {
    if (!editFormId) return;
    removeForm(Number(editFormId));
  };

  const createFormMutation = useMutation({
    mutationFn: postCreateForm,
    onSuccess: () => {
      toast.success("Create form successfully!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
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
      queryClient.invalidateQueries({ queryKey: ["form"] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form-details", editFormId] });
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
      groups,
    }: {
      form_id: number;
      groups: {
        id?: string;
        name?: string;
        metadata?: {
          score_weight: number;
          score_weight_type: string;
        };
        fields?: IFormField[];
      }[];
    }) => postAddField(form_id, { form_id, groups }),
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
    setIsSubmitting(true);
    try {
      let result;
      if (editFormId) {
        const payload = {
          name: values.name,
          type: Number(values.type),
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
            groups: [{
              id: undefined,
              name: "Default Group",
              metadata: undefined,
              fields: fields,
            }],
          });
        }

        result = {
          success: true,
          formId: editFormId,
          data: updateResponse.data,
        };
      } else {
        const formResponse = await createFormMutation.mutateAsync({
          name: values.name,
          type: Number(values.type),
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
            groups: [{
              id: undefined,
              name: "Default Group",
              metadata: undefined,
              fields: fields,
            }],
          });
        }

        result = { success: true, formId: formResponse.data?.id };
      }

      if (result.success) {
        form.reset();
        setOpenConfirm(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/settings/form-template");
        }
      }

      return result;
    } catch (error) {
      console.error("Form submission failed:", error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = React.useCallback(() => {
    form.reset();
    router.push(`/settings/form-template/edit/${editFormId}`);
  }, [form, router]);

  const isLoading =
    createFormMutation.isPending ||
    updateFormMutation.isPending ||
    addFieldMutation.isPending ||
    isEditFormLoading ||
    isSubmitting;

  return {
    forms: formsData?.data ?? [],
    formOptions,
    isFormsLoading,
    formsError,
    formSchema,
    handleSubmit,
    handleEdit,
    form,
    isLoading,
    createFormMutation,
    updateFormMutation,
    addFieldMutation,
    isEditMode: !!editFormId,
    openConfirm,
    setOpenConfirm,
    isSubmitting,
    formData: formDetails?.data,
    openDelete,
    setOpenDelete,
    handleDelete,
  };
}
