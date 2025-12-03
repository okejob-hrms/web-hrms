/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import ConfirmModal from "./sections/confirm-modal";
import { FormFieldRenderer } from "./sections/form-field-renderer";
import { FormField } from "./type";
import { useFormTemplateDetails } from "./hook";
import FormDeleteModal from "../settings-form-template-list/sections/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsFormTemplateDetailsProps {
  editFormId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SettingsFormTemplateDetails = React.memo(
  function SettingsFormTemplateDetails({
    editFormId,
    onSuccess,
    onCancel,
  }: SettingsFormTemplateDetailsProps) {
    const {
      handleSubmit,
      form,
      isLoading,
      isFormsLoading,
      isEditMode,
      openConfirm,
      setOpenConfirm,
      isSubmitting,
      handleEdit,
      formData,
      openDelete,
      setOpenDelete,
      handleDelete,
    } = useFormTemplateDetails({
      editFormId,
      onSuccess,
      onCancel,
    });

    const { fields, append } = useFieldArray({
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

    // const updateQuestionType = React.useCallback(
    //   (index: number, type: string) => {
    //     form.setValue(`questions.${index}.type`, type);
    //   },
    //   [form],
    // );

    const handleConfirmSubmit = React.useCallback(async () => {
      const isValid = await form.trigger();
      if (!isValid) {
        console.log("Form validation failed");
        return;
      }

      const formData = form.getValues();
      await handleSubmit(formData);
    }, [form, handleSubmit]);

    const hasQuestions = fields.length > 0;

    // const onTypeChange = (index: number, type: string) => {
    //   if (type === "checkbox" && !form.watch(`questions.${index}.options`)) {
    //     form.setValue(`questions.${index}.options`, []);
    //   }
    //   updateQuestionType(index, type);
    // };

    if (isFormsLoading) {
      return <Skeleton />;
    }

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h1 className="font-semibold text-lg text-black">Form Details</h1>
        <FormProvider {...form}>
          <form className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-text-disabled text-sm">Form Name</span>
              <span>{formData?.name || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-disabled text-sm">Form Usage</span>
              <span>{formData?.type_label || "-"}</span>
            </div>
            <hr className="col-span-2" />

            {!hasQuestions && formData?.groups?.length === 0 ? (
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
              <div className="col-span-2 flex flex-col gap-4 items-center w-full">
                {formData?.groups.map((group) => (
                  <div
                    className="w-full flex flex-col gap-2"
                    key={`${group.id}-${group.name}`}
                  >
                    <p className="text-black font-semibold">{group.name}</p>
                    <div className="flex flex-col gap-2">
                      {group.fields.map((field) => (
                        <FormFieldRenderer
                          key={`${field.id}-${field.label}`}
                          field={field}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="col-span-2 flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                className="md:w-[174px]"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <Edit />
                Edit Form
              </Button>
              <Button
                type="button"
                className="md:w-[174px] text-error"
                onClick={() => setOpenDelete(true)}
                variant="ghost"
              >
                <Trash />
                Delete Form
              </Button>
            </div>
          </form>
        </FormProvider>
        <ConfirmModal
          onConfirm={handleConfirmSubmit}
          isOpen={openConfirm}
          setIsOpen={setOpenConfirm}
          isLoading={isSubmitting}
          isEditMode={isEditMode}
        />
        <FormDeleteModal
          onDelete={() => handleDelete()}
          isOpen={openDelete}
          setIsOpen={(e) => setOpenDelete(e)}
        />
      </div>
    );
  },
);
