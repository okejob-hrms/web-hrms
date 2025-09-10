/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  getContactReferences,
  postCreateContactReference,
  putUpdateContactReference,
  deleteContactReference,
} from "@/services/employees/contact-references";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContactReferenceFormSchema,
  IContactReferenceForm,
  IContactReferenceResponse,
} from "@/services/employees/contact-references/types";
import { PhoneInput } from "@/components/ui/phone-input";
import { convertPhoneToNumber } from "@/lib/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TableRowActionsProps {
  row: any;
  onEdit: (contactReference: IContactReferenceResponse) => void;
  onDelete: (contactReferenceId: number) => void;
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

interface ContactReferenceFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contactReferenceData?: IContactReferenceResponse | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
  buttonVariant?: "outline" | "default";
}

const ContactReferenceFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  contactReferenceData,
  employee_profile_id,
  onSuccess,
  buttonVariant = "default",
}: ContactReferenceFormModalProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { setValue, watch } = formContext || {};
  const watchedContactReferences = watch ? watch("contact_refferences") : null;
  const employeeProfileIdRef = React.useRef(employee_profile_id);

  React.useEffect(() => {
    if (employee_profile_id && typeof employee_profile_id === "number") {
      employeeProfileIdRef.current = employee_profile_id;
    }
  }, [employee_profile_id]);

  const form = useForm<IContactReferenceForm>({
    resolver: zodResolver(ContactReferenceFormSchema),
    defaultValues: {
      name: "",
      relationship: "",
      email: "",
      occupation: "",
      company: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (isEdit && contactReferenceData && open) {
      form.reset({
        name: contactReferenceData.name || "",
        relationship: contactReferenceData.relationship || "",
        email: contactReferenceData.email || "",
        occupation: contactReferenceData.occupation || "",
        company: contactReferenceData.company || "",
        phone: contactReferenceData.phone || "",
      });
    }
  }, [isEdit, contactReferenceData, open, form]);

  const mutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IContactReferenceForm;
      id?: number;
    }) => {
      const finalEmployeeProfileId =
        params.employee_profile_id || employeeProfileIdRef.current;

      if (!finalEmployeeProfileId) {
        throw new Error("employee_profile_id is required but not available");
      }

      return isEdit
        ? putUpdateContactReference({
            ...params,
            employee_profile_id: finalEmployeeProfileId,
          })
        : postCreateContactReference({
            ...params,
            employee_profile_id: finalEmployeeProfileId,
          });
    },
    onSuccess: (res) => {
      toast.success(
        `Contact reference ${isEdit ? "updated" : "added"} successfully!`,
      );

      if (setValue && watchedContactReferences) {
        if (isEdit) {
          const updatedContactReferences = watchedContactReferences.map(
            (c: IContactReferenceResponse) =>
              c.id === contactReferenceData?.id ? res.data : c,
          );
          setValue("contact_refferences", updatedContactReferences);
        } else {
          const updatedContactReferences = Array.isArray(
            watchedContactReferences,
          )
            ? [...watchedContactReferences, res.data]
            : [res.data];
          setValue("contact_refferences", updatedContactReferences);
        }
      }

      const finalEmployeeProfileId =
        employee_profile_id || employeeProfileIdRef.current;
      const queryKey = ["contact_refferences", finalEmployeeProfileId || ""];
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
              data: oldData.data.data.map((c: IContactReferenceResponse) =>
                c.id === contactReferenceData?.id ? res.data : c,
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

      queryClient.invalidateQueries({ queryKey: ["contact_refferences"] });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(
        `Failed to ${isEdit ? "update" : "add"} contact reference: ${
          error?.response?.data?.message || error.message || "Unknown error"
        }`,
      );
    },
  });

  const onSubmit = React.useCallback(
    async (values: IContactReferenceForm) => {
      try {
        const finalEmployeeProfileId =
          employee_profile_id || employeeProfileIdRef.current;

        if (!finalEmployeeProfileId) {
          toast.error("Employee profile ID is required");
          return;
        }

        const payload = {
          ...values,
          phone: values.phone
            ? convertPhoneToNumber(values.phone)
            : values.phone,
        };

        const params = {
          employee_profile_id: finalEmployeeProfileId,
          payload,
          ...(isEdit &&
            contactReferenceData?.id && { id: contactReferenceData.id }),
        };

        mutation.mutate(params);
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Failed to submit form");
      }
    },
    [employee_profile_id, isEdit, contactReferenceData?.id, mutation],
  );

  const handleUpdateContactReference = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const isValid = await form.trigger();
      const formData = form.getValues();

      if (!isValid) {
        console.log("Form validation failed");
        return;
      }
      onSubmit(formData);
    },
    [form, onSubmit, employee_profile_id],
  );

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    mutation.reset();
  };

  if (!employee_profile_id && !employeeProfileIdRef.current) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button
            variant={buttonVariant}
            className={cn(buttonVariant === "outline" && "bg-white")}
          >
            <Plus /> Add Contact Reference
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Contact Reference" : "Add Contact Reference"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="name" label="Name" required />
              <InputForm name="relationship" label="Relationship" required />
              <InputForm name="email" label="Email" type="email" required />
              <PhoneInput name="phone" label="Phone Number" />
              <InputForm name="occupation" label="Occupation" required />
              <InputForm name="company" label="Company" required />
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
                {mutation.error?.message || "Failed to save contact reference"}
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
                onClick={handleUpdateContactReference}
                disabled={mutation.isPending}
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
      Contact Reference
    </h2>
    {withAddButton && (
      <ContactReferenceFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const ContactOfReferenceSection = React.memo<Props>(
  function ContactOfReferenceSection({ withAddButton, employee_profile_id }) {
    const formContext = useFormContext();
    const queryClient = useQueryClient();
    const [editingContactReference, setEditingContactReference] =
      React.useState<IContactReferenceResponse | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const watchedContactReferences = formContext
      ? formContext.watch("contact_refferences")
      : null;

    const employeeProfileIdRef = React.useRef(employee_profile_id);

    React.useEffect(() => {
      if (employee_profile_id && typeof employee_profile_id === "number") {
        employeeProfileIdRef.current = employee_profile_id;
      }
    }, [employee_profile_id]);

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) => {
        const finalEmployeeProfileId =
          employee_profile_id || employeeProfileIdRef.current;
        return deleteContactReference({
          id,
          employee_profile_id: finalEmployeeProfileId,
        });
      },
      onSuccess: (_, variables) => {
        toast.success("Contact reference deleted successfully!");
        if (formContext?.setValue && watchedContactReferences) {
          const updatedContactReferences = watchedContactReferences.filter(
            (c: IContactReferenceResponse) => c.id !== variables.id,
          );
          formContext.setValue("contact_refferences", updatedContactReferences);
        }
        const finalEmployeeProfileId =
          employee_profile_id || employeeProfileIdRef.current;
        const queryKey = ["contact_refferences", finalEmployeeProfileId || ""];
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                (c: IContactReferenceResponse) => c.id !== variables.id,
              ),
              total: oldData.data.total - 1,
            },
          };
        });

        queryClient.invalidateQueries({ queryKey: ["contact_refferences"] });
      },
      onError: (error: any) => {
        console.error("Delete mutation error:", error);
        toast.error(
          `Failed to delete contact reference: ${
            error?.response?.data?.message || error.message || "Unknown error"
          }`,
        );
      },
    });

    const finalEmployeeProfileId =
      employee_profile_id || employeeProfileIdRef.current;

    const { data, isLoading } = useQuery({
      queryKey: finalEmployeeProfileId
        ? ["contact_refferences", finalEmployeeProfileId]
        : ["contact_refferences"],
      queryFn: () => {
        return getContactReferences({
          employee_profile_id: finalEmployeeProfileId,
        });
      },
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!finalEmployeeProfileId,
    });

    const returnedData = data?.data?.data || watchedContactReferences;

    const handleEdit = (contactReference: IContactReferenceResponse) => {
      setEditingContactReference(contactReference);
      setIsEditModalOpen(true);
    };

    const handleDelete = (contactReferenceId: number) => {
      if (
        window.confirm(
          "Are you sure you want to delete this contact reference?",
        )
      ) {
        deleteMutation.mutate({ id: contactReferenceId });
      }
    };

    const handleFormSuccess = () => {
      setIsEditModalOpen(false);
      setEditingContactReference(null);
    };

    const columns: ColumnDef<IContactReferenceResponse>[] = React.useMemo(
      () => [
        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "relationship",
          header: "Relationship",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
        {
          accessorKey: "phone",
          header: "Phone Number",
        },
        {
          accessorKey: "occupation",
          header: "Occupation",
        },
        {
          accessorKey: "company",
          header: "Company",
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

    if (!finalEmployeeProfileId) {
      console.warn(
        "ContactOfReferenceSection: No employee_profile_id available",
      );
      return (
        <div className="text-center text-red-500 p-4">
          Error: Employee profile ID is required to load contact references
        </div>
      );
    }

    return (
      <React.Fragment>
        <SectionHeader
          withAddButton={withAddButton}
          employee_profile_id={finalEmployeeProfileId}
        />

        {isEditModalOpen && (
          <ContactReferenceFormModal
            isEdit
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            contactReferenceData={editingContactReference}
            employee_profile_id={finalEmployeeProfileId}
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
            noDataPlaceholder={
              <div className="border border-primary-border bg-primary-background rounded-md p-2 gap-1 mx-8 flex flex-col items-center justify-center">
                <p className="text-primary font-semibold text-lg text-center">
                  Complete Contact Reference Information
                </p>
                <p className="text-base text-text-secondary text-center">
                  Add references who can validate the employee&apos;s
                  professional background and character.
                </p>
                <ContactReferenceFormModal
                  buttonVariant="outline"
                  employee_profile_id={finalEmployeeProfileId}
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
