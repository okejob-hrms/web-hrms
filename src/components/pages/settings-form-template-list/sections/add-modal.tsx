'use client';

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { SelectForm } from "@/components/ui/select-form";
import { IMutateFormRequest } from "@/services/form/types";
import { useTranslations } from "next-intl";

interface FormAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IMutateFormRequest) => void;
  formOptions: {
    label: string;
    value: string;
  }[];
  initialValues?: { name: string; type: string };
  isEditMode?: boolean;
}

export const FormAddModal: React.FC<FormAddModalProps> = ({
  open,
  onOpenChange,
  onSave,
  formOptions,
  initialValues,
  isEditMode,
}) => {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const form = useForm({
    defaultValues: { name: "", type: "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initialValues?.name ?? "",
        type: initialValues?.type ?? "",
      });
    }
  }, [open, initialValues, form]);

  const handleSave = (): void => {
    onSave({
      name: form.getValues("name"),
      type: Number(form.getValues("type")),
    });
    handleClose();
  };

  const handleClose = (): void => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? t('editForm') : t('createNewForm')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="px-6 pb-6 space-y-5">
            <div className="space-y-2">
              <InputForm name="name" label={t('formName')} required />
            </div>

            {!isEditMode && (
              <div className="space-y-2">
                <SelectForm
                  name="type"
                  label={t('formUsage')}
                  required
                  options={formOptions}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 border-[#0e7490] text-[#0e7490] hover:bg-[#0e7490]/5"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                {tCommon('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
