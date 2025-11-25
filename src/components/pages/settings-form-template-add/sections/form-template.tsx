import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { CheckboxField } from "./checkbox-field";
import { RangeField } from "./range-field";
import { RadioField } from "./radio-field";
import { useFormContext } from "react-hook-form";
import Image from "next/image";

interface FormTemplateProps {
  index: number;
  type?: string;
  onRemove: () => void;
  canRemove: boolean;
  onTypeChange: (type: string) => void;
}

export const FormTemplate = React.memo(function FormTemplate({
  index,
  type = "",
  onRemove,
  canRemove,
  onTypeChange,
}: FormTemplateProps) {
  const form = useFormContext();
  const selectedType = form.watch(`groups[0].fields.${index}.type`);

  return (
    <div className="rounded-md p-4 gap-4 border border-grayscale-40 grid grid-cols-2 w-full relative">
      {canRemove && (
        <Button
          variant="ghost"
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2"
        >
          <Image
            width={16}
            height={16}
            src="/icons/deleteOutlined.svg"
            alt="trash"
          />
        </Button>
      )}
      <InputForm
        name={`groups[0].fields.${index}.label`}
        required
        label="Question"
        className="col-span-2"
      />
      <InputForm
        name={`groups[0].fields.${index}.description`}
        label="Description"
        className="col-span-2"
      />
      <SelectForm
        name={`groups[0].fields.${index}.type`}
        label="Answer Type"
        required
        options={[
          { label: "Checkbox", value: "checkbox" },
          { label: "Range", value: "range" },
          { label: "Short Answer", value: "text" },
          { label: "Paragraph", value: "textarea" },
          { label: "Radio", value: "radio" },
        ]}
        onChange={(e) => onTypeChange(e.target.value)}
      />
      {selectedType === "checkbox" && <CheckboxField questionIndex={index} />}
      {selectedType === "range" && <RangeField />}
      {selectedType === "radio" && <RadioField questionIndex={index} />}
    </div>
  );
});
