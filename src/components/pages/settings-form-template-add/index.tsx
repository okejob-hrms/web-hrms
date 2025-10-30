/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputForm } from "@/components/ui/input";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { useFormTemplateAdd } from "./hook";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SelectForm } from "@/components/ui/select-form";
import { FormTemplate } from "./sections/form-template";

interface SettingsFormTemplateAddProps {
  editFormId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SettingsFormTemplateAdd = React.memo(
  function SettingsFormTemplateAdd({
    editFormId,
    onSuccess,
    onCancel,
  }: SettingsFormTemplateAddProps) {
    const { formOptions, handleSubmit, form, isLoading, isEditMode } =
      useFormTemplateAdd({
        editFormId,
      });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "questions",
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
      (index: number) => {
        remove(index);
      },
      [remove],
    );

    const updateQuestionType = React.useCallback(
      (index: number, type: string) => {
        form.setValue(`questions.${index}.type`, type);
      },
      [form],
    );

    const onSubmit = React.useCallback(
      async (data: any) => {
        const result = await handleSubmit(data);
        if (result.success && onSuccess) {
          onSuccess();
        }
      },
      [handleSubmit, onSuccess],
    );

    const handleCancel = React.useCallback(() => {
      if (onCancel) {
        onCancel();
      } else {
        form.reset();
      }
    }, [onCancel, form]);

    const hasQuestions = fields.length > 0;

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h1 className="font-semibold text-lg text-black">
          {isEditMode ? "Edit Form Template" : "Form Details"}
        </h1>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <InputForm name="name" label="Form Name" required />
            <SelectForm
              name="type"
              label="Form Usage"
              required
              options={formOptions}
              className="w-full"
            />
            <hr className="col-span-2" />

            {!hasQuestions ? (
              <div className="col-span-2 p-4 rounded-sm bg-primary-background border border-primary-border flex flex-col items-center justify-center gap-2">
                <p className="text-primary font-bold text-lg">
                  Nothing here yet
                </p>
                <p className="text-text-secondary text-base font-normal">
                  Start building your first form now
                </p>
                <Button type="button" onClick={addQuestion}>
                  <Plus /> Add Question
                </Button>
              </div>
            ) : (
              <div className="col-span-2 flex flex-col gap-2 items-center">
                {fields.map((field, index) => (
                  <FormTemplate
                    key={field.id}
                    index={index}
                    type={form.watch(`questions.${index}.type`)}
                    onRemove={() => removeQuestion(index)}
                    canRemove={true}
                    onTypeChange={(type) => updateQuestionType(index, type)}
                  />
                ))}
                <Button
                  variant="outline"
                  type="button"
                  className="text-primary"
                  onClick={addQuestion}
                >
                  <Plus /> Add Question
                </Button>
              </div>
            )}

            <div className="col-span-2 flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="md:w-[174px]"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="md:w-[174px]"
                disabled={!hasQuestions || isLoading}
              >
                {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  },
);
