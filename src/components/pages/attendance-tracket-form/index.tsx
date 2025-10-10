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
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { MapPinIcon } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SelectEmployeeForm } from '@/components/ui/select-form';
import EmployeeUpdateModal from './sections/edit-modal';
import dynamic from 'next/dynamic';
import { LocationBadge } from '@/components/ui/location-badge';
import dayjs from 'dayjs';

const MapPicker = dynamic(() => import('@/components/ui/map'), { ssr: false });

type AttendanceTrackerFormProps = {
  id?: string;
};

export default function AttendanceTrackerForm({
  id,
}: AttendanceTrackerFormProps) {
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
  } = useAttendenceForm();

  const handleSubmit = (values: AttendanceFormValues) => {
    onSubmit({ ...values, longitude: map.lng, latitude: map.lat });
  };

  React.useEffect(() => {
    if (id) {
      handleDetailData(id);
    }
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto font-sans min-h-screen flex flex-col space-y-6">
      <TitleContent label={`${id ? 'Edit' : 'Add'} Attendance Record`} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
            <SelectEmployeeForm
              name="user_id"
              label="Employee Name"
              required
              options={employeesOptions}
            />
          </div>

          <div className="grid sm:grid-cols-4 grid-cols-1 gap-4">
            <DatePicker
              name="attendance_date"
              label="Date"
              onChangeExtra={(date) => {
                if (date) setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
              }}
            />

            <FormField
              control={form.control}
              name="shift_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value)}
                      defaultValue={String(field.value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
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
                  <FormLabel>Clock-In Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
                  <FormLabel>Clock-Out Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-4 grid-cols-1 gap-2">
            <FormLabel>Location</FormLabel>
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
                Select Location
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
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
              Cancel
            </Button>
            {id ? (
              <EmployeeUpdateModal
                onUpdate={() => form.handleSubmit(handleSubmit)()}
                isLoading={isLoading}
              />
            ) : (
              <Button
                type="submit"
                className="min-w-[100px]"
                isLoading={isLoading}
              >
                Save
              </Button>
            )}
          </div>
        </form>
      </Form>

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
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSetMap()}
              className="min-w-[100px]"
              isLoading={isLoading}
            >
              Save Location
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
