/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
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
import { SelectForm } from "@/components/ui/select-form";
import { Skeleton } from "@/components/ui/skeleton";
import { TextAreaForm } from "@/components/ui/textarea";
import {
  getHandoverAssetsReturn,
  storeEquipmentFacilityHandover,
} from "@/services/employees/offboardings/handover-and-assets";
import {
  IEquipmentFacilityHandoverRequest,
  IWorkAndHandoverResponse,
} from "@/services/employees/offboardings/handover-and-assets/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TableProps {
  offboarding_id: number;
}

interface FormModalProps {
  offboarding_id: number;
}

export const FormModal = React.memo(function FormModal({
  offboarding_id,
}: FormModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm<IEquipmentFacilityHandoverRequest>({
    defaultValues: {
      category: "facility",
      name: "",
      notes: "",
      status: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IEquipmentFacilityHandoverRequest) =>
      storeEquipmentFacilityHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success("Facility return created successfully");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["facility-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create facility return");
    },
  });

  const handleSubmit = (values: IEquipmentFacilityHandoverRequest) => {
    mutation.mutate({
      ...values,
      category: "facility",
    });
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          Add <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Facilities Return</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputForm label="Facility Name" name="name" required />
            <TextAreaForm label="Notes" name="notes" required />
            <SelectForm
              name="status"
              label="Status"
              required
              options={[
                { label: "Pending", value: "1" },
                { label: "Waiting Approval", value: "2" },
                { label: "Received", value: "3" },
                { label: "Rejected", value: "4" },
                { label: "Awaiting Return", value: "5" },
                { label: "Returned", value: "6" },
                { label: "Lost", value: "7" },
                { label: "Damaged", value: "8" },
                { label: "Cancelled", value: "9" },
              ]}
            />
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
                type="submit"
                disabled={mutation.isPending || !form.formState.isValid}
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export const FacilitiesReturnTable = React.memo(function FacilitiesReturnTable({
  offboarding_id,
}: TableProps) {
  const { data, isLoading } = useQuery({
    queryKey: offboarding_id
      ? ["facility-handover", offboarding_id]
      : ["facility-handover"],
    queryFn: () =>
      getHandoverAssetsReturn({ offboarding_id, category: "facility" }),
    retry: (failureCount, error: any) => {
      console.error("Query error:", error);
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!offboarding_id,
  });

  const columns: ColumnDef<IWorkAndHandoverResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Facility Name",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusMap: { [key: number]: string } = {
            1: "Pending",
            2: "Waiting Approval",
            3: "Received",
            4: "Rejected",
            5: "Awaiting Return",
            6: "Returned",
            7: "Lost",
            8: "Damaged",
            9: "Cancelled",
          };
          return (
            <span>{statusMap[row.original.status] || row.original.status}</span>
          );
        },
      },
      {
        accessorKey: "received_at",
        header: "Received Date",
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h4 className="font-semibold text-lg">Facilities Return</h4>
        <FormModal offboarding_id={offboarding_id} />
      </div>
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
          data={data?.data.data || []}
          tableClassName="table-fixed w-full"
          tableCellClassName="w-1/9 text-clip text-balance"
          tableHeadClassName="w-1/9 text-clip text-balance"
        />
      )}
    </div>
  );
});
