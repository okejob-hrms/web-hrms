/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getWorkExperiences,
  postCreateWorkExperience,
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

dayjs.extend(localizedFormat);

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const columns: ColumnDef<IResponseWorkExperience>[] = [
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
    cell: ({ row }) => <span>{dayjs(row.original.end_date).format("LL")}</span>,
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
];

export const AddWorkExperienceModal = ({ employee_profile_id }: Props) => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

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

  const createWorkExperienceMutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IWorkExperienceForm;
    }) => postCreateWorkExperience(params),
    onSuccess: (res) => {
      toast.success("Work experience added successfully!");

      if (setValue) {
        const updatedWorkExperiences = Array.isArray(watchedWorkExperiences)
          ? [...watchedWorkExperiences, res.data]
          : [res.data];
        setValue("work_experiences", updatedWorkExperiences);
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

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: [...(oldData.data.data || []), res.data],
            total: (oldData.data.total || 0) + 1,
          },
        };
      });

      if (watchedWorkExperiences) {
        const watchedQueryKey = ["work-experiences", watchedWorkExperiences];
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
        queryKey: ["work-experiences"],
      });

      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error.response.data);
      toast.error(
        `Failed to add work experience: ${error?.response?.data?.message || error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = async (values: IWorkExperienceForm) => {
    try {
      const payload = {
        ...values,
      };

      const params = {
        employee_profile_id,
        payload,
      };

      createWorkExperienceMutation.mutate(params);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit form");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    createWorkExperienceMutation.reset();
  };

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  React.useEffect(() => {
    console.log("Response Error", createWorkExperienceMutation.data);
  }, [createWorkExperienceMutation.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add Work Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Work Experience</DialogTitle>
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
                type="number"
                disabled={createWorkExperienceMutation.isPending}
              />
              <TextAreaForm
                name="company_address"
                label="Company Address"
                required
                className="md:col-span-2"
                disabled={createWorkExperienceMutation.isPending}
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
                disabled={createWorkExperienceMutation.isPending}
              />
              <TextAreaForm
                name="reason_for_resign"
                label="Reason of Resignation"
                required
                className="md:col-span-2"
                disabled={createWorkExperienceMutation.isPending}
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

            {createWorkExperienceMutation.isError && (
              <div className="text-red-500 text-sm mt-2">
                Error:{" "}
                {createWorkExperienceMutation.error?.message ||
                  "Failed to save work experience"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createWorkExperienceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createWorkExperienceMutation.isPending ||
                  !form.formState.isValid
                }
              >
                {createWorkExperienceMutation.isPending ? "Saving..." : "Save"}
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
      Work Experience
    </h2>
    {withAddButton && (
      <AddWorkExperienceModal employee_profile_id={employee_profile_id} />
    )}
  </div>
);

export const WorkExperienceSection = React.memo<Props>(
  function WorkExperienceSection({
    withAddButton = false,
    employee_profile_id,
  }) {
    const formContext = useFormContext();

    const watchedWorkExperiences = formContext
      ? formContext.watch("work_experiences")
      : null;

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
