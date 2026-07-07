/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { TextAreaForm } from "@/components/ui/textarea";
import { InputForm } from "@/components/ui/input";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { IFieldResponse } from "@/services/form/types";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import {
  IMutateEmployeeSelfAssessmentRequest,
  IAssessmentSubmission,
} from "@/services/employees/self-assessment/types";
import { useQueryClient } from "@tanstack/react-query";

interface SurveyAssessmentFormProps {
  fields: IFieldResponse[];
  onSubmit?: (data: IMutateEmployeeSelfAssessmentRequest) => void;
  isSubmitting?: boolean;
  initialData?: IAssessmentSubmission;
}

const RadioCardField = ({
  field,
  min = 1,
  max = 5,
}: {
  field: any;
  min?: number;
  max?: number;
}) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => ({
    value: (min + i).toString(),
    label: (min + i).toString(),
  }));

  return (
    <FormItem className="space-y-3">
      <RadioGroupPrimitive.Root
        className="w-full grid grid-cols-5 gap-3"
        value={field.value}
        onValueChange={field.onChange}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "ring-[1px] ring-border rounded py-1 px-3 focus:outline-none cursor-pointer text-text-disabled",
              "data-[state=checked]:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
              "hover:bg-gray-50 transition-colors",
            )}
          >
            <span className="text-sm font-medium">{option.label}</span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      <FormMessage />
    </FormItem>
  );
};

const SurveyFormFieldRenderer = ({ field }: { field: IFieldResponse }) => {
  const { control } = useFormContext();
  const t = useTranslations("performance");
  const fieldName = field.id.toString();

  const commonProps = {
    name: fieldName,
    label: field.label,
    required: field.is_required,
  };

  switch (field.type) {
    case "checkbox":
      if (Array.isArray(field.options)) {
        return (
          <div className="space-y-4">
            <div className="font-medium text-sm">
              {field.label}
              {field.is_required && <span className="text-destructive">*</span>}
            </div>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            <div className="flex flex-col gap-2">
              {field.options.map((option: string) => (
                <CheckboxForm
                  key={option}
                  name={`${fieldName}.${option}`}
                  label={option}
                />
              ))}
            </div>
          </div>
        );
      }
      return null;

    case "textarea":
      return (
        <TextAreaForm
          {...commonProps}
          placeholder={t("typeAnswerHere")}
          labelClassName="font-medium"
        />
      );

    case "range":
      const min = field.options?.min || 1;
      const max = field.options?.max || 5;

      return (
        <FormField
          control={control}
          name={fieldName}
          rules={{
            required: field.is_required ? t("fieldRequired") : false,
          }}
          render={({ field: formField }) => (
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {field.label}
                {field.is_required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
              <RadioCardField field={formField} min={min} max={max} />
            </div>
          )}
        />
      );

    case "text":
    default:
      return (
        <InputForm
          {...commonProps}
          placeholder={t("typeHere")}
          labelClassName="font-medium"
        />
      );
  }
};

export const SurveyAssessmentForm: React.FC<SurveyAssessmentFormProps> = ({
  fields,
  onSubmit,
  isSubmitting = false,
  initialData,
}) => {
  const queryClient = useQueryClient();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");

  const defaultValues = React.useMemo(() => {
    if (!initialData?.data?.fields) {
      return {};
    }

    const defaults: Record<string, any> = {};
    initialData.data.fields.forEach((field) => {
      const fieldId = field.field_id.toString();

      const fieldDef = fields.find((f) => f.id === field.field_id);

      if (fieldDef?.type === "checkbox") {
        if (field.value) {
          defaults[fieldId] = {};
          String(field.value)
            .split(",")
            .forEach((val) => {
              defaults[fieldId][val.trim()] = true;
            });
        }
      } else {
        defaults[fieldId] = field.value;
      }
    });
    return defaults;
  }, [initialData, fields]);

  const form = useForm({
    defaultValues,
  });

  React.useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleFormSubmit = (status: number) => (data: any) => {
    if (onSubmit) {
      const submissions = Object.entries(data).map(([fieldId, value]) => {
        let formattedValue = value;

        if (typeof value === "object" && value !== null) {
          const selected = Object.entries(value as Record<string, boolean>)
            .filter(([_, isChecked]) => isChecked)
            .map(([optionName]) => optionName)
            .join(",");
          formattedValue = selected;
        }

        return {
          field_id: Number(fieldId),
          value: String(formattedValue ?? ""),
          additional_data: null,
        };
      });

      const payload: IMutateEmployeeSelfAssessmentRequest = {
        status: status.toString(),
        submissions: submissions,
      };

      onSubmit(payload);
    } else {
      toast.success(
        status === 1 ? tCommon("draftSaved") : tCommon("assessmentSubmitted"),
      );
    }
    queryClient.invalidateQueries({ queryKey: ["employee-self-assessment"] });
  };

  const sortedFields = React.useMemo(() => {
    return [...fields].sort((a, b) => a.order - b.order);
  }, [fields]);

  return (
    <FormProvider {...form}>
      <form className="space-y-6">
        {sortedFields.map((field) => (
          <div key={field.id} className="p-4 border rounded-lg bg-white">
            <SurveyFormFieldRenderer field={field} />
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(handleFormSubmit(1))}
            disabled={isSubmitting}
          >
            {t("saveDraft")}
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleFormSubmit(2))}
            disabled={isSubmitting}
          >
            {isSubmitting ? tCommon("processing") : t("submitAssessment")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
