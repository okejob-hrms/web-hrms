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
import { IHandoverRequest } from "@/services/form/types";
import { postSubmitHandover } from "@/services/form";

export default function DocumentHandover() {
  const queryClient = useQueryClient();
  const { 
    offboardingData, 
    openFormModal, 
    setOpenFormModal, 
    employees, 
    searchEmployee, 
    setSearchEmployee 
  } = useESS();

  const [selectedHandover, setSelectedHandover] = React.useState<any | null>(null);

  const employeesOptions = React.useMemo(() => {
    return employees?.data?.data?.map((emp: any) => ({
      label: emp.name,
      value: emp.id.toString(),
      subtitle: emp.job_title?.name || "Employee",
      image: emp.image_url
    })) || [];
  }, [employees]);

  const mutation = useMutation({
    mutationFn: (request: IHandoverRequest) => 
      postSubmitHandover(offboardingData?.id!, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboardingProgress"] });
      toast.success("Document handover added successfully");
      setOpenFormModal(false);
    },
    onError: () => toast.error("Failed to submit document handover"),
  });

  const handleAdd = () => {
    setSelectedHandover(null);
    setOpenFormModal(true);
  };

  const handleEdit = (data: any) => {
    setSelectedHandover({
      document: data.name || "",
      handover_to_user_ids: data.recipients?.map((u: any) => u.user_id.toString()) || [],
    });
    setOpenFormModal(true);
  };

  const handleSubmit = (data: { document: string; handover_to_user_ids: string[] }) => {
    const request: IHandoverRequest = {
      data: [
        {
          category: "document",
          name: data.document,
          recipients: data.handover_to_user_ids.map((id) => ({
            user_id: parseInt(id),
            status: 1, // Default status
          })),
        },
      ],
    };
    mutation.mutate(request);
  };

  const columns: ColumnDef<any>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Document Name",
        size: 200,
      },
      {
        accessorKey: "recipients",
        header: "Handed Over To",
        cell: ({ row }) => {
          const recipients = row.original.recipients || [];
          return (
            <div className="flex -space-x-2 overflow-hidden">
              {recipients.map((recipient: any, i: number) => (
                <Avatar key={i} className="inline-block h-8 w-8 ring-2 ring-white">
                  <AvatarImage src={recipient.user?.avatar_url} />
                  <AvatarFallback>{stringAvatar(recipient.user?.name || "?")}</AvatarFallback>
                </Avatar>
              ))}
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
          const { variant, className, label } = getStatusOvertime(status);
          return <Badge variant={variant} className={className}>{label}</Badge>;
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Update",
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
              <DropdownMenuItem onClick={() => handleEdit(row.original)}><Edit3 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">Document Handover</h2>
        <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>

      <DataTable columns={columns} data={[]} />

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
    </div>
  );
}