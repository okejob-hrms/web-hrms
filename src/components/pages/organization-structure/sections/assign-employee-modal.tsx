"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { assignEmployeeFormScheme, AssignEmployeeFormValues } from "../types";
import { Check, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelect } from "@/components/ui/multi-select";

interface AssignEmployeetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSave: (data: AssignEmployeeFormValues) => void;
  handleClose: () => void;
}

export default function AssignEmployeeModal({
  open,
  onOpenChange,
  handleSave,
  handleClose,
}: AssignEmployeetModalProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<
    (typeof employees)[0] | null
  >(null);
  const form = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeFormScheme),
    mode: "onChange", // validate on change so Save button can disable live
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: AssignEmployeeFormValues) => {
    handleSave(data);
  };

  const employees = [
    {
      id: 1,
      name: "Olivia Rhye",
      title: "CEO",
      image: "/images/olivia-rhye.png",
    },
    {
      id: 2,
      name: "OWLWW",
      title: "Head of Production",
      image: "/images/olivia-turner.png",
    },
    {
      id: 3,
      name: "KOKOKO",
      title: "Head of Production",
      image: "/images/olivia-turner.png",
    },
    {
      id: 4,
      name: "TTTTT",
      title: "Head of Production",
      image: "/images/olivia-turner.png",
    },
  ];

  console.log("form.formState", form.formState);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Employee</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div
              className={cn(
                "overflow-y-auto pr-2 mt-4",
                selectedEmployee ? "max-h-[500px]" : "max-h-[300px]"
              )}
            >
              {!selectedEmployee ? (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Employee Name{" "}
                        {!selectedEmployee && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <Command className="rounded border-t-0">
                        <div className="flex h-9 items-center gap-2 border rounded px-3">
                          <CommandPrimitive.Input
                            data-slot="command-input"
                            className={cn(
                              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            placeholder="Enter Employee"
                          />
                          <SearchIcon className="size-4 opacity-50" />
                        </div>
                        <CommandList>
                          <CommandEmpty className="py-4 text-center text-sm text-gray-400">
                            No employees found
                          </CommandEmpty>
                          <CommandGroup className="max-h-20 overflow-y-auto">
                            {employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  form.setValue("name", employee.name, {
                                    shouldValidate: true,
                                  });
                                  setSelectedEmployee(employee);
                                }}
                              >
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={employee.image} />
                                  <AvatarFallback>
                                    {employee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{employee.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedEmployee.image} />
                      <AvatarFallback>
                        {selectedEmployee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedEmployee.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedEmployee.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-text-secondary">
                        Email
                      </label>
                      <label className="text-sm text-text-secondary">
                        test@mail.com
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 pr-30">
                      <label className="text-sm text-text-secondary">
                        Phone Number
                      </label>
                      <label className="text-sm text-text-secondary">
                        +62902930190
                      </label>
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
                            Primary Direct Report{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <MultiSelect
                            name="primaryDirectReport"
                            placeholder="All Position"
                            options={[
                              {
                                label:
                                  "Demi Wilkinson (Head of Product Designer)",
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
                                label:
                                  "Demi Wilkinson (Head of Product Designer)",
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
                          <label className="text-sm text-text-secondary">
                            Team
                          </label>
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
              )}
            </div>

            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(null);
                  handleClose();
                }}
                className="min-w-[100px] text-primary"
              >
                Cancel
              </Button>
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
