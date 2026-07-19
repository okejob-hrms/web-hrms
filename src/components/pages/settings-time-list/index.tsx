"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Icon } from "@/components/ui/icon";
import { Edit3, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAttendance, useLateDeduction, WorkingHour } from "./hook";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LateDeductions } from "@/services/settings/types";
import { RowActions } from "@/components/tables/row-actions";
import LateDeductionForm from "./section/form-modal";
import LateDeductionDelete from "./section/delete-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Can } from "@/components/auth/can";

export default function SettingsAttendanceConfiguration() {
  const router = useRouter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const {
    lateDeductionData,
    handleEdit,
    handleDeleteClick,
    handleAdd,
    open,
    setOpen,
    selectedData,
    handleCloseLateDeduction,
    loadingSave,
    openDelete,
    setOpenDelete,
    handleDeleteConfirm,
    branches,
  } = useLateDeduction();

  const { data, isLoading, isError, setSelectedBranch, selectedBranch } =
    useAttendance();

  React.useEffect(() => {
    if (!selectedBranch && branches.length > 0) {
      setSelectedBranch(String(branches[0].id));
    }
  }, [branches, selectedBranch, setSelectedBranch]);

  if (isLoading) return <p>{tCommon("loading")}</p>;
  if (isError) return <p>{tCommon("errorLoading")}</p>;

  if (!data) return <p>{tCommon("noData")}</p>;

  const { workingHours, late_tolerance, max_late_tolerance } = data;

  // =======================
  // Table Columns
  // =======================
  const columns: ColumnDef<WorkingHour>[] = [
    {
      id: "day",
      header: tCommon("day"),
      size: 160,
      cell: ({ row, table }) => {
        const day = row.original.day;
        const allRows = table.getRowModel().rows;
        const sameDayRows = allRows.filter((r) => r.original.day === day);
        const firstRowId = sameDayRows[0].id;
        // Return only content: DataTable wraps in TableCell + div; raw <td> would cause invalid nesting (div > td).
        if (row.id === firstRowId) {
          return day;
        }
        return null;
      },
    },
    { accessorKey: "shift", header: t("shift"), size: 160 },
    { accessorKey: "workingHours", header: t("workingHoursLabel"), size: 200 },
    { accessorKey: "break", header: t("break"), size: 160 },
  ];

  const lateDeductionColumn: ColumnDef<LateDeductions>[] = [
    {
      accessorKey: "duration_type_label",
      header: t("lateDuration"),
      size: 160,
      cell: ({ row }) => {
        const { duration_type_label, min_minutes } = row.original;
        return `${duration_type_label} ${min_minutes}`;
      },
    },
    {
      accessorKey: "shift",
      header: t("impactedShift"),
      size: 200,
      cell: ({ row }) => {
        const shifts = row.original.shift ?? [];
        return shifts.map((s) => s.name).join(", ") || "-";
      },
    },
    {
      accessorKey: "payroll_amount_formatted",
      header: t("payrollImpact"),
      size: 200,
    },
    { accessorKey: "leave_impact_label", header: t("leaveImpact"), size: 160 },
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
              editPermission="time_attendance.attendance_configuration.edit"
              deletePermission="time_attendance.attendance_configuration.delete"
            />
          </div>
        );
      },
    },
  ];

  const goToEdit = () => {
    localStorage.setItem("dataBranch", JSON.stringify(data));
    localStorage.setItem("branch", JSON.stringify(selectedBranch));
    router.push("/settings/time-attendance/attendance-configuration/edit");
  };

  const WorkingHour = () => {
    return (
      <div className="space-y-4">
        <div className="mt-5 flex justify-end">
          <Can permission="time_attendance.attendance_configuration.edit">
            <Button
              variant="outline"
              className="flex flex-row gap-6"
              onClick={() => goToEdit()}
            >
              <Edit3 />
              {t("editAttendanceConfig")}
            </Button>
          </Can>
        </div>

        <DataTable columns={columns} data={workingHours} />

        <div className="font-bold text-md mt-5">
          {t("gracePeriod")}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="text-gray-500">{t("gracePeriodTolerance")}</div>
            <div className="text-gray-500">
              {late_tolerance ?? "-"} {t("minutes")}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-500">{t("absentAfter")}</div>
            <div className="text-gray-500">
              {t("minutesAfterStartShift", {
                minutes: max_late_tolerance ?? "-",
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LateDeduction = () => {
    return (
      <div className="space-y-4">
        <div className="mt-5 flex justify-end">
          <Can permission="time_attendance.attendance_configuration.create">
            <Button
              variant="outline"
              className="flex flex-row gap-6"
              onClick={() => handleAdd()}
            >
              <Plus />
              {t("addLateDeduction")}
            </Button>
          </Can>
        </div>
        <DataTable
          columns={lateDeductionColumn}
          data={lateDeductionData?.data || []}
        />
      </div>
    );
  };

  const tabs = [
    {
      name: t("workingHours"),
      value: "working-hours",
      content: <WorkingHour />,
      icon: <Icon name="userSolid" size={18} color="currentColor" />,
    },
    {
      name: t("lateDeductionRules"),
      value: "late-deduction-rules",
      content: <LateDeduction />,
      icon: <Icon name="documentOutlined" size={18} color="currentColor" />,
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
            <h2 className="font-semibold text-xl">{t("attendanceConfiguration")}</h2>
            <div className="flex gap-5 items-center">
              <div className="tex-gray-500">{t("branchLabel")}</div>
              <Select
                onValueChange={(val) => setSelectedBranch(val)}
                value={String(selectedBranch)}
                defaultValue={String(selectedBranch)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectBranch")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((item, i) => (
                    <SelectItem value={String(item.id)} key={i}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <>
            <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
              <TabsList className="p-1 w-full bg-secondary-background min-h-12">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "px-2.5 sm:px-3 text-secondary-hover",
                      "data-[state=active]:bg-secondary data-[state=active]:text-white",
                    )}
                  >
                    <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                      {tab.icon} {tab.name}
                    </code>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>

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
              // isLoading={isLoading}
            />
          </>
        </div>
      </div>
    </div>
  );
}
