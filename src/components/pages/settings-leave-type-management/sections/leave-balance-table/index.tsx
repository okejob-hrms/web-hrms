import DataTable from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Plus } from "lucide-react";
import * as React from "react";
import { useLeaveBalanceTable } from "./hook";
import { ILeaveBalanceResponse } from "@/services/employees/leave-balances/types";

export const LeaveBalanceTable = React.memo(function LeaveBalanceTable() {
  const {
    handleEdit,
    handleNewBalance,
    leaveBalances,
    pagination,
    setPagination,
  } = useLeaveBalanceTable();
  const columns: ColumnDef<ILeaveBalanceResponse>[] = [
    {
      accessorKey: "job_level.name",
      header: "Job Level",
    },
    {
      accessorKey: "balance",
      header: "Leave Balance (Days)",
    },
    {
      accessorKey: "reset_period_day",
      header: "Reset Period",
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
          <button
            onClick={() => {
              handleEdit(row.original.id);
            }}
            className="flex gap-2"
          >
            <Edit3 />
          </button>
        );
      },
    },
  ];
  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">Leave Balance</h2>
        <Button onClick={handleNewBalance}>
          <Plus /> Set Up Leave Balance
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={leaveBalances?.data.data}
        pagination={leaveBalances?.data}
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
