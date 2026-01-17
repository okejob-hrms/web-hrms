'use client';

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectForm } from "@/components/ui/multi-select"; // Use MultiSelect instead

interface DocumentHandoverFormData {
  document: string;
  handover_to_user_ids: string[]; // Changed to array for MultiSelect
}

interface DocumentHandoverFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentHandoverFormData) => void;
  initialData?: DocumentHandoverFormData | null;
  employeesOptions: Array<{
    label: string;
    value: string;
    subtitle?: string;
    image?: string;
  }>;
  searchEmployee: string;
  setSearchEmployee: (value: string) => void;
  isSubmitting: boolean;
}

const DocumentHandoverFormModal: React.FC<DocumentHandoverFormModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  employeesOptions,
  searchEmployee,
  setSearchEmployee,
  isSubmitting,
}) => {
  const form = useForm<DocumentHandoverFormData>({
    defaultValues: {
      document: "",
      handover_to_user_ids: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ document: "", handover_to_user_ids: [] });
    }
  }, [initialData, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Work & Responsibilities Handover" : "Work & Responsibilities Handover"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name<span className="text-red-500 ml-1">*</span></FormLabel>
                  <Textarea className="h-[135px]" placeholder="High-Fidelity design HRMS" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Handed Over To<span className="text-red-500 ml-1">*</span>
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="handover_to_user_ids"
                maxCount={5}
                searchPlaceholder="Search Employee"
                hideSelectAll
                valueTransformer={(value: string) => value}
                searchValue={searchEmployee}
                onSearchChange={setSearchEmployee}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2B5783] text-white">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentHandoverFormModal;