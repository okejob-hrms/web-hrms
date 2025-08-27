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
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  getEducations,
  postCreateEducation,
} from "@/services/employees/educations";
import {
  IEducationResponse,
  INonFormalEducationForm,
  nonFormalEducationFormScheme,
} from "@/services/employees/educations/types";
import { TextAreaForm } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const columns: ColumnDef<IEducationResponse>[] = [
  {
    accessorKey: "instution",
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
];

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const AddNonFormalEducationFormModal = ({
  employee_profile_id = 1,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

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

  const addNonFormalEducation = useMutation({
    mutationFn: (params: {
      employee_profile_id: number;
      payload: INonFormalEducationForm;
    }) => postCreateEducation(params),
    onSuccess: () => {
      toast.success("Non formal Education added successfully!");

      queryClient.invalidateQueries({ queryKey: ["non-formal-educations"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add non formal education information: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: INonFormalEducationForm) => {
    const params = {
      employee_profile_id,
      payload: values,
    };

    addNonFormalEducation.mutate(params);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addNonFormalEducation.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Non Formal Education
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white min-w-7xl">
        <DialogHeader>
          <DialogTitle>Add Non Formal Education</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="institution" label="School" required />
              <InputForm name="location" label="Location" required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <DatePicker name="start_date" label="Start Date" />
                <DatePicker name="graduation_date" label="Graduation Date" />
              </div>
              <TextAreaForm
                name="notes"
                label="Notes"
                required
                className="col-start-1 col-span-2"
              />
            </div>

            {addNonFormalEducation.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {addNonFormalEducation.error?.message ||
                  "Failed to save non formal education information"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addNonFormalEducation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addNonFormalEducation.isPending}>
                {addNonFormalEducation.isPending ? "Saving..." : "Save"}
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
      Non Formal Education
    </h2>
    {withAddButton && (
      <AddNonFormalEducationFormModal
        employee_profile_id={employee_profile_id}
      />
    )}
  </div>
);

export const NonFormalEducationSection = React.memo<Props>(
  function NonFormalEducationSection({
    withAddButton = false,
    employee_profile_id = 1,
  }) {
    const { data, isLoading, error } = useQuery({
      queryKey: ["non-formal-educations", employee_profile_id],
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
