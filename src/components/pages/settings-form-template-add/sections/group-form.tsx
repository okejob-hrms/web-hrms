import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { Plus } from "lucide-react";
import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormCompetencyTemplate } from "./form-competency-template";

interface Props {
  index: number;
}

export const GroupForm = React.memo(function GroupForm({ index }: Props) {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `groups.${index}.fields`,
  });

  const addQuestion = React.useCallback(() => {
    append({
      label: "",
      type: "",
      is_required: false,
      order: fields.length,
      options: [],
    });
  }, [append, fields.length]);

  const removeQuestion = React.useCallback(
    (fieldIndex: number) => {
      remove(fieldIndex);
    },
    [remove],
  );

  return (
    <div className="p-4 border border-primary-border rounded-md space-y-4 w-full flex flex-col items-center gap-4">
      <div className="grid md:grid-cols-7 grid-cols-1 gap-4 w-full">
        <InputForm
          name={`groups.${index}.name`}
          required
          label="Group Name"
          className="md:col-span-6"
        />
        <InputForm
          name={`groups.${index}.metadata.score_weight`}
          label="Score Weight"
        />
      </div>

      <div className="space-y-4 w-full">
        {fields.map((field, fieldIndex) => (
          <FormCompetencyTemplate
            key={field.id}
            groupIndex={index}
            fieldIndex={fieldIndex}
            onRemove={() => removeQuestion(fieldIndex)}
          />
        ))}
      </div>

      <Button
        type="button"
        onClick={addQuestion}
        variant="outline"
        className="w-full md:w-auto"
      >
        <Plus /> Add Question
      </Button>
    </div>
  );
});
