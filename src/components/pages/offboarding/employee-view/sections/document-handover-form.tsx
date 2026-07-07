"use client";

import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Ellipsis, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { getStatusOvertime } from "@/lib/helpers";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { useESS } from "@/components/pages/ess/hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DocumentHandoverFormModal from "./document-handover-modal";
import { IHandoverItemRequest, IHandoverRequest } from "@/services/form/types";
import { deleteHandoverItem, submitHandover } from "@/services/offboarding-employee";
import { HandoverItem } from "@/services/offboarding-employee/types";
import DeleteHandoverDialog from "./delete-handover-modal";
import { useTranslations } from "next-intl";
import {
  resolveOffboardingRecipientStatusKey,
  translateOffboardingHandoverStatusLabel,
} from "@/lib/i18n/status";

export default function DocumentHandover() {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const queryClient = useQueryClient();
  const { 
    offboardingData, 
    openFormModal, 
    setOpenFormModal, 
    employees, 
    searchEmployee, 
    setSearchEmployee,
    documentHandovers,
    documentHandoverLoading
  } = useESS();

  const [selectedHandover, setSelectedHandover] = React.useState<any | null>(null);

  const employeesOptions = React.useMemo(() => {
    return employees?.data?.data?.map((emp: any) => ({
      label: emp.name,
      value: emp.user_id.toString(),
      subtitle: emp.job_title?.name || tCommon("employee"),
      image: emp.image_url
    })) || [];
  }, [employees, tCommon]);

  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteHandoverItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoverItems", "document"] });
      queryClient.invalidateQueries({ queryKey: ["offboardingProgress"] });
      toast.success(t("handoverItemDeleted"));
      setOpenDeleteModal(false);
    },
    onError: () => toast.error(t("handoverItemDeleteFailed")),
  });

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDeleteModal(true);
  };

  const mutation = useMutation({
    mutationFn: (request: IHandoverItemRequest) => 
      submitHandover(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboardingStatus"] });
      queryClient.invalidateQueries({ queryKey: ["offboardingProgress"] });
      queryClient.invalidateQueries({ queryKey: ["handoverItems", "document"] });
      toast.success(t("documentHandoverSaved"));
      setOpenFormModal(false);
    },
    onError: () => toast.error(t("documentHandoverSubmitFailed")),
  });

  const handleAdd = () => {
    setSelectedHandover(null);
    setOpenFormModal(true);
  };

  const handleEdit = (data: HandoverItem) => {
    setSelectedHandover({
      id: data.id,
      document: data.name || "",
      handover_to_user_ids: data.recipients?.map((r) => r.user_id.toString()) || [], // The API uses 'recipients'
    });
    setOpenFormModal(true);
  };

  const handleSubmit = (data: { document: string; handover_to_user_ids: string[] }) => {
    const request: IHandoverItemRequest = {
      id: selectedHandover?.id || null,
      category: "document",
      name: data.document,
      recipients: data.handover_to_user_ids.map((id) => ({
        user_id: parseInt(id),
        status: 1,
      })),
    };
    mutation.mutate(request);
  };

  const columns: ColumnDef<HandoverItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("documentName"),
        size: 200,
      },
      {
        id: "handover_to",
        header: t("handedOverTo"),
        cell: ({ row }) => {
          const recipients = row.original.recipients || [];
          
          return (
            <div className="flex -space-x-2 overflow-hidden">
              {recipients.map((recipient, i) => (
                <Avatar key={i} className="inline-block h-8 w-8 ring-2 ring-white">
                  <AvatarFallback>{stringAvatar(recipient.user.name)}</AvatarFallback>
                </Avatar>
              ))}
              {recipients.length > 3 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-xs font-medium ring-2 ring-white">
                  +{recipients.length - 3}
                </div>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
        size: 160,
        cell: ({ row }) => {
          const status = row.original.status;
          const label = row.original.status_label;
          const { variant, className } = getStatusOvertime(status);

          return (
            <Badge variant={variant} className={className}>
              {translateOffboardingHandoverStatusLabel(
                status,
                label,
                resolveOffboardingRecipientStatusKey,
                t,
                tStatus,
              )}
            </Badge>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: t("lastUpdate"),
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{dayjs(row.original.updated_at).format("MMMM D, YYYY")}</span>
            <span className="text-sm text-text-disabled">{dayjs(row.original.updated_at).format("HH:mm")}</span>
          </div>
        ),
      },
      {
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded"><Ellipsis className="text-grayscale-30" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}><Edit3 className="w-4 h-4 mr-2" /> {tCommon("edit")}</DropdownMenuItem>
               <DropdownMenuItem onClick={() => confirmDelete(row.original.id)}>
              <Trash className="w-4 h-4 mr-2" /> {tCommon("delete")}
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tCommon, tStatus],
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">{t("documentHandoverTitle")}</h2>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> {tCommon("add")}
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={documentHandovers} 
            loading={documentHandoverLoading} 
          />

          <DocumentHandoverFormModal
            open={openFormModal}
            onOpenChange={setOpenFormModal}
            onSubmit={handleSubmit}
            initialData={selectedHandover}
            employeesOptions={employeesOptions}
            searchEmployee={searchEmployee}
            setSearchEmployee={setSearchEmployee}
            isSubmitting={mutation.isPending}
          />

          <DeleteHandoverDialog
            open={openDeleteModal}
            onOpenChange={setOpenDeleteModal}
            onDelete={() => deleteId && deleteMutation.mutate(deleteId)}
            isLoading={deleteMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}