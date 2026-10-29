'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { AttendanceFormValues, useAttendenceForm } from './hook';
import TitleContent from '@/components/ui/title';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MapPinIcon } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SelectEmployeeForm } from '@/components/ui/select-form';
import EmployeeUpdateModal from './sections/edit-modal';
import dynamic from 'next/dynamic';
import { LocationBadge } from '@/components/ui/location-badge';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Can } from '@/components/auth/can';

const MapPicker = dynamic(() => import('@/components/ui/map'), { ssr: false });

type AttendanceTrackerFormProps = {
  id?: string;
  slug?: string;
};

export default function AttendanceTrackerForm({
  id,
  slug,
}: AttendanceTrackerFormProps) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const {
    form,
    onSubmit,
    handleBack,
    shiftData,
    setOpenMap,
    openMap,
    handleSetMap,
    selectedMap,
    setSelectedMap,
    map,
    employeesOptions,
    handleDetailData,
    isLoading,
    defaultMap,
    setSelectedDate,
    setSelectedId,
    onSetAbsent,
    attendanceStatus,
  } = useAttendenceForm();

  const handleSubmit = (values: AttendanceFormValues) => {
    onSubmit({ ...values, longitude: map.lng, latitude: map.lat });
  };
  const [openSetAbsent, setOpenSetAbsent] = React.useState(false);

  React.useEffect(() => {
    if (id && slug) {
      handleDetailData(id, slug);
    }
  }, [id, slug, handleDetailData]);

  const userId = form.watch('user_id');
  React.useEffect(() => {
    if (userId) {
      setSelectedId(userId);
    }
  }, [userId, setSelectedId]);

  const pageTitle = id ? t('editAttendanceRecord') : t('addAttendance');

  return (
    <div className="max-w-4xl mx-auto font-sans min-h-screen flex flex-col space-y-6 p-6 md:p-0">
      <TitleContent label={pageTitle} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
            <SelectEmployeeForm
              name="user_id"
              label={t('employeeName')}
              required
              options={employeesOptions}
            />
          </div>

          <div className="grid sm:grid-cols-4 grid-cols-1 gap-4">
            <DatePicker
              name="attendance_date"
              label={tCommon('date')}
              onChangeExtra={(date) => {
                if (date) setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
              }}
            />

            <FormField
              control={form.control}
              name="shift_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('shift')}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value)}
                      defaultValue={String(field.value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectOption')} />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftData?.data?.shifts?.map((item, i) => (
                          <SelectItem value={String(item.shift.id)} key={i}>
                            {item.shift.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-4 grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="clock_in_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('clockInTime')}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      aria-label={t('clockInTime')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clock_out_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('clockOutTime')}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      aria-label={t('clockOutTime')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-4 grid-cols-1 gap-2">
            <FormLabel>{t('location')}</FormLabel>
            <div className="col-span-4">
              {selectedMap.lat !== defaultMap.lat &&
                selectedMap.lng !== defaultMap.lng && (
                  <LocationBadge
                    lat={Number(selectedMap.lat)}
                    lng={Number(selectedMap.lng)}
                  />
                )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenMap(true)}
                className="min-w-[100px]"
              >
                <MapPinIcon />
                {t('selectLocation')}
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon('notes')}</FormLabel>
                <FormControl>
                  <Textarea rows={3} aria-label={tCommon('notes')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="min-w-[100px]"
            >
              {tCommon('cancel')}
            </Button>
            {id ? (
              <>
                <Can permission="time_attendance.attendance_records.approval">
                  {attendanceStatus !== 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-w-[100px] border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => setOpenSetAbsent(true)}
                      disabled={isLoading}
                    >
                      {t('setAsAbsent')}
                    </Button>
                  )}
                </Can>
                <EmployeeUpdateModal
                  onUpdate={() => form.handleSubmit(handleSubmit)()}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <Button
                type="submit"
                className="min-w-[100px]"
                isLoading={isLoading}
              >
                {tCommon('save')}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Can permission="time_attendance.attendance_records.approval">
        <AlertDialog open={openSetAbsent} onOpenChange={setOpenSetAbsent}>
          <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <AlertDialogHeader className="text-center items-center justify-center">
              <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
                {t('setAsAbsentConfirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-text-secondary">
                {t('setAsAbsentConfirmDesc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-between gap-3 w-full">
              <AlertDialogCancel className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium">
                {tCommon('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex-1 bg-orange-600 text-white rounded-md py-2 font-medium hover:bg-orange-700"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenSetAbsent(false);
                  onSetAbsent();
                }}
              >
                {t('setAsAbsent')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Can>

      <AlertDialog open={openMap} onOpenChange={setOpenMap}>
        <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
          <div className="flex flex-col items-center justify-center mb-4">
            <MapPicker location={selectedMap} setLocation={setSelectedMap} />
          </div>
          <AlertDialogFooter className="flex flex-row gap-2 w-full justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenMap(false)}
              className="min-w-[100px]"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => handleSetMap()}
              className="min-w-[100px]"
              isLoading={isLoading}
            >
              {t('saveLocation')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
