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

export const AddContactReferenceModal = ({
  employee_profile_id = 1,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { setValue, watch } = useFormContext();
  const watchedContactReferences = watch("contact_refferences");

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
      employee_profile_id: number;
      payload: IContactReferenceForm;
    }) => postCreateContactReference(params),
    onSuccess: (res) => {
      toast.success("Contact reference added successfully!");
      setValue(
        "contact_refferences",
        watchedContactReferences
          ? [...watchedContactReferences, { id: res.data.id }]
          : { id: res.data.id },
      );
      queryClient.invalidateQueries({ queryKey: ["contact-references"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add contact reference information: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IContactReferenceForm) => {
    const params = {
      employee_profile_id,
      payload: {
        ...values,
        phone: convertPhoneToNumber(values.phone),
      },
    };

    addContactReferenceMutation.mutate(params);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addContactReferenceMutation.reset();
  };

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

            {addContactReferenceMutation.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {addContactReferenceMutation.error?.message ||
                  "Failed to save Contact reference information"}
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
                disabled={addContactReferenceMutation.isPending}
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
  function ContactOfReferenceSection({
    withAddButton,
    employee_profile_id = 1,
  }) {
    const { data, isLoading, error } = useQuery({
      queryKey: ["contact-references", employee_profile_id],
      queryFn: () => getContactReferences({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) {
          return false;
        }
        return failureCount < 3;
      },
    });

    if (error) {
      toast.error("Error fetching contact reference data");
    }

    return (
      <React.Fragment>
        <SectionHeader withAddButton={withAddButton} />
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
            data={data?.data.data}
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
