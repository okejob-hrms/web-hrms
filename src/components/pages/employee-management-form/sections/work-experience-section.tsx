/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Plus } from "lucide-react";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getWorkExperiences,
  postCreateWorkExperience,
  putUpdateWorkExperience,
  deleteWorkExperience,
} from "@/services/employees/work-experiences";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IResponseWorkExperience,
  IWorkExperienceForm,
  WorkExperienceFormSchema,
} from "@/services/employees/work-experiences/types";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TextAreaForm } from "@/components/ui/textarea";
import { rupiahFormatter } from "@/lib/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";

dayjs.extend(localizedFormat);

// Phone number utility functions
const formatPhoneNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 10) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}-${cleanValue.slice(10)}`;
  }
};

const validatePhoneNumber = (value: string): string | null => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length < 3) {
    return "Phone number must be at least 3 digits";
  }
  if (cleanValue.length > 15) {
    return "Phone number must be no more than 15 digits";
  }
  return null;
};

const extractNumericPhone = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, "");
};

interface TableRowActionsProps {
  row: any;
  onEdit: (workExperience: IResponseWorkExperience) => void;
  onDelete: (workExperienceId: number) => void;
}

const TableRowActions = ({ row, onEdit, onDelete }: TableRowActionsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(row.original);
    setIsDropdownOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(row.original.id);
    setIsDropdownOpen(false);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Ellipsis className="h-4 w-4 text-grayscale-30" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
          <div className="flex h-fit w-fit gap-2 justify-between items-center">
            <Image
              src="/icons/editGrey.svg"
              height={16}
              width={16}
              alt="icon-edit"
            />
            Edit
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="cursor-pointer"
        >
          <div className="flex h-fit w-fit gap-2 justify-between items-center">
            <Image
              src="/icons/delete.svg"
              height={16}
              width={16}
              alt="icon-delete"
            />
            Delete
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Custom Phone Input Component
interface PhoneInputProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  form: any;
}

const PhoneInput = ({
  name,
  label,
  required,
  disabled,
  form,
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const fieldValue = form.watch(name);

  React.useEffect(() => {
    if (fieldValue) {
      setDisplayValue(formatPhoneNumber(fieldValue.toString()));
    } else {
      setDisplayValue("");
    }
  }, [fieldValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    const numericValue = extractNumericPhone(formattedValue);

    setDisplayValue(formattedValue);

    const validationError = validatePhoneNumber(formattedValue);
    setError(validationError);

    form.setValue(name, numericValue, { shouldValidate: true });
  };

  const handleBlur = () => {
    const validationError = validatePhoneNumber(displayValue);
    setError(validationError);

    if (validationError) {
      form.setError(name, {
        type: "manual",
        message: validationError,
      });
    } else {
      form.clearErrors(name);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="e.g. 123-456-7890"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Enter digits only (3-15 characters). Formatting will be applied
        automatically.
      </p>
    </div>
  );
};

interface WorkExperienceFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  workExperienceData?: IResponseWorkExperience | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline";
}

const WorkExperienceFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  workExperienceData,
  employee_profile_id,
  onSuccess,
  buttonVariant = "default",
}: WorkExperienceFormModalProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<IWorkExperienceForm>({
    resolver: zodResolver(WorkExperienceFormSchema),
    defaultValues: {
      company: "",
      initial_position: "",
      final_position: "",
      supervisor: "",
      supervisor_contact: "",
      company_address: "",
      start_date: new Date(),
      end_date: new Date(),
      last_salary: 0,
      reason_for_resign: "",
    },
  });

  React.useEffect(() => {
    if (isEdit && workExperienceData && open) {
      form.reset({
        company: workExperienceData.company || "",
        initial_position: workExperienceData.initial_position || "",
        final_position: workExperienceData.final_position || "",
        supervisor: workExperienceData.supervisor || "",
        supervisor_contact: workExperienceData.supervisor_contact || "",
        company_address: workExperienceData.company_address || "",
        start_date: workExperienceData.start_date
          ? new Date(workExperienceData.start_date)
          : new Date(),
        end_date: workExperienceData.end_date
          ? new Date(workExperienceData.end_date)
          : new Date(),
        last_salary: Number(workExperienceData.last_salary) || 0,
        reason_for_resign: workExperienceData.reason_for_resign || "",
      });
    }
  }, [isEdit, workExperienceData, open, form]);

  const mutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IWorkExperienceForm;
      id?: number;
    }) =>
      isEdit
        ? putUpdateWorkExperience(params)
        : postCreateWorkExperience(params),
    onSuccess: () => {
      toast.success(
        `Work experience ${isEdit ? "updated" : "added"} successfully!`,
      );

      queryClient.invalidateQueries({
        queryKey: ["work-experiences", employee_profile_id || ""],
      });

      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(
        `Failed to ${isEdit ? "update" : "add"} work experience: ${
          error?.response?.data?.message || error.message || "Unknown error"
        }`,
      );
    },
  });

  const onSubmit = React.useCallback(
    async (values: IWorkExperienceForm) => {
      try {
        const phoneError = validatePhoneNumber(
          values.supervisor_contact?.toString() || "",
        );
        if (phoneError) {
          form.setError("supervisor_contact", {
            type: "manual",
            message: phoneError,
          });
          return;
        }

        const payload = {
          ...values,
          supervisor_contact: extractNumericPhone(
            values.supervisor_contact?.toString() || "",
          ),
        };

        const params = {
          employee_profile_id,
          payload,
          ...(isEdit &&
            workExperienceData?.id && { id: workExperienceData.id }),
        };

        mutation.mutate(params);
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Failed to submit form");
      }
    },
    [form, isEdit, workExperienceData?.id, employee_profile_id, mutation],
  );

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    mutation.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button
            variant={buttonVariant}
            className={cn(buttonVariant === "outline" && "bg-white")}
          >
            <Plus /> Add Work Experience
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Work Experience" : "Add Work Experience"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="company" label="Company" required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <InputForm
                  name="initial_position"
                  label="Initial Position"
                  required
                />
                <InputForm
                  name="final_position"
                  label="Final Position"
                  required
                />
              </div>
              <InputForm name="supervisor" label="Supervisor" required />
              <PhoneInput
                name="supervisor_contact"
                label="Supervisor Contact Person"
                required
                disabled={mutation.isPending}
                form={form}
              />
              <TextAreaForm
                name="company_address"
                label="Company Address"
                required
                className="md:col-span-2"
                disabled={mutation.isPending}
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <DatePicker label="Date of Joining" name="start_date" />
                <DatePicker label="Date of Resignation" name="end_date" />
              </div>
              <InputForm
                name="last_salary"
                label="Last Salary"
                required
                type="number"
                disabled={mutation.isPending}
              />
              <TextAreaForm
                name="reason_for_resign"
                label="Reason of Resignation"
                required
                className="md:col-span-2"
                disabled={mutation.isPending}
              />
            </div>

            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm mt-2">
                <p>Please fix the following errors:</p>
                <ul className="list-disc ml-4">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field}>
                        {field}: {error?.message}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {mutation.isError && (
              <div className="text-red-500 text-sm mt-2">
                Error:{" "}
                {mutation.error?.message || "Failed to save work experience"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

const SectionHeader = ({ withAddButton, employee_profile_id }: Props) => (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      Work Experience
    </h2>
    {withAddButton && (
      <WorkExperienceFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const WorkExperienceSection = React.memo<Props>(
  function WorkExperienceSection({
    withAddButton = false,
    employee_profile_id,
  }) {
    const queryClient = useQueryClient();
    const [editingWorkExperience, setEditingWorkExperience] =
      React.useState<IResponseWorkExperience | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const { data, isLoading } = useQuery({
      queryKey: employee_profile_id
        ? ["work-experiences", employee_profile_id]
        : ["work-experiences"],
      queryFn: () => getWorkExperiences({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!employee_profile_id,
    });

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) =>
        deleteWorkExperience({ id, employee_profile_id }),
      onSuccess: (_, variables) => {
        toast.success("Work experience deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: ["work-experiences", employee_profile_id || ""],
        });
      },
      onError: (error: any) => {
        console.error("Delete mutation error:", error);
        toast.error(
          `Failed to delete work experience: ${
            error?.response?.data?.message || error.message || "Unknown error"
          }`,
        );
      },
    });

    const handleEdit = (workExperience: IResponseWorkExperience) => {
      setEditingWorkExperience(workExperience);
      setIsEditModalOpen(true);
    };

    const handleDelete = (workExperienceId: number) => {
      if (
        window.confirm("Are you sure you want to delete this work experience?")
      ) {
        deleteMutation.mutate({ id: workExperienceId });
      }
    };

    const handleFormSuccess = () => {
      setIsEditModalOpen(false);
      setEditingWorkExperience(null);
    };

    const columns: ColumnDef<IResponseWorkExperience>[] = React.useMemo(
      () => [
        {
          accessorKey: "company",
          header: "Company",
        },
        {
          accessorKey: "initial_position",
          header: "Initial Position",
        },
        {
          accessorKey: "final_position",
          header: "Final Position",
        },
        {
          accessorKey: "supervisor",
          header: "Supervision",
        },
        {
          accessorKey: "supervisor_contact",
          header: "Supervisor Contact",
          cell: ({ row }) => {
            const phone = row.original.supervisor_contact;
            return (
              <span>{phone ? formatPhoneNumber(phone.toString()) : "-"}</span>
            );
          },
        },
        {
          accessorKey: "company_address",
          header: "Company Address",
        },
        {
          accessorKey: "start_date",
          header: "Join Date",
          cell: ({ row }) => (
            <span>{dayjs(row.original.start_date).format("LL")}</span>
          ),
        },
        {
          accessorKey: "end_date",
          header: "Resign Date",
          cell: ({ row }) => (
            <span>{dayjs(row.original.end_date).format("LL")}</span>
          ),
        },
        {
          accessorKey: "last_salary",
          header: "Last Salary",
          cell: ({ getValue }) => {
            const salary = getValue<number>();
            return rupiahFormatter(salary);
          },
        },
        {
          accessorKey: "reason_for_resign",
          header: "Reason of Resign",
        },
        {
          accessorKey: "menu",
          header: "",
          cell: ({ row }) => (
            <TableRowActions
              row={row}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ),
        },
      ],
      [],
    );

    return (
      <React.Fragment>
        <SectionHeader
          withAddButton={withAddButton}
          employee_profile_id={employee_profile_id}
        />

        {isEditModalOpen && (
          <WorkExperienceFormModal
            isEdit
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            workExperienceData={editingWorkExperience}
            employee_profile_id={employee_profile_id}
            onSuccess={handleFormSuccess}
          />
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4 items-center w-full">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-30 w-full" />
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data?.data || []}
            tableClassName="table-fixed w-full"
            tableCellClassName="w-1/9 text-clip text-balance"
            tableHeadClassName="w-1/9 text-clip text-balance"
            noDataPlaceholder={
              <div className="border border-primary-border bg-primary-background rounded-md p-2 gap-1 mx-8 flex flex-col items-center justify-center">
                <p className="text-primary font-semibold text-lg text-center">
                  Complete Work Experience Information
                </p>
                <p className="text-base text-text-secondary text-center">
                  Add the employee&apos;s previous roles, companies, and career
                  history to build a complete employment profile.
                </p>
                <WorkExperienceFormModal
                  buttonVariant="outline"
                  employee_profile_id={employee_profile_id}
                />
              </div>
            }
          />
        )}
        <Separator className="my-6" />
      </React.Fragment>
    );
  },
);
