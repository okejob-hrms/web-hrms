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
import WorkHandoverFormModal from "./work-handover-modal";
import { useESS } from "@/components/pages/ess/hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IHandoverItemRequest, IHandoverRequest } from "@/services/form/types";
import { toast } from "sonner";
import { HandoverItem } from "@/services/offboarding-employee/types";
import { deleteHandoverItem, submitHandover } from "@/services/offboarding-employee";
import DeleteHandoverDialog from "./delete-handover-modal";

export default function WorkHandover() {

  const { 
    setOpenFormModal, 
    openFormModal, 
    employees, 
    isLoadingEmployees,
    searchEmployee,
    setSearchEmployee,
    handoverItems,
    handoverLoading
  } = useESS();

  const { offboardingData } = useESS();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: IHandoverItemRequest) => submitHandover(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboardingStatus"] });
      queryClient.invalidateQueries({ queryKey: ["offboardingProgress"] });
      queryClient.invalidateQueries({ queryKey: ["handoverItems", "work"] });
      
      toast.success(`Handover item ${selectedHandover?.id ? 'updated' : 'added'} successfully`);
      setOpenFormModal(false);
    },
    onError: (error: any) => {
      toast.error("Failed to submit handover");
    }
  });

  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteHandoverItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoverItems", "work"] });
      queryClient.invalidateQueries({ queryKey: ["offboardingProgress"] });
      toast.success("Handover item deleted successfully");
      setOpenDeleteModal(false);
    },
    onError: () => toast.error("Failed to delete item"),
  });

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDeleteModal(true);
  };

  const [selectedHandover, setSelectedHandover] = React.useState<any | null>(null);

  const employeesOptions = React.useMemo(() => {
    return employees?.data?.data?.map((emp: any) => ({
      label: emp.name,
      value: emp.user_id.toString(),
      image: emp.image_url
    })) || [];
  }, [employees]);

  const handleAdd = () => {
    setSelectedHandover(null);
    setOpenFormModal(true);
  };

  const handleEdit = (data: HandoverItem) => {
    setSelectedHandover({
      id: data.id,
      works: data.name || "",
      handover_to_user_ids: data.recipients?.map((r) => r.user_id.toString()) || [], // The API uses 'recipients'
    });
    setOpenFormModal(true);
  };

  const handleSubmit = (data: { works: string; handover_to_user_ids: string[] }) => {
    const request: IHandoverItemRequest = {
      id: selectedHandover?.id || null, 
      category: "work",
      name: data.works,
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
        accessorKey: "name", // Matches "Project Alpha Documentation asd"
        header: "Works",
        size: 250,
      },
      {
        id: "handover_to",
        header: "Handed Over To",
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
        header: "Status",
        size: 160,
        cell: ({ row }) => {
          const status = row.original.status;
          const label = row.original.status_label;
          const { variant, className } = getStatusOvertime(status);

          return (
            <Badge variant={variant} className={className}>
              {label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Update",
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{dayjs(row.original.updated_at).format("MMMM D, YYYY")}</span>
            <span className="text-sm text-text-disabled">
              {dayjs(row.original.updated_at).format("HH:mm")}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => confirmDelete(row.original.id)}>
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">Work & Responsibility Handover</h2>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={handoverItems} 
            loading={handoverLoading} 
          />

          <WorkHandoverFormModal
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
