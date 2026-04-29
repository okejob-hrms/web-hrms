"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { businessTripFormSchema, BusinessTripFormValues } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BusinessTripFormValues) => void;
  isSubmitting?: boolean;
}

const defaultValues: BusinessTripFormValues = {
  start_date: "",
  end_date: "",
  destination: "",
  reason: "",
};

export default function EssBusinessTripAddModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const form = useForm<BusinessTripFormValues>({
    resolver: zodResolver(businessTripFormSchema),
    mode: "onChange",
    defaultValues,
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, form]);

  const handleFormSubmit = (values: BusinessTripFormValues) => {
    onSubmit(values);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>New Business Trip Request</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Destination <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input placeholder="e.g. Bandung" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <span className="text-red-500">*</span>
                  </FormLabel>
                  <Textarea
                    rows={4}
                    placeholder="Describe the purpose of the trip"
                    className="resize-none whitespace-pre-wrap break-all"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
                isLoading={isSubmitting}
                className="min-w-[100px]"
              >
                Submit
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
