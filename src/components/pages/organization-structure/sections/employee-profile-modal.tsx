// sections/EmployeeProfileModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  assignEmployeeFormScheme,
  AssignEmployeeFormValues,
  EmployeeNode,
} from "../types";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelect } from "@/components/ui/multi-select";

interface EmployeeProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleClose: () => void;
  employeeData: EmployeeNode;
  // Add a prop for handling the save action
  handleSave: (data: AssignEmployeeFormValues) => void;
}

// --- Helper component for the Detail View ---
const DetailView = ({ employeeData }: { employeeData: EmployeeNode }) => (
  <div className="space-y-4">
    {/* ... (all the label-based views from your EmployeeDetailModal) ... */}
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={employeeData.image} />
        <AvatarFallback>{employeeData.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{employeeData.name}</p>
        <p className="text-xs text-gray-500">{employeeData.title}</p>
      </div>
    </div>

    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-secondary">Email</label>
        <label className="text-sm text-text-secondary">test@mail.com</label>
      </div>
      <div className="flex flex-col gap-2 pr-30">
        <label className="text-sm text-text-secondary">Phone Number</label>
        <label className="text-sm text-text-secondary">+62902930190</label>
      </div>
    </div>

    {/* Department */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">Department</label>
      <label className="text-sm text-text-secondary">Managerial</label>
    </div>

    {/* Position */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">Position</label>
      <label className="text-sm text-text-secondary">CEO</label>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">Job Level</label>
      <label className="text-sm text-text-secondary">Founder</label>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">
        Primary Direct Report
      </label>
      <label className="text-sm text-text-secondary">Phoenix Baker (CEO)</label>
    </div>

    {/* Team Multi-select */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">
        Additional Direct Report
      </label>
      <label className="text-sm text-text-secondary">
        Phoenix Baker (CEO); Demi Wilkinson (Head of Product Designer)
      </label>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Teams</label>
      <div className="flex flex-row gap-2">
        <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          Team Creative
        </div>
      </div>
    </div>
  </div>
);

// --- Helper component for the Edit Form ---
const EditView = ({
  form,
  employeeData,
}: {
  form: UseFormReturn<AssignEmployeeFormValues>;
  employeeData: EmployeeNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={employeeData.image} />
        <AvatarFallback>{employeeData.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{employeeData.name}</p>
        <p className="text-xs text-gray-500">{employeeData.title}</p>
      </div>
    </div>

    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-secondary">Email</label>
        <label className="text-sm text-text-secondary">test@mail.com</label>
      </div>
      <div className="flex flex-col gap-2 pr-30">
        <label className="text-sm text-text-secondary">Phone Number</label>
        <label className="text-sm text-text-secondary">+62902930190</label>
      </div>
    </div>
    <FormField
      control={form.control}
      name="department"
      render={({ field }) => (
        <FormItem>
          <label className="text-sm text-text-secondary">
            Department<span className="text-red-500">*</span>
          </label>
          <SelectForm
            options={[
              { label: "Managerial", value: "managerial" },
              { label: "Engineering", value: "engineering" },
              { label: "Marketing", value: "marketing" },
            ]}
            {...field}
            required
          />
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="position"
      render={({ field }) => (
        <FormItem>
          <label className="text-sm text-text-secondary">
            Position<span className="text-red-500">*</span>
          </label>
          <SelectForm
            options={[
              { label: "CEO", value: "ceo" },
              { label: "CTO", value: "cto" },
              { label: "COO", value: "coo" },
            ]}
            required
            {...field}
          />
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="jobLevel"
      render={({ field }) => (
        <FormItem>
          <label className="text-sm text-text-secondary">
            Job Level<span className="text-red-500">*</span>
          </label>
          <SelectForm
            options={[
              { label: "Founder", value: "founder" },
              { label: "Senior", value: "senior" },
              { label: "Mid", value: "mid" },
            ]}
            required
            {...field}
          />
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="primaryDirectReport"
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">
              Primary Direct Report <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              name="primaryDirectReport"
              placeholder="All Position"
              options={[
                {
                  label: "Demi Wilkinson (Head of Product Designer)",
                  value: "Demi Wilkinson",
                },
                { label: "Team Lead", value: "team lead" },
                { label: "Senior", value: "senior" },
                { label: "Staff", value: "staff" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              maxCount={3}
              variant="inverted"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="additionalDirectReport"
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">
              Additional Direct Report
            </label>
            <MultiSelect
              name="additionalDirectReport"
              placeholder="All Position"
              options={[
                {
                  label: "Demi Wilkinson (Head of Product Designer)",
                  value: "Demi Wilkinson",
                },
                { label: "Team Lead", value: "team lead" },
                { label: "Senior", value: "senior" },
                { label: "Staff", value: "staff" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              maxCount={3}
              variant="inverted"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="teams"
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Team</label>
            <MultiSelect
              name="teams"
              placeholder="All Position"
              options={[
                {
                  label: "Team Creative",
                  value: "team creative",
                },
                { label: "Team Lead", value: "team lead" },
                { label: "Senior", value: "senior" },
                { label: "Staff", value: "staff" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              maxCount={3}
              variant="inverted"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default function EmployeeProfileModal({
  open,
  onOpenChange,
  handleClose,
  employeeData,
  handleSave,
}: EmployeeProfileModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeFormScheme),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      setIsEditMode(false);
      form.reset({
        name: employeeData.name,
      });
    }
  }, [open, employeeData, form]);

  const onSubmit = (data: AssignEmployeeFormValues) => {
    handleSave(data);
    setIsEditMode(false); // Switch back to view mode after saving
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEditMode ? "Edit Employee" : "Employee Details"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className={cn("overflow-y-auto pr-2 mt-4", "max-h-[500px]")}>
              {isEditMode ? (
                <EditView employeeData={employeeData} form={form} />
              ) : (
                <DetailView employeeData={employeeData} />
              )}
            </div>
            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              {isEditMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="min-w-[100px]"
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="min-w-[100px] text-primary"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                    className="min-w-[100px] "
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
