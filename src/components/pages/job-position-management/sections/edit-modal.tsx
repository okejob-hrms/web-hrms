"use client";

import React, { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IPositionForm,
  JobPositionResponse,
  positionFormScheme,
} from "@/services/job-position/types";

interface JobPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: JobPositionResponse | null;
  handleSave: (data: IPositionForm) => void;
  handleClose: () => void;
  isLoading?: boolean;
}

export default function JobPositionModal({
  open,
  onOpenChange,
  initialData,
  handleSave,
  handleClose,
  isLoading,
}: JobPositionModalProps) {
  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    mode: "onChange", // validate on change so Save button can disable live
    defaultValues: {
      name: "",
      status: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        status: initialData.status,
      });
    } else {
      form.reset({
        name: "",
        status: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: IPositionForm) => {
    handleSave(data);
    form.reset({
      name: "",
      status: "",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {initialData !== null ? "Edit Job Level" : "Create New Job Level"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Position Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input placeholder="Enter Job Level" {...field} />
                  <FormMessage /> {/* shows inline error */}
                </FormItem>
              )}
            />

            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogCancel
                className="min-w-[100px] border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!form.formState.isValid}
                className="min-w-[100px] bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
