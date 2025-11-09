"use client";

import { Form } from "@/components/ui/form";
import * as React from "react";
import { useLeaveRequestForm } from "./hook";
import { SelectEmployeeForm, SelectForm } from "@/components/ui/select-form";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { DatePicker } from "@/components/ui/date-picker";
import { TextAreaForm } from "@/components/ui/textarea";
import { Button, UploadButton } from "@/components/ui/button";
import AppSkeleton from "@/components/partials/app-skeleton";

export const AttendanceLeaveRequestForm = React.memo(
  function AttendanceLeaveRequestForm() {
    const {
      form,
      isLoadingEmployees,
      searchApprover,
      setSearchApprover,
      employeesOptions,
      leaveTypeOptions,
      isPending,
      handleCancel,
      onSubmit,
      leaveBalance,
      valueTransformer,
      isEditMode,
      isLoadingDetail,
    } = useLeaveRequestForm();

    if (isEditMode && isLoadingDetail) {
      return <AppSkeleton />;
    }

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <Form {...form}>
          <form className="grid md:grid-cols-2 grid-cols-1 gap-4 items-center">
            <SelectEmployeeForm
              name="user_id"
              label="Employee Name"
              required
              options={employeesOptions}
              disabled={isEditMode}
            />
            <span className="text-sm text-text-secondary">
              Used Leave Balance :{" "}
              {leaveBalance?.data ? (
                <span>
                  {leaveBalance.data.time_off_used} /{" "}
                  <span className="text-text-disabled">
                    {leaveBalance.data.available_time_off} Days
                  </span>
                </span>
              ) : (
                <span>-</span>
              )}{" "}
            </span>
            <div className="flex flex-col gap-2 md:col-start-1 md:col-end-2">
              <label
                className={`text-sm font-medium ${
                  form.formState.errors.approvers
                    ? "text-error"
                    : "text-gray-700"
                }`}
              >
                Assigned Approver
                {/* <span className="text-red-500 ml-1">*</span> */}
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="approvers"
                maxCount={3}
                searchPlaceholder="Search Employee"
                hideSelectAll
                disabled={isLoadingEmployees}
                valueTransformer={valueTransformer}
                searchValue={searchApprover}
                onSearchChange={setSearchApprover}
              />
              <SelectForm
                name="leave_type_id"
                label="Leave Type"
                required
                options={leaveTypeOptions}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker name="start_date" label="Start Date" />
                <DatePicker name="end_date" label="End Date" />
              </div>
            </div>
            <TextAreaForm
              label="Reason"
              name="reason"
              className="md:col-span-2"
            />
            <UploadButton
              key="1"
              name="attachments"
              label="Attachments"
              required
            />
          </form>
          <div className="flex gap-4 col-span-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="min-w-[186px]"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[186px]"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending
                ? "Loading..."
                : isEditMode
                  ? "Update Leave Request"
                  : "Add Leave Request"}
            </Button>
          </div>
        </Form>
      </div>
    );
  },
);
