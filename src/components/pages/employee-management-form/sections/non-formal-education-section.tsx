/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Plus } from "lucide-react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  getEducations,
  postCreateEducation,
  putUpdateEducation,
  deleteEducation,
} from "@/services/employees/educations";
import {
  IEducationResponse,
  INonFormalEducationForm,
  nonFormalEducationFormScheme,
} from "@/services/employees/educations/types";
import { TextAreaForm } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

interface TableRowActionsProps {
  row: any;
  onEdit: (education: IEducationResponse) => void;
  onDelete: (educationId: number) => void;
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

interface NonFormalEducationFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  educationData?: IEducationResponse | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
}

const NonFormalEducationFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  educationData,
  employee_profile_id,
  onSuccess,
}: NonFormalEducationFormModalProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { setValue, watch } = formContext || {};
  const watchedEducations = watch ? watch("educations") : null;

  const form = useForm<INonFormalEducationForm>({
    resolver: zodResolver(nonFormalEducationFormScheme),
    defaultValues: {
      category: "non_formal",
      institution: "",
      location: "",
      start_date: new Date(),
      graduation_date: new Date(),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (isEdit && educationData && open) {
      form.reset({
        category: "non_formal",
        institution: educationData.institution || "",
        location: educationData.location || "",
        start_date: educationData.start_date
          ? new Date(educationData.start_date)
          : new Date(),
        graduation_date: educationData.graduation_date
          ? new Date(educationData.graduation_date)
          : new Date(),
        notes: educationData.notes || "",
      });
    }
  }, [isEdit, educationData, open, form]);

  const mutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: INonFormalEducationForm;
      id?: number;
    }) => (isEdit ? putUpdateEducation(params) : postCreateEducation(params)),
    onSuccess: (res) => {
      toast.success(
        `Non-formal education ${isEdit ? "updated" : "added"} successfully!`,
      );

      if (setValue && watchedEducations) {
        if (isEdit) {
          const updatedEducations = watchedEducations.map(
            (e: IEducationResponse) =>
              e.id === educationData?.id ? res.data : e,
          );
          setValue("educations", updatedEducations);
        } else {
          const updatedEducations = Array.isArray(watchedEducations)
            ? [...watchedEducations, res.data]
            : [res.data];
          setValue("educations", updatedEducations);
        }
      }

      const queryKey = ["non-formal-educations", employee_profile_id || ""];
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
              data: oldData.data.data.map((e: IEducationResponse) =>
                e.id === educationData?.id ? res.data : e,
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

      queryClient.invalidateQueries({ queryKey: ["non-formal-educations"] });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(
        `Failed to ${isEdit ? "update" : "add"} non-formal education: ${
          error?.response?.data?.message || error.message || "Unknown error"
        }`,
      );
    },
  });

  const onSubmit = React.useCallback(
    async (values: INonFormalEducationForm) => {
      try {
        const payload = {
          ...values,
        };

        const params = {
          employee_profile_id,
          payload,
          ...(isEdit && educationData?.id && { id: educationData.id }),
        };

        mutation.mutate(params);
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Failed to submit form");
      }
    },
    [],
  );

  const handleUpdateEducation = React.useCallback(
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
            <Plus /> Add Non Formal Education
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Non Formal Education" : "Add Non Formal Education"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                name="institution"
                label="School"
                required
                disabled={mutation.isPending}
              />
              <InputForm
                name="location"
                label="Location"
                required
                disabled={mutation.isPending}
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <DatePicker name="start_date" label="Start Date" />
                <DatePicker name="graduation_date" label="Graduation Date" />
              </div>
              <TextAreaForm
                name="notes"
                label="Notes"
                required
                className="col-start-1 col-span-2"
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
                {mutation.error?.message ||
                  "Failed to save non-formal education"}
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
                onClick={handleUpdateEducation}
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
      Non Formal Education
    </h2>
    {withAddButton && (
      <NonFormalEducationFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const NonFormalEducationSection = React.memo<Props>(
  function NonFormalEducationSection({
    withAddButton = false,
    employee_profile_id,
  }) {
    const formContext = useFormContext();
    const queryClient = useQueryClient();
    const [editingEducation, setEditingEducation] =
      React.useState<IEducationResponse | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const watchedEducations = formContext
      ? formContext.watch("educations")
      : null;

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) =>
        deleteEducation({ id, employee_profile_id }),
      onSuccess: (_, variables) => {
        toast.success("Non-formal education deleted successfully!");
        if (formContext?.setValue && watchedEducations) {
          const updatedEducations = watchedEducations.filter(
            (e: IEducationResponse) => e.id !== variables.id,
          );
          formContext.setValue("educations", updatedEducations);
        }
        const queryKey = ["non-formal-educations", employee_profile_id || ""];
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                (e: IEducationResponse) => e.id !== variables.id,
              ),
              total: oldData.data.total - 1,
            },
          };
        });

        queryClient.invalidateQueries({ queryKey: ["non-formal-educations"] });
      },
      onError: (error: any) => {
        console.error("Delete mutation error:", error);
        toast.error(
          `Failed to delete non-formal education: ${
            error?.response?.data?.message || error.message || "Unknown error"
          }`,
        );
      },
    });

    const { data, isLoading } = useQuery({
      queryKey: employee_profile_id
        ? ["non-formal-educations", employee_profile_id]
        : ["non-formal-educations"],
      queryFn: () => getEducations({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!employee_profile_id,
    });

    const apiEducations =
      data?.data?.data?.filter((item) => item.category === "non_formal") || [];
    const watchedNonFormalEducations = Array.isArray(watchedEducations)
      ? watchedEducations.filter((item) => item.category === "non_formal")
      : [];

    const returnedData =
      apiEducations.length > 0 ? apiEducations : watchedNonFormalEducations;

    const handleEdit = (education: IEducationResponse) => {
      setEditingEducation(education);
      setIsEditModalOpen(true);
    };

    const handleDelete = (educationId: number) => {
      if (
        window.confirm(
          "Are you sure you want to delete this non-formal education?",
        )
      ) {
        deleteMutation.mutate({ id: educationId });
      }
    };

    const handleFormSuccess = () => {
      setIsEditModalOpen(false);
      setEditingEducation(null);
    };

    const columns: ColumnDef<IEducationResponse>[] = React.useMemo(
      () => [
        {
          accessorKey: "institution",
          header: "Institution",
        },
        {
          accessorKey: "location",
          header: "Location",
        },
        {
          accessorKey: "notes",
          header: "Notes",
        },
        {
          accessorKey: "start_date",
          header: "Start Date",
          cell: ({ row }) => (
            <span>{dayjs(row.original.start_date).format("LL")}</span>
          ),
        },
        {
          accessorKey: "graduation_date",
          header: "Graduate Date",
          cell: ({ row }) => (
            <span>{dayjs(row.original.graduation_date).format("LL")}</span>
          ),
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
          <NonFormalEducationFormModal
            isEdit
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            educationData={editingEducation}
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
