'use client';

import { Form } from '@/components/ui/form';
import * as React from 'react';
import { useLeaveRequestForm } from './hook';
import { SelectEmployeeForm, SelectForm } from '@/components/ui/select-form';
import { MultiSelectForm } from '@/components/ui/multi-select';
import { DatePicker } from '@/components/ui/date-picker';
import { TextAreaForm } from '@/components/ui/textarea';
import { Button, UploadButton } from '@/components/ui/button';
import AppSkeleton from '@/components/partials/app-skeleton';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';

interface AttendanceLeaveRequestFormProps {
  isEmployee?: boolean;
}

export const AttendanceLeaveRequestForm = React.memo(
  function AttendanceLeaveRequestForm({
    isEmployee,
  }: AttendanceLeaveRequestFormProps) {
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
      handleLogoChange,
      isUploadingLogo,
    } = useLeaveRequestForm(isEmployee);

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    if (isEditMode && isLoadingDetail) {
      return <AppSkeleton />;
    }
    console.log(form.watch('attachments'))
    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <Form {...form}>
          <form className="grid md:grid-cols-2 grid-cols-1 gap-4 items-center">
            {!isEmployee && (
              <SelectEmployeeForm
                name="user_id"
                label="Employee Name"
                required
                options={employeesOptions}
                disabled={isEditMode}
              />
            )}
            {!isEmployee && (
              <span className="text-sm text-text-secondary">
                Used Leave Balance :{' '}
                {leaveBalance?.data ? (
                  <span>
                    {leaveBalance.data.time_off_used} /{' '}
                    <span className="text-text-disabled">
                      {leaveBalance.data.available_time_off} Days
                    </span>
                  </span>
                ) : (
                  <span>-</span>
                )}{' '}
              </span>
            )}

            <div className="flex flex-col gap-2 md:col-start-1 md:col-end-2">
              {!isEmployee && (
                <>
                  <label
                    className={`text-sm font-medium ${
                      form.formState.errors.approvers
                        ? 'text-error'
                        : 'text-gray-700'
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
                </>
              )}
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
            {/* <UploadButton
              key="1"
              name="attachments"
              label="Attachments"
              required={false}
            /> */}
            <div className="flex flex-col space-y-3">
              <div className="mb-2 text-sm">Attachments</div>
              {isUploadingLogo ? (
                <div className="text-sm text-gray-500">Uploading...</div>
              ) : form.watch('attachments') ? (
                <div className="relative w-fit">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}/${form.watch('attachments')}`}
                    alt="Attachment Preview"
                    className="object-cover rounded-md border"
                    width={160}
                    height={160}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue('attachments', '', {
                        shouldValidate: true,
                      })
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-50"
                  disabled={isPending}
                >
                  <Plus />
                  Select Attachments
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </form>
          <div className="flex md:flex-row flex-col-reverse gap-4 col-span-2 md:mt-0 mt-10">
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
                ? 'Loading...'
                : isEditMode
                  ? 'Update Leave Request'
                  : 'Add Leave Request'}
            </Button>
          </div>
        </Form>
      </div>
    );
  },
);
