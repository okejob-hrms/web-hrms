import * as React from "react";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { TextAreaForm } from "@/components/ui/textarea";
import { InputForm } from "@/components/ui/input";
import RadioCard from "@/components/ui/radio-card";
import { FormField } from "@/components/pages/settings-form-template-details/type";
import { IAssessmentField } from "@/services/employees/self-assessment/types";
import { useFormContext } from "react-hook-form";

export const FormFieldRenderer = React.memo(function FormFieldRenderer({
  field,
  value,
}: {
  field: FormField;
  value?: IAssessmentField;
}) {
  const { setValue } = useFormContext();

  React.useEffect(() => {
    if (value) {
      if (field.type === "checkbox") {
        const selectedValues = value.value ? value.value.split(",").map(v => v.trim()) : [];
        
        if (Array.isArray(field.options)) {
          field.options.forEach((option: string) => {
            setValue(option, selectedValues.includes(option));
          });
        }
      } else {
        setValue(field.form_id.toString(), value.value || "");
      }
    }
  }, [value, field, setValue]);

  const renderField = () => {
    switch (field.type) {
      case "checkbox":
        return (
          <div className="mt-2">
            {Array.isArray(field.options) &&
              field.options.map((option: string) => (
                <CheckboxForm
                  key={option}
                  name={option}
                  label={option}
                  disabled
                />
              ))}
          </div>
        );

      case "textarea":
        return (
          <TextAreaForm
            data-state="disabled"
            name={field.form_id.toString()}
            label={field.label}
            disabled
            inputClassName="bg-grayscale-20 text-text-disabled"
          />
        );

      case "range":
        return (
          <div className="flex gap-2">
            {field.options && !Array.isArray(field.options) && (
              <RadioCard
                disabled
                max={field.options.max}
                min={field.options.min}
                value={value?.value}
              />
            )}
          </div>
        );

      default:
        return (
          <InputForm
            name={field.form_id.toString()}
            className="mt-2"
            disabled
            value={value?.value}
          />
        );
    }
  };

  return (
    <div className="rounded-sm border border-grayscale-20 p-4 gap-4 w-full">
      <span className="font-medium">{field.label}</span>
      {renderField()}
    </div>
  );
});
