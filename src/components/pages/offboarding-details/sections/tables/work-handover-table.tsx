/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { TextAreaForm } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, stringAvatar } from "@/lib/utils";
import { getEmployeeDetailByUserId, getEmployees } from "@/services/employees";
import {
  deleteHandoverAssetsReturn,
  getHandoverAssetsReturn,
  storeWorkDocumentHandover,
  updateWorkDocumentHandover,
} from "@/services/employees/offboardings/handover-and-assets";
import {
  IWorkAndHandoverResponse,
  IWorkDocumentHandoverRequest,
  WorkRecipient,
} from "@/services/employees/offboardings/handover-and-assets/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DeleteDialog from "../modals/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiErrorResponse } from "@/lib/types";
import { useTranslations } from "next-intl";
import {
  resolveOffboardingRecipientStatusKey,
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

const EmployeeProfile = React.memo(function EmployeeProfile({
  userId,
}: {
  userId: number;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee-detail", userId],
    queryFn: () => getEmployeeDetailByUserId(userId),
  });

  if (isLoading) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (isError || !data?.data?.user?.name) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex gap-1 items-center min-w-0">
      <Avatar className="h-5 w-5 flex-shrink-0">
        <AvatarImage
          className="size-5"
          src={`${process.env.NEXT_PUBLIC_FILE_URL}/${data.data.photo_profile}`}
          alt={data.data.user.name}
        />
        <AvatarFallback className="text-[10px] font-medium">
          {stringAvatar(data.data.user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
        <span className="text-black truncate text-sm sm:text-base">
          {data.data.user.name}
        </span>
        <span className="text-text-disabled text-xs sm:text-sm truncate">
          ({data.data.code}){" "}
          {data.data.employment?.job_position?.name ?? ""}
        </span>
      </div>
    </div>
  );
});

const RecipientsList = React.memo(function RecipientsList({
  recipients,
}: {
  recipients: WorkRecipient[];
}) {
  return (
    <div className="space-y-2">
      {recipients.map((item) => (
        <div key={item.id} className="block">
          <EmployeeProfile userId={item.user_id} />
        </div>
      ))}
    </div>
  );
});

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
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const [defaultRecipients, setDefaultRecipients] = React.useState<string[]>(
    [],
  );
  const [selectedRecipients, setSelectedRecipients] = React.useState<
    WorkRecipient[]
  >([]);
  const debouncedEmployee = useDebounce(searchEmployee, 300);
  const isEditMode = !!editData;

  const form = useForm<IWorkDocumentHandoverRequest>({
    defaultValues: {
      category: "work",
      name: "",
      recipients: [],
    },
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["offboarding-employees", debouncedEmployee],
    queryFn: () =>
      getEmployees(debouncedEmployee ? { search: debouncedEmployee } : {}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: IWorkDocumentHandoverRequest) =>
      storeWorkDocumentHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success(t("workHandoverCreated"));
      form.reset();
      setSelectedRecipients([]);
      setDefaultRecipients([]);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["work-handover"] });
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(
                errorData.message || t("workHandoverCreateFailed"),
              );
            })
            .catch(() => {
              toast.error(t("workHandoverServerError"));
            });
        } catch (parseError) {
          toast.error(t("workHandoverServerError"));
        }
      } else {
        toast.error(
          `${t("workHandoverCreateFailed")}: ${error.message || t("unknownError")}`,
        );
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IWorkDocumentHandoverRequest) =>
      updateWorkDocumentHandover(offboarding_id, data, editData!.id),
    onSuccess: () => {
      toast.success(t("workHandoverUpdated"));
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["work-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("workHandoverUpdateFailed"));
    },
  });

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data
        .filter((item) => item.user_id != null)
        .map((item) => ({
          label: item.name,
          value: item.user_id.toString(),
        }));
    }
    return [];
  }, [employees?.data]);

  const buildRecipientsPayload = () => {
    if (selectedRecipients && selectedRecipients.length > 0) {
      return selectedRecipients.map((r) => ({
        user_id: r.user_id,
        status: r.status || 1,
      }));
    }

    const valuesRecipients = form.getValues("recipients") || [];
    return valuesRecipients.map((id: any) => ({
      user_id: Number(id),
      status: 1,
    }));
  };

  const handleSubmit = (values: IWorkDocumentHandoverRequest) => {
    const payload = {
      ...values,
      recipients: buildRecipientsPayload(),
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
      const ids = editData.recipients.map((r) => r.user_id);
      form.reset({
        category: "work",
        name: editData.name || "",
        recipients: ids as any,
      });
      setSelectedRecipients(editData.recipients);
      setDefaultRecipients(ids.map(String));
    } else if (open) {
      form.reset({
        category: "work",
        name: "",
        recipients: [],
      });
      setSelectedRecipients([]);
      setDefaultRecipients([]);
    }
  }, [open, editData, form]);

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "recipients") {
        const newIds = (value.recipients as number[]) || [];

        setSelectedRecipients((prev) => {
          const prevIds = prev.map((r) => r.user_id);
          const addedIds = newIds.filter((id) => !prevIds.includes(id));
          const removedIds = prevIds.filter((id) => !newIds.includes(id));
          const updated = prev.filter((r) => !removedIds.includes(r.user_id));
          const newRecipients = addedIds.map((id) => ({
            id: 0,
            user_id: id,
            status: 1,
            status_label: t("waitingApproval"),
          }));

          return [...updated, ...newRecipients];
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, t]);

  const recipientStatusOptions = React.useMemo(
    () => [
      {
        value: "1",
        label: translateOffboardingHandoverStatus(
          "waitingApproval",
          t,
          tStatus,
        ),
      },
      {
        value: "2",
        label: translateOffboardingHandoverStatus("received", t, tStatus),
      },
      {
        value: "3",
        label: translateOffboardingHandoverStatus("rejected", t, tStatus),
      },
    ],
    [t, tStatus],
  );

  const handleRemove = React.useCallback(
    (userId: number) => {
      setSelectedRecipients((prev) =>
        prev.filter((recipient) => recipient.user_id !== userId),
      );
      const current = form.getValues("recipients") || [];
      const newRecipients = current.filter((id) => Number(id) !== userId);
      form.setValue("recipients", newRecipients, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      form.trigger("recipients");
      setDefaultRecipients((prev) =>
        prev.filter((id) => Number(id) !== userId),
      );
    },
    [form],
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white md:min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? t("editWorkHandover") : t("addWorkHandover")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4 p-1"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <TextAreaForm
              label={t("works")}
              name="name"
              required
              className="min-h-[100px]"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                {t("handedOverTo")}
                <span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="recipients"
                maxCount={3}
                searchPlaceholder={tCommon("searchEmployee")}
                hideSelectAll
                disabled={isLoadingEmployees}
                valueTransformer={(value) => Number(value)}
                searchValue={searchEmployee}
                onSearchChange={setSearchEmployee}
                defaultValue={defaultRecipients}
              />
            </div>
            <div className="flex flex-col w-full space-y-3">
              {selectedRecipients &&
                selectedRecipients.map((item) => (
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-1 pb-2 border-b-2"
                    key={item.user_id}
                  >
                    <div className="flex-1 min-w-0">
                      <EmployeeProfile userId={item.user_id} />
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <Select
                        value={item.status?.toString() || "1"}
                        onValueChange={(value) => {
                          setSelectedRecipients((prev) =>
                            prev.map((recipient) =>
                              recipient.user_id === item.user_id
                                ? { ...recipient, status: Number(value) }
                                : recipient,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder={t("selectStatus")} />
                        </SelectTrigger>
                        <SelectContent>
                          {recipientStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.user_id)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Image
                          src="/icons/deleteOutlined.svg"
                          width={16}
                          height={16}
                          alt={tCommon("delete")}
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
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

export const WorkHandoverTable = React.memo(function WorkHandoverTable({
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

  const deleteMutation = useMutation({
    mutationFn: (params: {
      handover_item_id: number;
      offboarding_id: number;
    }) => deleteHandoverAssetsReturn(params),
    onSuccess: () => {
      toast.success(t("workHandoverDeleted"));
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["work-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("workHandoverDeleteFailed"));
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
        header: t("works"),
        cell: ({ row }) => (
          <div className="min-w-[150px] max-w-[300px] break-words">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "recipients",
        header: t("handedOverTo"),
        cell: ({ row }) => {
          return <RecipientsList recipients={row.original.recipients} />;
        },
        size: 400,
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
        cell: ({ row }) => {
          return (
            <div className="space-y-1 min-w-[120px]">
              {row.original.recipients.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "text-center text-xs rounded-full px-1.5 py-1 truncate",
                    item.status === 2
                      ? "bg-success-background text-success-hover"
                      : item.status === 1
                        ? "bg-warning-background text-warning-hover"
                        : "bg-error-background text-error-hover",
                  )}
                >
                  {translateOffboardingHandoverStatusLabel(
                    item.status,
                    item.status_label,
                    resolveOffboardingRecipientStatusKey,
                    t,
                    tStatus,
                  )}
                </div>
              ))}
            </div>
          );
        },
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
        <h4 className="font-semibold text-lg sm:text-xl">
          {t("workHandoverTitle")}
        </h4>
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
        <DataTable
          columns={visibleColumns}
          data={(data?.data as unknown as IWorkAndHandoverResponse[]) || []}
          tableClassName="min-w-full"
          wrapperTableClassName="overflow-x-hidden"
          customSize
        />
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
