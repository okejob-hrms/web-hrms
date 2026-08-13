/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useForm, FormProvider, useFormContext, useWatch } from "react-hook-form";
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
import { resolveAssessmentKeterangan } from "@/lib/assessment-field-keterangan";
import { AssessmentFieldKeterangan } from "@/components/pages/shared/assessment-field-keterangan";

export type SurveyAssessmentFormMode = "submit" | "validate" | "readonly";

interface SurveyAssessmentFormProps {
  fields: IFieldResponse[];
  onSubmit?: (data: IMutateEmployeeSelfAssessmentRequest) => void;
  isSubmitting?: boolean;
  initialData?: IAssessmentSubmission;
  mode?: SurveyAssessmentFormMode;
}

const RadioCardField = ({
  field,
  min = 1,
  max = 5,
  disabled = false,
}: {
  field: any;
  min?: number;
  max?: number;
  disabled?: boolean;
}) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => ({
    value: (min + i).toString(),
    label: (min + i).toString(),
  }));

  return (
    <FormItem className="space-y-3">
      <RadioGroupPrimitive.Root
        className="w-full flex flex-wrap gap-3"
        value={field.value}
        onValueChange={disabled ? undefined : field.onChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            disabled={disabled}
            className={cn(
              "min-w-11 ring-[1px] ring-border rounded py-1 px-3 focus:outline-none text-text-disabled",
              disabled ? "cursor-default opacity-90" : "cursor-pointer",
              "data-[state=checked]:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
              !disabled && "hover:bg-gray-50 transition-colors",
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

const SurveyFormFieldRenderer = ({
  field,
  readOnly,
}: {
  field: IFieldResponse;
  readOnly: boolean;
}) => {
  const { control } = useFormContext();
  const t = useTranslations("performance");
  const fieldName = field.id.toString();
  const watchedValue = useWatch({ control, name: fieldName });

  const commonProps = {
    name: fieldName,
    label: field.label,
    required: field.is_required && !readOnly,
    disabled: readOnly,
  };

  switch (field.type) {
    case "checkbox":
      if (Array.isArray(field.options)) {
        return (
          <div className="space-y-4">
            <div className="font-medium text-sm">
              {field.label}
              {field.is_required && !readOnly && (
                <span className="text-destructive">*</span>
              )}
            </div>
            <AssessmentFieldKeterangan description={field.description} />
            <div className="flex flex-col gap-2">
              {field.options.map((option: string) => (
                <CheckboxForm
                  key={option}
                  name={`${fieldName}.${option}`}
                  label={option}
                  disabled={readOnly}
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
          description={field.description || undefined}
        />
      );

    case "range": {
      const min = field.options?.min || 1;
      const max = field.options?.max || 5;
      const keterangan = resolveAssessmentKeterangan(
        field.description,
        field.competency_levels,
        watchedValue,
      );

      return (
        <FormField
          control={control}
          name={fieldName}
          rules={{
            required:
              field.is_required && !readOnly ? t("fieldRequired") : false,
          }}
          render={({ field: formField }) => (
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {field.label}
                {field.metadata?.score_weight != null && (
                  <span className="text-text-secondary font-normal">
                    {" "}
                    ({field.metadata.score_weight}%)
                  </span>
                )}
                {field.is_required && !readOnly && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <AssessmentFieldKeterangan
                description={keterangan.description}
                levelName={keterangan.levelName}
              />
              <RadioCardField
                field={formField}
                min={min}
                max={max}
                disabled={readOnly}
              />
            </div>
          )}
        />
      );
    }

    case "text":
    default:
      return (
        <InputForm
          {...commonProps}
          placeholder={t("typeHere")}
          labelClassName="font-medium"
          disabled={readOnly}
          description={field.description || undefined}
        />
      );
  }
};

export const SurveyAssessmentForm: React.FC<SurveyAssessmentFormProps> = ({
  fields,
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "submit",
}) => {
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const isReadOnly = mode === "readonly";
  const isValidate = mode === "validate";

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
    form.reset(defaultValues);
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
  };

  // Parents pass flattenFormGroupsInTemplateOrder(...); keep that sequence.
  // Do not re-sort by field.order across groups.

  return (
    <FormProvider {...form}>
      <form className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="p-4 border rounded-lg bg-white">
            <SurveyFormFieldRenderer field={field} readOnly={isReadOnly} />
          </div>
        ))}

        {!isReadOnly && (
          <div className="flex justify-end gap-2 pt-4">
            {!isValidate && (
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(handleFormSubmit(1))}
                disabled={isSubmitting}
              >
                {t("saveDraft")}
              </Button>
            )}
            <Button
              type="button"
              onClick={form.handleSubmit(handleFormSubmit(2))}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? tCommon("processing")
                : isValidate
                  ? t("submitValidation")
                  : t("submitAssessment")}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};
