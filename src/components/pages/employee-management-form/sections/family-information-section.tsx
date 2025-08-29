/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useForm } from "react-hook-form";
import {
  familyFormScheme,
  IFamilyForm,
  IFamilyResponse,
} from "@/services/employees/families/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFamilies, postCreateFamily } from "@/services/employees/families";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectForm } from "@/components/ui/select-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/ui/phone-input";
import { convertPhoneToNumber } from "@/lib/helpers";

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const columns: ColumnDef<IFamilyResponse>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "relationship",
    header: "Family Relationship",
  },
  {
    accessorKey: "place_of_birth",
    header: "Place of Birth",
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
    cell: ({ row }) => <span>{formatDate(row.getValue("date_of_birth"))}</span>,
  },
  {
    accessorKey: "highest_education",
    header: "Highest Education Level",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
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

const TABLE_CELL_CLASSES =
  "md:w-1/9 md:text-clip md:text-balance whitespace-nowrap";

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const AddFamilyFormModal = ({ employee_profile_id = 1 }: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const form = useForm<IFamilyForm>({
    resolver: zodResolver(familyFormScheme),
    defaultValues: {
      name: "",
      place_of_birth: "",
      date_of_birth: "",
      relationship: "",
      highest_education: "1",
      email: "",
      phone: "",
      occupation: "",
      company: "",
    },
  });

  const createFamilyMutation = useMutation({
    mutationFn: (params: {
      employee_profile_id: number;
      payload: IFamilyForm;
    }) => postCreateFamily(params),
    onSuccess: () => {
      toast.success("Family information added successfully!");

      queryClient.invalidateQueries({ queryKey: ["family"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add family information: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IFamilyForm) => {
    try {
      const params = {
        employee_profile_id,
        payload: {
          ...values,
          highest_education: Number(values.highest_education),
          phone: convertPhoneToNumber(values.phone)
        },
      };
      console.log(params);
      createFamilyMutation.mutate(params);
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    createFamilyMutation.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Family Information
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Family</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="name" label="Name" required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <InputForm
                  name="place_of_birth"
                  label="Place of Birth"
                  required
                />
                <DatePicker name="date_of_birth" label="Born Date" />
              </div>
              <InputForm
                name="relationship"
                label="Family Relationship"
                required
              />
              <SelectForm
                name="highest_education"
                label="Highest Education Level"
                options={[
                  { label: "Primary School", value: "1" },
                  { label: "Junior High School", value: "2" },
                  { label: "Senior High School", value: "3" },
                  { label: "Vocational High School", value: "4" },
                  { label: "Diploma (D1/D2/D3)", value: "5" },
                  { label: "Bachelor's Degree (S1)", value: "6" },
                  { label: "Master's Degree (S2)", value: "7" },
                  { label: "Doctorate (S3)", value: "8" },
                ]}
                disabled={createFamilyMutation.isPending}
                required
              />
              <InputForm name="email" label="Email" required />
              <PhoneInput
                name="phone_number"
                label="Phone Number"
                required={true}
              />
              <InputForm
                name="occupation"
                label="Occupation"
                required
                disabled={createFamilyMutation.isPending}
              />
              <InputForm
                name="company"
                label="Company"
                required
                disabled={createFamilyMutation.isPending}
              />
            </div>

            {createFamilyMutation.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {createFamilyMutation.error?.message ||
                  "Failed to save family information"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createFamilyMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createFamilyMutation.isPending}>
                {createFamilyMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const SectionHeader = ({ withAddButton, employee_profile_id = 1 }: Props) => (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      Family Information
    </h2>
    {withAddButton && (
      <AddFamilyFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const FamilyInformationSection = React.memo<Props>(
  function FamilyInformationSection({
    withAddButton = false,
    employee_profile_id = 1,
  }) {
    const {
      data: families,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["family", employee_profile_id],
      queryFn: () => getFamilies({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) {
          return false;
        }
        return failureCount < 3;
      },
    });

    if (error) {
      toast.error("Error fetching families data");
    }

    return (
      <>
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
            data={families?.data.data}
            tableClassName="table-fixed w-full"
            tableCellClassName={TABLE_CELL_CLASSES}
            tableHeadClassName={TABLE_CELL_CLASSES}
          />
        )}

        <Separator className="my-6" />
      </>
    );
  },
);
