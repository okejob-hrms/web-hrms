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
import { useForm, useFormContext } from "react-hook-form";
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

dayjs.extend(localizedFormat);

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

interface WorkExperienceFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  workExperienceData?: IResponseWorkExperience | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
}

const WorkExperienceFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  workExperienceData,
  employee_profile_id,
  onSuccess,
}: WorkExperienceFormModalProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { setValue, watch } = formContext || {};
  const watchedWorkExperiences = watch ? watch("work_experiences") : null;

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
    onSuccess: (res) => {
      toast.success(
        `Work experience ${isEdit ? "updated" : "added"} successfully!`,
      );

      if (setValue && watchedWorkExperiences) {
        if (isEdit) {
          const updatedWorkExperiences = watchedWorkExperiences.map(
            (w: IResponseWorkExperience) =>
              w.id === workExperienceData?.id ? res.data : w,
          );
          setValue("work_experiences", updatedWorkExperiences);
        } else {
          const updatedWorkExperiences = Array.isArray(watchedWorkExperiences)
            ? [...watchedWorkExperiences, res.data]
            : [res.data];
          setValue("work_experiences", updatedWorkExperiences);
        }
      }

      const queryKey = ["work-experiences", employee_profile_id || ""];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) {
          return {
            data: {
              data: [res.data],
              total: 1,
              page: 1,
              per_page: 10,
            },
          };
        }

        if (isEdit) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map((w: IResponseWorkExperience) =>
                w.id === workExperienceData?.id ? res.data : w,
              ),
            },
          };
        } else {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [...(oldData.data.data || []), res.data],
              total: (oldData.data.total || 0) + 1,
            },
          };
        }
      });

      queryClient.invalidateQueries({ queryKey: ["work-experiences"] });
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

  const onSubmit = React.useCallback(async (values: IWorkExperienceForm) => {
    try {
      const payload = {
        ...values,
      };

      const params = {
        employee_profile_id,
        payload,
        ...(isEdit && workExperienceData?.id && { id: workExperienceData.id }),
      };

      mutation.mutate(params);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit form");
    }
  }, []);

  const handleUpdateEmployee = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const isValid = await form.trigger();
      const formData = form.getValues();

      console.log("# ERROR EDIT ", form.formState.errors);

      if (!isValid) {
        console.log("Form validation failed");
        return;
      }
      onSubmit(formData);
    },
    [form, onSubmit],
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
          <Button>
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
              <InputForm
                name="supervisor_contact"
                label="Supervisor Contact Person"
                required
                disabled={mutation.isPending}
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
              <Button
                onClick={handleUpdateEmployee}
                // disabled={mutation.isPending || !form.formState.isValid}
              >
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
    const formContext = useFormContext();
    const queryClient = useQueryClient();
    const [editingWorkExperience, setEditingWorkExperience] =
      React.useState<IResponseWorkExperience | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const watchedWorkExperiences = formContext
      ? formContext.watch("work_experiences")
      : null;

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) =>
        deleteWorkExperience({ id, employee_profile_id }),
      onSuccess: (_, variables) => {
        toast.success("Work experience deleted successfully!");
        if (formContext?.setValue && watchedWorkExperiences) {
          const updatedWorkExperiences = watchedWorkExperiences.filter(
            (w: IResponseWorkExperience) => w.id !== variables.id,
          );
          formContext.setValue("work_experiences", updatedWorkExperiences);
        }
        const queryKey = ["work-experiences", employee_profile_id || ""];
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                (w: IResponseWorkExperience) => w.id !== variables.id,
              ),
              total: oldData.data.total - 1,
            },
          };
        });

        queryClient.invalidateQueries({ queryKey: ["work-experiences"] });
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

    const returnedData = data?.data?.data || watchedWorkExperiences;

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
            data={returnedData || []}
            tableClassName="table-fixed w-full"
            tableCellClassName="w-1/9 text-clip text-balance"
            tableHeadClassName="w-1/9 text-clip text-balance"
          />
        )}
        <Separator className="my-6" />
      </React.Fragment>
    );
  },
);
