/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputForm } from "@/components/ui/input";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { useFormTemplateAdd } from "./hook";
import { Button } from "@/components/ui/button";
import { Edit, List, Plus } from "lucide-react";
import { SelectForm } from "@/components/ui/select-form";
import { FormTemplate } from "./sections/form-template";
import { GroupForm } from "./sections/group-form";
import ConfirmModal from "./sections/confirm-modal";
import { FormAddModal } from "../settings-form-template-list/sections/add-modal";

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
    const {
      formOptions,
      handleSubmit,
      form,
      isLoading,
      isEditMode,
      openConfirm,
      setOpenConfirm,
      isSubmitting,
      handleCancel,
      formData,
      openAdd,
      setOpenAdd,
      handleSave,
    } = useFormTemplateAdd({
      editFormId,
      onSuccess,
      onCancel,
    });

    const {
      fields: groupFields,
      append: appendGroup,
      remove: removeGroup,
    } = useFieldArray({
      control: form.control,
      name: "groups",
    });

    const {
      fields: fieldArray,
      append: appendField,
      remove: removeField,
    } = useFieldArray({
      control: form.control,
      name: "groups.0.fields",
    });

    const addGroup = React.useCallback(() => {
      appendGroup({
        name: "Default Group",
        metadata: {
          score_weight: 0,
          score_weight_type: "percent",
        },
        fields: [
          {
            label: "",
            type: "",
            is_required: false,
            order: 0,
            options: [],
          },
        ],
      });
    }, [appendGroup]);

    const addField = React.useCallback(() => {
      appendField({
        label: "",
        type: "",
        is_required: false,
        order: fieldArray.length,
        options: [],
      });
    }, [appendField, fieldArray.length]);

    const handleConfirmSubmit = React.useCallback(async () => {
      const isValid = await form.trigger();
      if (!isValid) {
        console.log("Form validation failed");
        return;
      }

      const formData = form.getValues();
      await handleSubmit(formData);
    }, [form, handleSubmit]);

    const hasGroups = groupFields.length > 0;

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <div className="flex gap-2 items-center">
          <h1 className="font-semibold text-lg text-black">
            {isEditMode ? "Edit Form Template" : "Form Details"}
          </h1>
          <Button
            type="button"
            onClick={() => setOpenAdd(true)}
            variant="ghost"
            size="sm"
            className="text-primary"
          >
            <Edit /> Edit
          </Button>
        </div>
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
            {formData?.type !== 2 ? (
              !hasGroups ? (
                <div className="col-span-2 p-4 rounded-sm bg-primary-background border border-primary-border flex flex-col items-center justify-center gap-2">
                  <p className="text-primary font-bold text-lg">
                    Nothing here yet
                  </p>
                  <p className="text-text-secondary text-base font-normal">
                    Start building your first form now
                  </p>
                  <Button type="button" onClick={addGroup}>
                    <Plus /> Add Question
                  </Button>
                </div>
              ) : (
                <div className="col-span-2 flex flex-col gap-4 items-center">
                  {fieldArray.map((field, index) => (
                    <FormTemplate
                      key={field.id}
                      index={index}
                      onRemove={() => removeField(index)}
                      canRemove={fieldArray.length > 1}
                      onTypeChange={(type) => {
                        // form.setValue(`groups.${index}.type`, type);
                      }}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    type="button"
                    className="text-primary"
                    onClick={addField}
                  >
                    <Plus /> Add Question
                  </Button>
                </div>
              )
            ) : !hasGroups ? (
              <div className="col-span-2 p-4 rounded-sm bg-primary-background border border-primary-border flex flex-col items-center justify-center gap-2">
                <p className="text-primary font-bold text-lg">
                  Nothing here yet
                </p>
                <p className="text-text-secondary text-base font-normal">
                  Start building your first form now
                </p>
                <Button type="button" onClick={addGroup}>
                  <List /> Add Question Group
                </Button>
              </div>
            ) : (
              <div className="col-span-2 flex flex-col gap-4 items-center">
                {groupFields.map((field, index) => (
                  <GroupForm key={field.id} index={index} />
                ))}
                <Button
                  variant="ghost"
                  type="button"
                  className="text-primary"
                  onClick={addGroup}
                >
                  <List /> Add Question Group
                </Button>
              </div>
            )}

            <div className="col-span-2 flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="md:w-[174px]"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="md:w-[174px]"
                disabled={!hasGroups || isLoading}
                onClick={() => setOpenConfirm(true)}
              >
                {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
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
        <FormAddModal
          formOptions={formOptions}
          open={openAdd}
          onOpenChange={setOpenAdd}
          onSave={handleSave}
        />
      </div>
    );
  },
);
