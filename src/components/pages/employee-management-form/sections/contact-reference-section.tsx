/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
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
} from "@/services/employees/contact-references";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContactReferenceFormSchema,
  IContactReferenceForm,
  IContactReferenceResponse,
} from "@/services/employees/contact-references/types";
import { PhoneInput } from "@/components/ui/phone-input";
import { convertPhoneToNumber } from "@/lib/helpers";

export const columns: ColumnDef<IContactReferenceResponse>[] = [
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
];

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const AddContactReferenceModal = ({ employee_profile_id }: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

  const { setValue, watch } = formContext || {};
  const watchedContactReferences = watch ? watch("contact_refferences") : null;

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

  const addContactReferenceMutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IContactReferenceForm;
    }) => postCreateContactReference(params),
    onSuccess: (res) => {
      toast.success("Contact reference added successfully!");

      if (setValue) {
        const updatedReferences = Array.isArray(watchedContactReferences)
          ? [...watchedContactReferences, res.data]
          : [res.data];
        setValue("contact_refferences", updatedReferences);
      }

      const queryKey = ["contact_refferences", employee_profile_id || ""];
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

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: [...(oldData.data.data || []), res.data],
            total: (oldData.data.total || 0) + 1,
          },
        };
      });

      if (watchedContactReferences) {
        const watchedQueryKey = [
          "contact_refferences",
          watchedContactReferences,
        ];
        queryClient.setQueryData(watchedQueryKey, (oldData: any) => {
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

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [...(oldData.data.data || []), res.data],
              total: (oldData.data.total || 0) + 1,
            },
          };
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["contact_refferences"],
      });

      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(
        `Failed to add contact reference: ${error?.response?.data?.message || error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = async (values: IContactReferenceForm) => {
    try {
      const payload = {
        ...values,
        phone: values.phone ? convertPhoneToNumber(values.phone) : values.phone,
      };

      const params = {
        employee_profile_id,
        payload,
      };

      addContactReferenceMutation.mutate(params);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit form");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addContactReferenceMutation.reset();
  };

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Contact Reference
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Contact Reference</DialogTitle>
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

            {addContactReferenceMutation.isError && (
              <div className="text-red-500 text-sm mt-2">
                Error:{" "}
                {addContactReferenceMutation.error?.message ||
                  "Failed to save contact reference information"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addContactReferenceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addContactReferenceMutation.isPending ||
                  !form.formState.isValid
                }
              >
                {addContactReferenceMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

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
      <AddContactReferenceModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const ContactOfReferenceSection = React.memo<Props>(
  function ContactOfReferenceSection({ withAddButton, employee_profile_id }) {
    const formContext = useFormContext();

    const watchedContactReferences = formContext
      ? formContext.watch("contact_refferences")
      : null;
    const { data, isLoading } = useQuery({
      queryKey: employee_profile_id
        ? ["contact_refferences", employee_profile_id]
        : ["contact_refferences"],
      queryFn: () => getContactReferences({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!employee_profile_id,
    });

    const returnedData = data?.data?.data || watchedContactReferences;

    return (
      <React.Fragment>
        <SectionHeader
          withAddButton={withAddButton}
          employee_profile_id={employee_profile_id}
        />
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
