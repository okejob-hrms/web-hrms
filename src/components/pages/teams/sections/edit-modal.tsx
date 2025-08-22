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
import { Textarea } from "@/components/ui/textarea";
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
import { TeamsFormValues, teamsFormScheme } from "../types";
import { ITeam } from "@/lib/types";

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ITeam | null;
  handleSave: (data: TeamsFormValues) => void;
  handleClose: () => void;
}

export default function TeamModal({
  open,
  onOpenChange,
  initialData,
  handleSave,
  handleClose,
}: TeamModalProps) {
  const form = useForm<TeamsFormValues>({
    resolver: zodResolver(teamsFormScheme),
    mode: "onChange", // validate on change so Save button can disable live
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: TeamsFormValues) => {
    handleSave(data);
    form.reset({
      name: "",
      description: "",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {initialData !== null ? "Edit Team Details" : "Create New Team"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            {/* Team Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Team Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input placeholder="Enter team name" {...field} />
                  <FormMessage /> {/* shows inline error */}
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <Textarea
                    className="resize-none h-[135px] whitespace-pre-wrap break-all"
                    rows={5}
                    placeholder="Enter description"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogCancel
                className="min-w-[100px] border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
                onClick={handleClose}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
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
