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
import { Form, FormLabel } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  getEducations,
  postCreateEducation,
} from "@/services/employees/educations";
import {
  IFormalEducationForm,
  IEducationResponse,
  formalEducationFormScheme,
} from "@/services/employees/educations/types";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const columns: ColumnDef<IEducationResponse>[] = [
  {
    accessorKey: "institution",
    header: "School",
  },
  {
    accessorKey: "major",
    header: "Major",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "start_date",
    header: "Education Start Date",
    cell: ({ row }) => (
      <span>{dayjs(row.original.start_date).format("LL")}</span>
    ),
  },
  {
    accessorKey: "graduation_date",
    header: "Graduation Date",
    cell: ({ row }) => (
      <span>{dayjs(row.original.graduation_date).format("LL")}</span>
    ),
  },
  {
    accessorKey: "gpa",
    header: "GPA",
  },
];

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const AddFormalEducationFormModal = ({
  employee_profile_id = 1,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<IFormalEducationForm>({
    resolver: zodResolver(formalEducationFormScheme),
    defaultValues: {
      category: "formal",
      institution: "",
      major: "",
      location: "",
      start_date: new Date(),
      graduation_date: new Date(),
      gpa: 0,
      max_gpa: 0,
    },
  });

  const addFormalEducation = useMutation({
    mutationFn: (params: {
      employee_profile_id: number;
      payload: IFormalEducationForm;
    }) => postCreateEducation(params),
    onSuccess: () => {
      toast.success("Formal Education added successfully!");

      queryClient.invalidateQueries({ queryKey: ["formal-educations"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add formal education information: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = async (values: IFormalEducationForm) => {
    try {
      console.log("Submitting values:", values);

      const isValid = await form.trigger();
      if (!isValid) {
        console.log("Form validation failed");
        return;
      }

      const params = {
        employee_profile_id,
        payload: values,
      };

      addFormalEducation.mutate(params);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit form");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addFormalEducation.reset();
  };

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Formal Education
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white min-w-7xl">
        <DialogHeader>
          <DialogTitle>Add Formal Education</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="institution" label="School" required />
              <InputForm name="location" label="City" required />
              <InputForm name="major" label="Major" required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <DatePicker name="start_date" label="Education Start Date" />
                <DatePicker name="graduation_date" label="Graduation Date" />
              </div>
              <div className="grid gap-2 w-full">
                <FormLabel className="text-sm font-normal">
                  GPA
                  <span className="text-error">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 w-full">
                  <InputForm name="gpa" required type="number" />
                  <span className="text-text-disabled">/</span>
                  <InputForm name="max_gpa" type="number" required />
                </div>
              </div>
            </div>

            {addFormalEducation.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {addFormalEducation.error?.message ||
                  "Failed to save formal education information"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addFormalEducation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addFormalEducation.isPending}>
                {addFormalEducation.isPending ? "Saving..." : "Save"}
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
      Formal Education
    </h2>
    {withAddButton && (
      <AddFormalEducationFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const FormalEducationSection = React.memo<Props>(
  function FormalEducationSection({
    withAddButton = false,
    employee_profile_id = 1,
  }) {
    const { data, isLoading, error } = useQuery({
      queryKey: ["formal-educations", employee_profile_id],
      queryFn: () => getEducations({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) {
          return false;
        }
        return failureCount < 3;
      },
    });

    if (error) {
      toast.error("Error fetching educations data");
    }
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
