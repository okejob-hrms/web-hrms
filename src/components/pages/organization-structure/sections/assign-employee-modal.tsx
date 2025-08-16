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

interface DepartmentModalProps {
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
}: DepartmentModalProps) {
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

                    {!selectedEmployee ? (
                      // Search mode
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
                    ) : (
                      // Scrollable form content
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedEmployee.image} />
                            <AvatarFallback>
                              {selectedEmployee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {selectedEmployee.name}
                            </p>
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

                        {/* Department */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Department<span className="text-red-500">*</span>
                          </label>
                          <SelectForm
                            name="department"
                            options={[
                              { label: "Managerial", value: "managerial" },
                              { label: "Engineering", value: "engineering" },
                              { label: "Marketing", value: "marketing" },
                            ]}
                            required
                          />
                        </div>

                        {/* Position */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <SelectForm
                            name="position"
                            options={[
                              { label: "CEO", value: "ceo" },
                              { label: "CTO", value: "cto" },
                              { label: "COO", value: "coo" },
                            ]}
                            required
                          />
                        </div>

                        {/* Job Level */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Job Level <span className="text-red-500">*</span>
                          </label>
                          <SelectForm
                            name="jobLevel"
                            options={[
                              { label: "Founder", value: "founder" },
                              { label: "Senior", value: "senior" },
                              { label: "Mid", value: "mid" },
                            ]}
                            required
                          />
                        </div>

                        {/* Team Multi-select */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Primary Direct Report{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <MultiSelect
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
                            onValueChange={() => {}}
                            maxCount={3}
                            variant="inverted"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Additional Direct Report
                          </label>
                          <MultiSelect
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
                            onValueChange={() => {}}
                            maxCount={3}
                            variant="inverted"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Team
                          </label>
                          <MultiSelect
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
                            onValueChange={() => {}}
                            maxCount={3}
                            variant="inverted"
                          />
                        </div>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <AlertDialogCancel
                className="min-w-[100px] border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
                onClick={() => {
                  setSelectedEmployee(null);
                  handleClose();
                }}
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
