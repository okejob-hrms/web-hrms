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
import { postCreateEducation } from "@/services/employees/educations";
import {
  educationFormScheme,
  IEducationForm,
  IEducationResponse,
} from "@/services/employees/educations/types";
import { getProfile } from "@/services/profile";
import { TextAreaForm } from "@/components/ui/textarea";

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
  },
  {
    accessorKey: "graduation_date",
    header: "Graduate Date",
  },
];

const data: IEducationResponse[] = [
  // {
  //   name: "Rina Dewi",
  //   relationship: "Spouse",
  //   placeOfBirth: "Bandung",
  //   bornDate: "1988-05-22",
  //   education: "Bachelor",
  //   email: "rina@example.com",
  //   phoneNumber: "081234567890",
  //   occupation: "Doctor",
  //   company: "RS Harapan Bunda",
  // },
  // {
  //   name: "Arka Pratama",
  //   relationship: "Son",
  //   placeOfBirth: "Jakarta",
  //   bornDate: "2015-11-03",
  //   education: "Elementary",
  //   email: "arka@example.com",
  //   phoneNumber: "081234567891",
  //   occupation: "Student",
  //   company: "-",
  // },
];

interface Props {
  withAddButton?: boolean;
}

export const AddNonFormalEducationFormModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["non-formal-education"],
    queryFn: getProfile,
  });

  const form = useForm<IEducationForm>({
    resolver: zodResolver(educationFormScheme),
    defaultValues: {
      category: "non_formal",
      institution: "",
      major: "",
      location: "",
      start_date: "",
      graduation_date: "",
      gpa: 0,
      notes: "",
    },
  });

  const addFormalEducation = useMutation({
    mutationFn: (params: {
      employee_profile_id: number;
      payload: IEducationForm;
    }) => postCreateEducation(params),
    onSuccess: () => {
      toast.success("Formal Education added successfully!");

      queryClient.invalidateQueries({ queryKey: ["formal education"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add formal education information: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IEducationForm) => {
    if (profile?.data.user.id) {
      const params = {
        employee_profile_id: profile?.data.user.id,
        payload: values,
      };

      addFormalEducation.mutate(params);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addFormalEducation.reset();
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

const SectionHeader = ({ withAddButton }: Pick<Props, "withAddButton">) => (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      Non Formal Education
    </h2>
    {withAddButton && <AddNonFormalEducationFormModal />}
  </div>
);

export const NonFormalEducationSection = React.memo<Props>(
  function NonFormalEducationSection({ withAddButton = false }) {
    return (
      <React.Fragment>
        <SectionHeader withAddButton={withAddButton} />
        <DataTable
          columns={columns}
          data={data}
          tableClassName="table-fixed w-full"
          tableCellClassName="w-1/9 text-clip text-balance"
          tableHeadClassName="w-1/9 text-clip text-balance"
        />
        <Separator className="my-6" />
      </React.Fragment>
    );
  },
);
