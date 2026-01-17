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
import DocumentHandoverFormModal from "./document-handover-modal";

export default function DocumentHandover() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedHandover, setSelectedHandover] = React.useState<any | null>(null);
  const [searchEmployee, setSearchEmployee] = React.useState("");

  const employeesOptions = [
    { label: "Olivia Rhye", value: "1", subtitle: "CEO" },
    { label: "Phoenix Baker", value: "2", subtitle: "COO" },
  ];

  const handleAdd = () => {
    setSelectedHandover(null);
    setIsModalOpen(true);
  };

  const handleEdit = (data: any) => {
    setSelectedHandover({
      works: data.leave_type?.works || "",
      handover_to_user_id: data.user?.id?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    console.log("Submitted Data:", data);
    setIsModalOpen(false);
  };
  const columns: ColumnDef<any>[] = React.useMemo(
    () => [
      {
        accessorKey: "leave_type.document",
        header: "Document Name",
        size: 200,
      },
      {
        accessorKey: "user.handoverTo",
        header: "Handed Over To",
        cell: ({ row }) => {
          const handovers = row.original.handover_users || [];
          
          return (
            <div className="flex -space-x-2 overflow-hidden">
              {handovers.map((user: any, i: number) => (
                <Avatar key={i} className="inline-block h-8 w-8 ring-2 ring-white">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{stringAvatar(user.name)}</AvatarFallback>
                </Avatar>
              ))}
              {handovers.length > 3 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-xs font-medium ring-2 ring-white">
                  +{handovers.length - 3}
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
          const { variant, className, label } = getStatusOvertime(status);
          if (!row.original.status) return "-";

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
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Ellipsis className="text-grayscale-30" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
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
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <DataTable columns={columns} data={[]} />

      <DocumentHandoverFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={selectedHandover}
        employeesOptions={employeesOptions}
        searchEmployee={searchEmployee}
        setSearchEmployee={setSearchEmployee}
        isSubmitting={false}
      />
    </div>
  );
}
