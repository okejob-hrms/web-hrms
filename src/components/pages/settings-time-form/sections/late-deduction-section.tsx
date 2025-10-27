import DataTable from "@/components/tables/data-table";
import { RowActions } from "@/components/tables/row-actions";
import { Button } from "@/components/ui/button";
import { LateDeductions } from "@/services/settings/types";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useLateDeduction } from "../../settings-time-list/hook";
import LateDeductionForm from "../../settings-time-list/section/form-modal";
import LateDeductionDelete from "../../settings-time-list/section/delete-modal";

export const LateDeduction = () => {
  const {
    lateDeductionData,
    handleEdit,
    handleDeleteClick,
    handleAdd,
    open,
    setOpen,
    setOpenDelete,
    selectedData,
    handleCloseLateDeduction,
    loadingSave,
    openDelete,
    handleDeleteConfirm,
  } = useLateDeduction();

  const lateDeductionColumn: ColumnDef<LateDeductions>[] = [
    {
      accessorKey: "duration_type_label",
      header: "Late Duration",
      size: 160,
      cell: ({ row }) => {
        const { duration_type_label, min_minutes } = row.original;
        return `${duration_type_label} ${min_minutes}`;
      },
    },
    {
      accessorKey: "shift",
      header: "Impacted Shift",
      size: 200,
      cell: ({ row }) => {
        const shifts = row.original.shift ?? [];
        return shifts.map((s) => s.name).join(", ") || "-";
      },
    },
    {
      accessorKey: "payroll_amount_formatted",
      header: "Payroll Impact",
      size: 200,
    },
    { accessorKey: "leave_impact_label", header: "Leave Impact", size: 160 },
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                handleEdit(item);
              }}
              onDelete={() => {
                handleDeleteClick(item);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mt-5 flex justify-between items-center">
        <p className="text-base text-black font-semibold">
          Late Deduction Rules
        </p>
        <Button
          className="flex flex-row gap-6"
          onClick={() => handleAdd()}
          type="button"
        >
          <Plus />
          Add Late Deduction
        </Button>
      </div>
      <DataTable
        columns={lateDeductionColumn}
        data={lateDeductionData?.data || []}
      />
      <LateDeductionForm
        open={open}
        onOpenChange={setOpen}
        initialData={selectedData}
        handleClose={handleCloseLateDeduction}
        isLoading={loadingSave}
      />
      <LateDeductionDelete
        open={openDelete}
        onOpenChange={setOpenDelete}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};
