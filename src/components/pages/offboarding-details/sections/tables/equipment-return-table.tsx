/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { Skeleton } from "@/components/ui/skeleton";
import { TextAreaForm } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  deleteHandoverAssetsReturn,
  getHandoverAssetsReturn,
  storeEquipmentFacilityHandover,
} from "@/services/employees/offboardings/handover-and-assets";
import {
  IEquipmentFacilityHandoverRequest,
  IWorkAndHandoverResponse,
} from "@/services/employees/offboardings/handover-and-assets/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DeleteDialog from "../modals/delete-modal";

interface TableProps {
  offboarding_id: number;
}

interface FormModalProps {
  offboarding_id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormModal = React.memo(function FormModal({
  offboarding_id,
  open,
  onOpenChange,
}: FormModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<IEquipmentFacilityHandoverRequest>({
    defaultValues: {
      category: "equipment",
      name: "",
      notes: "",
      status: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IEquipmentFacilityHandoverRequest) =>
      storeEquipmentFacilityHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success("Equipment handover created successfully");
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["equipment-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create equipment handover");
    },
  });

  const handleSubmit = (values: IEquipmentFacilityHandoverRequest) => {
    mutation.mutate({
      ...values,
      category: "equipment",
    });
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white md:min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Work Equipment Return</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputForm label="Work Equipment" required name="name" />
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

export const EquipmentReturnTable = React.memo(function EquipmentReturnTable({
  offboarding_id,
}: TableProps) {
  const [selectedItem, setSelectedItem] =
    React.useState<IWorkAndHandoverResponse | null>(null);
  const [isFormModalOpen, setFormModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: offboarding_id
      ? ["equipment-handover", offboarding_id]
      : ["equipment-handover"],
    queryFn: () =>
      getHandoverAssetsReturn({ offboarding_id, category: "equipment" }),
    retry: (failureCount, error: any) => {
      console.error("Query error:", error);
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!offboarding_id,
  });

  const deleteMutation = useMutation({
    mutationFn: (params: {
      handover_item_id: number;
      offboarding_id: number;
    }) => deleteHandoverAssetsReturn(params),
    onSuccess: () => {
      toast.success("Equipment handover deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["equipment-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete equipment handover");
    },
  });

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;

    const params = {
      handover_item_id: selectedItem.id,
      offboarding_id,
    };
    deleteMutation.mutate(params);
  };

  const handleOpenDeleteDialog = (item: IWorkAndHandoverResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenEditDialog = (item: IWorkAndHandoverResponse) => {
    setOpenDropdownId(null);
    // TODO: Implement edit functionality
    console.log("Edit item:", item);
  };

  const columns: ColumnDef<IWorkAndHandoverResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Work Equipment",
        size: 250,
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className={cn(
                "text-center text-xs rounded-full px-1.5 py-1 w-fit",
                item.status === 3 || item.status === 6
                  ? "bg-success-background text-success-hover"
                  : item.status === 1 || item.status === 2 || item.status === 5
                    ? "bg-warning-background text-warning-hover"
                    : "bg-error-background text-error-hover",
              )}
            >
              {item.status_label}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "received_at",
        header: "Received Date",
        cell: ({ row }) => {
          return <span>{row.original.received_at ?? "-"}</span>;
        },
        size: 150,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu
              open={openDropdownId === item.id}
              onOpenChange={(open) => setOpenDropdownId(open ? item.id : null)}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleOpenDeleteDialog(item);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleOpenEditDialog(item);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 80,
      },
    ],
    [openDropdownId],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h4 className="font-semibold text-lg">Work Equipment Return</h4>
        <Button className="w-fit" onClick={() => setFormModalOpen(true)}>
          Add <Plus className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 items-center w-full">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-30 w-full" />
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <DataTable
            columns={columns}
            data={(data?.data as unknown as IWorkAndHandoverResponse[]) || []}
            tableClassName="min-w-full"
            customSize
          />
        </div>
      )}

      <FormModal
        offboarding_id={offboarding_id}
        open={isFormModalOpen}
        onOpenChange={setFormModalOpen}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleCloseDeleteDialog}
        onDelete={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
});
