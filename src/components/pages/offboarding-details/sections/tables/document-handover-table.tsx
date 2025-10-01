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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, stringAvatar } from "@/lib/utils";
import { getEmployeeDetail, getEmployees } from "@/services/employees";
import {
  deleteHandoverAssetsReturn,
  getHandoverAssetsReturn,
  storeWorkDocumentHandover,
} from "@/services/employees/offboardings/handover-and-assets";
import {
  IWorkAndHandoverResponse,
  IWorkDocumentHandoverRequest,
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

const EmployeeProfile = React.memo(function EmployeeProfile({
  userId,
}: {
  userId: number;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee-detail", userId],
    queryFn: () => getEmployeeDetail(userId),
  });

  if (isLoading) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (isError || !data?.data?.user?.name) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex gap-1 items-center">
      <Avatar className="h-5 w-5">
        <AvatarImage
          className="size-5"
          src={`${process.env.NEXT_PUBLIC_FILE_URL}/${data.data.photo_profile}`}
          alt={data.data.user.name}
        />
        <AvatarFallback className="text-[10px] font-medium">
          {stringAvatar(data.data.user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-black">{data.data.user.name}</span>
      <span className="text-text-disabled">
        ({data.data.user.id}){data.data.employment.job_position.name}
      </span>
    </div>
  );
});

const RecipientsList = React.memo(function RecipientsList({
  recipients,
}: {
  recipients: Array<{ id: number; user_id: number }>;
}) {
  return (
    <div className="space-y-1">
      {recipients.map((item) => (
        <div key={item.id} className="block">
          <EmployeeProfile userId={item.user_id} />
        </div>
      ))}
    </div>
  );
});

export const FormModal = React.memo(function FormModal({
  offboarding_id,
  open,
  onOpenChange,
}: FormModalProps) {
  const queryClient = useQueryClient();
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const debouncedEmployee = useDebounce(searchEmployee, 300);

  const form = useForm<IWorkDocumentHandoverRequest>({
    defaultValues: {
      category: "document",
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

  const mutation = useMutation({
    mutationFn: (data: IWorkDocumentHandoverRequest) =>
      storeWorkDocumentHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success("Document handover created successfully");
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["document-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create document handover");
    },
  });

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.user_id.toString(),
      }));
    }
    return [];
  }, [employees?.data]);

  const handleSubmit = (values: IWorkDocumentHandoverRequest) => {
    mutation.mutate({
      ...values,
      recipients: values.recipients.map((item) => ({
        user_id: item as unknown as number,
        status: 1,
      })),
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
          <DialogTitle>Document Handover</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputForm label="Document Name" name="name" required />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Handed Over To<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="recipients"
                maxCount={3}
                searchPlaceholder="Search Employee"
                hideSelectAll
                disabled={isLoadingEmployees}
                valueTransformer={(value) => Number(value)}
                searchValue={searchEmployee}
                onSearchChange={setSearchEmployee}
              />
            </div>
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

export const DocumentHandoverTable = React.memo(function DocumentHandoverTable({
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
      ? ["document-handover", offboarding_id]
      : ["document-handover"],
    queryFn: () =>
      getHandoverAssetsReturn({ offboarding_id, category: "document" }),
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
      toast.success("Document handover deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["document-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete document handover");
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
    setOpenDropdownId(null); // Close dropdown when opening dialog
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenEditDialog = (item: IWorkAndHandoverResponse) => {
    setOpenDropdownId(null); // Close dropdown when opening edit
    // TODO: Implement edit functionality
    console.log("Edit item:", item);
  };

  const columns: ColumnDef<IWorkAndHandoverResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Document Name",
        size: 300,
      },
      {
        accessorKey: "recipients",
        header: "Handed Over To",
        cell: ({ row }) => {
          return <RecipientsList recipients={row.original.recipients} />;
        },
        size: 400,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return (
            <div className="space-y-1">
              {row.original.recipients.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "text-center text-xs rounded-full px-1.5 py-1",
                    item.status === 3 || item.status === 6
                      ? "bg-success-background text-success-hover"
                      : item.status === 1 ||
                          item.status === 2 ||
                          item.status === 5
                        ? "bg-warning-background text-warning-hover"
                        : "bg-error-background text-error-hover",
                  )}
                >
                  {item.status_label}
                </div>
              ))}
            </div>
          );
        },
        size: 200,
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
        <h4 className="font-semibold text-lg">Document Handover</h4>
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
