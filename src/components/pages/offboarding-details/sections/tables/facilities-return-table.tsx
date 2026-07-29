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
  updateEquipmentFacilityHandover,
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
import { useTranslations } from "next-intl";
import {
  resolveOffboardingEquipmentStatusKey,
  translateOffboardingHandoverStatus,
  translateOffboardingHandoverStatusLabel,
} from "@/lib/i18n/status";

interface TableProps {
  offboarding_id: number;
  readOnly?: boolean;
}

interface FormModalProps {
  offboarding_id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: IWorkAndHandoverResponse | null;
}

export const FormModal = React.memo(function FormModal({
  editData,
  offboarding_id,
  open,
  onOpenChange,
}: FormModalProps) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const queryClient = useQueryClient();
  const isEditMode = !!editData;

  const form = useForm<IEquipmentFacilityHandoverRequest>({
    defaultValues: {
      category: "facility",
      name: "",
      notes: "",
      status: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: IEquipmentFacilityHandoverRequest) =>
      storeEquipmentFacilityHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success(t("facilityReturnCreated"));
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["facility-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("facilityReturnCreateFailed"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IEquipmentFacilityHandoverRequest) =>
      updateEquipmentFacilityHandover(offboarding_id, data, editData!.id),
    onSuccess: () => {
      toast.success(t("facilityReturnUpdated"));
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["facility-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("facilityReturnUpdateFailed"));
    },
  });

  const handleSubmit = (values: IEquipmentFacilityHandoverRequest) => {
    const payload = {
      ...values,
      status: Number(values.status),
    };
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (open && editData) {
      form.reset({
        category: "facility",
        name: editData.name || "",
        notes: editData.notes || "",
        status: editData.status || 1,
      });
    } else if (open) {
      form.reset({
        category: "facility",
        name: "",
        notes: "",
        status: 1,
      });
    }
  }, [open, editData, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const facilityStatusOptions = React.useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => ({
        value: String(value),
        label: translateOffboardingHandoverStatus(
          resolveOffboardingEquipmentStatusKey(value),
          t,
          tStatus,
        ),
      })),
    [t, tStatus],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white md:min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? t("editFacilitiesReturn") : t("addFacilitiesReturn")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputForm label={t("facilityName")} name="name" required />
            <TextAreaForm label={tCommon("notes")} name="notes" required />
            <SelectForm
              name="status"
              label={tCommon("status")}
              required
              options={facilityStatusOptions}
            />
            <DialogFooter className="flex flex-col sm:flex-row md:gap-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isPending ? tCommon("saving") : tCommon("save")}
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
  readOnly = false,
}: TableProps) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const [selectedItem, setSelectedItem] =
    React.useState<IWorkAndHandoverResponse | null>(null);
  const [isFormModalOpen, setFormModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editItem, setEditItem] =
    React.useState<IWorkAndHandoverResponse | null>(null);
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(
    null,
  );
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: (params: {
      handover_item_id: number;
      offboarding_id: number;
    }) => deleteHandoverAssetsReturn(params),
    onSuccess: () => {
      toast.success(t("facilityReturnDeleted"));
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["facility-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("facilityReturnDeleteFailed"));
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
    setEditItem(item);
    setFormModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = (open: boolean) => {
    if (!open) {
      setEditItem(null);
    }
    setFormModalOpen(open);
  };

  const columns: ColumnDef<IWorkAndHandoverResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("facilityName"),
        cell: ({ row }) => (
          <div className="min-w-[150px] max-w-[300px] break-words">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: tCommon("notes"),
        cell: ({ row }) => (
          <div className="min-w-[150px] max-w-[300px] break-words">
            {row.original.notes}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className={cn(
                "text-center text-xs rounded-full px-1.5 py-1 w-fit truncate",
                item.status === 3 || item.status === 6
                  ? "bg-success-background text-success-hover"
                  : item.status === 1 || item.status === 2 || item.status === 5
                    ? "bg-warning-background text-warning-hover"
                    : "bg-error-background text-error-hover",
              )}
            >
              {translateOffboardingHandoverStatusLabel(
                item.status,
                item.status_label,
                resolveOffboardingEquipmentStatusKey,
                t,
                tStatus,
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "received_at",
        header: t("receivedDate"),
        cell: ({ row }) => {
          return (
            <div className="min-w-[100px]">
              <span className="text-sm">{row.original.received_at ?? "-"}</span>
            </div>
          );
        },
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
                  <span className="sr-only">{t("openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white min-w-[120px]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleOpenEditDialog(item);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{tCommon("edit")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleOpenDeleteDialog(item);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{tCommon("delete")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 80,
      },
    ],
    [openDropdownId, t, tCommon, tStatus],
  );

  const visibleColumns = React.useMemo(
    () =>
      readOnly ? columns.filter((column) => column.id !== "actions") : columns,
    [columns, readOnly],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h4 className="font-semibold text-lg sm:text-xl">{t("facilitiesReturnTitle")}</h4>
        {!readOnly && (
          <Button
            className="w-full sm:w-fit flex items-center justify-center gap-2"
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 items-center w-full">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <DataTable
            columns={visibleColumns}
            data={(data?.data as unknown as IWorkAndHandoverResponse[]) || []}
            tableClassName="min-w-full"
            customSize
          />
        </div>
      )}

      {!readOnly && (
        <>
          <FormModal
            offboarding_id={offboarding_id}
            open={isFormModalOpen}
            onOpenChange={handleCloseFormModal}
            editData={editItem}
          />

          <DeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={handleCloseDeleteDialog}
            onDelete={handleDeleteConfirm}
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </div>
  );
});
