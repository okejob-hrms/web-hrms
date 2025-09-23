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
import { getHandoverAssetsReturn } from "@/services/employees/offboardings/handover-and-assets";
import { IWorkAndHandoverResponse } from "@/services/employees/offboardings/handover-and-assets/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

interface TableProps {
  offboarding_id: number;
}

export const FormModal = React.memo(function FormModal() {
  const form = useForm();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-fit">
          Add <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Work Equipment Return</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <InputForm label="Work Equipment" required name="work_equipment" />
            <TextAreaForm label="Notes" name="notes" required />
            <SelectForm
              name="status"
              label="Status"
              required
              options={[
                { label: "Received", value: "received" },
                { label: "Awaiting Return", value: "awaiting" },
              ]}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                // onClick={handleCancel}
                // disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
              // onClick={handleUpdateFamily}
              // disabled={mutation.isPending || !form.formState.isValid}
              >
                {/* {mutation.isPending ? "Saving..." : "Save"} */}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export const EquipmentReturnTable = React.memo(function EquipmentReturnTable({
  offboarding_id,
}: TableProps) {
  const { data, isLoading } = useQuery({
    queryKey: offboarding_id
      ? ["work-handover", offboarding_id]
      : ["work-handover"],
    queryFn: () =>
      getHandoverAssetsReturn({ offboarding_id, category: "work" }),
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
        header: "Works",
      },
      {
        accessorKey: "recipients",
        header: "Handed Over To",
        cell: ({ row }) => (
          <div>
            {row.original.recipients.map((item) => (
              <span key={item.id}>{item.name}</span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
        <h4 className="font-semibold text-lg">Work Equipment Return</h4>
        <FormModal />
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
