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
  IMutateFieldRequest,
  IFormGroup,
} from "@/services/form/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormFieldData {
  label: string;
  description?: string;
  type?: string;
  is_required: boolean;
  order: number;
  options?: string[] | { min: number; max: number };
  metadata?: {
    is_note?: boolean;
    competency_id?: number;
    dimension?: string;
    level_id?: number;
    level_value?: number;
    score_weight?: number;
    score_weight_type?: string;
    type?: string;
  };
}

interface FormGroupData {
  name: string;
  metadata: {
    score_weight: number;
    score_weight_type: string;
  };
  fields: FormFieldData[];
}

interface FormTemplateFormData {
  name: string;
  type: string;
  groups: FormGroupData[];
}

const formSchema = z.object({
  name: z.string().min(2, "Form Name must be at least 2 characters"),
  type: z.string().min(1, "Form Usage is required"),
  groups: z.array(
    z.object({
      name: z.string().min(1, "Group name is required"),
      metadata: z.object({
        score_weight: z.number(),
        score_weight_type: z.string(),
      }),
      fields: z.array(
        z.object({
          label: z.string().min(1, "Label is required"),
          type: z.string().min(1, "Type is required"),
          is_required: z.boolean(),
          order: z.number(),
          options: z.array(z.string()).optional(),
        }),
      ),
    }),
  ),
}) satisfies z.ZodType<FormTemplateFormData>;

export type TemplateFormSchema = FormTemplateFormData;

interface UseFormTemplateAddProps {
  editFormId?: number;
  initialData?: Partial<TemplateFormSchema>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useFormTemplateAdd({
  editFormId,
  initialData,
  onSuccess,
  onCancel,
}: UseFormTemplateAddProps = {}) {
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<TemplateFormSchema>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      groups: [],
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
    queryKey: ["form-details", editFormId],
    queryFn: () => getFormById(editFormId!),
    enabled: !!editFormId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  React.useEffect(() => {
    if (editFormData?.data && editFormId) {
      const formData = editFormData.data;
      const typeValue = formData.type?.toString() || "";

      if (!typeValue) {
        console.error("No type value found in form data!");
        return;
      }

      // Map groups with all fields and metadata
      const mappedGroups =
        formData.groups?.map((group) => ({
          name: group.name || "",
          metadata: {
            score_weight: Number(group.metadata?.score_weight) || 0,
            score_weight_type: group.metadata?.score_weight_type || "percent",
          },
          fields:
            group.fields?.map((field, index) => ({
              label: field.label || "",
              description: field.description || "",
              type: field.type || "",
              is_required: field.is_required || false,
              order: field.order ?? index,
              options: field.options || { min: 1, max: 8 },
              metadata: {
                competency_id: field.metadata?.competency_id,
                dimension: field.metadata?.dimension,
                level_id: field.metadata?.level_id,
                level_value: field.metadata?.level_value,
                score_weight: Number(field.metadata?.score_weight) || 0,
                score_weight_type:
                  field.metadata?.score_weight_type || "percent",
                type: field.metadata?.type,
              },
            })) || [],
        })) || [];

      console.log("Preparing to reset form with:", {
        name: formData.name,
        type: typeValue,
        groupsCount: mappedGroups.length,
        groups: mappedGroups,
      });

      requestAnimationFrame(() => {
        form.reset({
          name: formData.name || "",
          type: typeValue,
          groups: mappedGroups,
        });
      });
    }
  }, [editFormData, editFormId, form]);

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
    mutationFn: ({ form_id, groups }: IMutateFieldRequest) =>
      postAddField(form_id, { form_id, groups }),
    onSuccess: () => {
      toast.success("Add field successfully!");
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
              toast.error(errorData.message || "Failed to add field");
            })
            .catch(() => {
              toast.error("Failed to add field: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add field: Server error");
        }
      } else {
        toast.error(`Failed to add field: ${error.message || "Unknown error"}`);
      }
    },
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
      const isCompetencyForm = Number(values.type) === 2;

      const buildGroupsPayload = () =>
        values.groups.map((group) => ({
          name: group.name,
          metadata: group.metadata,
          fields: group.fields.map((field, index) => ({
            label: field.label,
            description: field.description,
            type: field.type,
            is_required: field.is_required,
            order: index,
            options: field.options,
            metadata: isCompetencyForm
              ? {
                  ...field.metadata,
                  type: field.metadata?.type || "use_competency_library",
                }
              : field.metadata,
          })),
        }));

      let result;
      if (editFormId) {
        console.log("values ", values);
        const payload = {
          name: values.name,
          type: Number(values.type),
          description: `Form template: ${values.name}`,
        };
        const updateResponse = await updateFormMutation.mutateAsync({
          form_id: editFormId,
          payload,
        });

        if (updateResponse.data && values.groups.length > 0) {
          const formId = updateResponse.data.id;

          await addFieldMutation.mutateAsync({
            form_id: formId,
            groups: buildGroupsPayload(),
          });
        }

        result = {
          success: true,
          formId: editFormId,
        };
      } else {
        const formResponse = await createFormMutation.mutateAsync({
          name: values.name,
          type: Number(values.type),
          description: `Form template: ${values.name}`,
        });

        if (formResponse.data && values.groups.length > 0) {
          const formId = formResponse.data.id;

          await addFieldMutation.mutateAsync({
            form_id: formId,
            groups: buildGroupsPayload(),
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

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      form.reset();
    }
    router.push("/settings/form-template");
  }, [onCancel, form, router]);

  const handleSave = (e: IMutateFormRequest) => {
    if (editFormId) {
      updateFormMutation.mutate({
        form_id: editFormId,
        payload: {
          name: e.name,
          type: Number(e.type),
          description: e.description ?? `Form template: ${e.name}`,
        },
      });
    } else {
      createFormMutation.mutate(e);
    }
  };

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
    handleCancel,
    form,
    isLoading,
    createFormMutation,
    updateFormMutation,
    addFieldMutation,
    isEditMode: !!editFormId,
    openConfirm,
    setOpenConfirm,
    isSubmitting,
    formData: editFormData?.data,
    openAdd,
    setOpenAdd,
    handleSave,
  };
}
