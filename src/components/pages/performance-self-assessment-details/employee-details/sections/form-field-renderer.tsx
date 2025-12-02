import * as React from "react";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { TextAreaForm } from "@/components/ui/textarea";
import { InputForm } from "@/components/ui/input";
import RadioCard from "@/components/ui/radio-card";
import { FormField } from "@/components/pages/settings-form-template-details/type";

export const FormFieldRenderer = React.memo(function FormFieldRenderer({
  field,
}: {
  field: FormField;
}) {
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
