'use client';

import { Form } from '@/components/ui/form';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useLeaveRequestForm } from './hook';
import { SelectEmployeeForm, SelectForm } from '@/components/ui/select-form';
import { MultiSelectForm } from '@/components/ui/multi-select';
import { DatePicker } from '@/components/ui/date-picker';
import { TextAreaForm } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
    const t = useTranslations('attendance');
    const tCommon = useTranslations('common');
    const tOffboarding = useTranslations('offboarding');
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

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <Form {...form}>
          <form className="grid md:grid-cols-2 grid-cols-1 gap-4 items-center">
            {!isEmployee && (
              <SelectEmployeeForm
                name="user_id"
                label={t('employeeName')}
                required
                options={employeesOptions}
                disabled={isEditMode}
              />
            )}
            {!isEmployee && (
              <span className="text-sm text-text-secondary">
                {t('usedLeaveBalance')} :{' '}
                {leaveBalance?.data ? (
                  <span>
                    {t('leaveBalanceDays', {
                      used: leaveBalance.data.time_off_used,
                      available: leaveBalance.data.available_time_off,
                    })}
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
                    {tOffboarding('assignedApprover')}
                  </label>
                  <MultiSelectForm
                    options={employeesOptions}
                    name="approvers"
                    maxCount={3}
                    searchPlaceholder={t('searchEmployeeShort')}
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
                label={t('leaveType')}
                required
                options={leaveTypeOptions}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker name="start_date" label={t('startDate')} />
                <DatePicker name="end_date" label={t('endDate')} />
              </div>
            </div>

            <TextAreaForm
              label={t('reason')}
              name="reason"
              className="md:col-span-2"
            />
            <div className="flex flex-col space-y-3">
              <div className="mb-2 text-sm">{t('attachments')}</div>
              {isUploadingLogo ? (
                <div className="text-sm text-gray-500">{tCommon('loading')}</div>
              ) : form.watch('attachments') ? (
                <div className="relative w-fit">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}/${form.watch('attachments')}`}
                    alt={t('attachmentPreview')}
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
                  {t('selectAttachments')}
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
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[186px]"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending
                ? tCommon('loading')
                : isEditMode
                  ? t('updateLeaveRequest')
                  : t('addLeaveRequest')}
            </Button>
          </div>
        </Form>
      </div>
    );
  },
);
