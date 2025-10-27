import DataTable from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ILeaveTypeResponse } from "@/services/employees/leave-types/types";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Ellipsis, Eye, Plus } from "lucide-react";
import * as React from "react";
import { useLeaveTypeTable } from "./hook";

export const LeaveTypeTable = React.memo(function LeaveTypeTable() {
  const {
    handleEdit,
    handleDetailNavigation,
    handleNavigateAddTypePage,
    leaveTypes,
    pagination,
    setPagination,
  } = useLeaveTypeTable();

  const columns: ColumnDef<ILeaveTypeResponse>[] = [
    {
      accessorKey: "name",
      header: "Leave Name",
    },
    {
      accessorKey: "updated_at",
      header: "Last Update",
      cell: ({ row }) => row.original.updated_at || "-",
    },
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    handleDetailNavigation(row.original.id);
                  }}
                  className="flex gap-2"
                >
                  <Eye />
                  Leave Type Details
                </button>
              </DropdownMenuItem>
              <>
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      handleEdit(row.original.id);
                    }}
                    className="flex gap-2"
                  >
                    <Edit3 />
                    Edit Overtime Request
                  </button>
                </DropdownMenuItem>
              </>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">Leave Request</h2>
        <Button onClick={handleNavigateAddTypePage}>
          <Plus /> New Leave Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={leaveTypes?.data.data}
        pagination={leaveTypes?.data}
        paginationState={pagination}
        setPaginationState={setPagination}
      />

      {/* <OvertimeDetailModal
                onUpdate={() => handleApprove()}
                onReject={() => handleReject()}
                isOpen={openDetail}
                setIsOpen={(e) => setOpenDetail(e)}
                data={detail}
            />

            <OvertimeApproveModal
                onUpdate={() => handleApprove()}
                isOpen={openApprove}
                setIsOpen={(e) => setOpenApprove(e)}
            />

            <OvertimeRejectModal
                onUpdate={() => handleReject()}
                isOpen={openReject}
                setIsOpen={(e) => setOpenReject(e)}
            />

            <OvertimeDeleteModal
                onUpdate={() => handleDelete()}
                isOpen={openDelete}
                setIsOpen={(e) => setOpenDelete(e)}
            />

            <OvertimeEditModal
                onUpdate={() => handleEdit(formData)}
                isOpen={openEdit}
                setIsOpen={(e) => setOpenEdit(e)}
                data={detail}
                formData={formData}
                setFormData={setFormData}
            /> */}
    </div>
  );
});
