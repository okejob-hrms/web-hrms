'use client';

import { CompanyFormValues, useCompanyForm } from './hook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormLabel, FormControl } from '@/components/ui/form';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import TitleContent from '@/components/ui/title';

export default function SettingsAttendanceConfigurationForm() {
  const { form, onSubmit, dataWorkSchedule, handleBack, daysOfWeek } =
    useCompanyForm();

  const [workSchedules, setWorkSchedules] = useState(
    dataWorkSchedule?.rawWorkSchedules || [],
  );

  const defaultValueNew = {
    shift_name: 'Night Shift',
    start_time: '09:05',
    end_time: '17:00',
    break_start_time: '12:00',
    break_end_time: '13:00',
    ends_next_day: false,
  };

  const handleSubmit = (values: CompanyFormValues) => {
    // const dataWork = workSchedules.map((day) => ({
    //   day_of_week: day.day_of_week,
    //   schedules: (day.schedules ?? []).map((s) => ({
    //     shift_name: s.shift_name,
    //     start_time: s.start_time,
    //     end_time: s.end_time,
    //     sequence: s.sequence,
    //     ends_next_day: s.ends_next_day,
    //     break_start_time: s.break_start_time,
    //     break_end_time: s.break_end_time,
    //   })),
    // }));

    onSubmit({
      ...values,
      // workSchedules: dataWork,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TitleContent label="Attendance Configuration" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <h2 className="text-xl font-semibold pt-6">Working Hours</h2>

          {/* PART WORKING HOUR  */}
          {daysOfWeek.map((item, key) => (
            <div key={key} className="space-y-3 border-b border-b-gray-50">
              <div className="flex gap-4 items-center">
                <Checkbox
                  checked={workSchedules?.[key]?.has_schedule}
                  onCheckedChange={() => {
                    setWorkSchedules((prev) => {
                      const updated = [...prev];
                      const day = { ...updated[key] };

                      // toggle
                      day.has_schedule = !day.has_schedule;

                      if (day.has_schedule) {
                        const schedules = [...(day.schedules || [])];
                        if (schedules.length === 0) {
                          schedules.push({ ...defaultValueNew, sequence: key });
                        }
                        day.schedules = schedules;
                      }

                      updated[key] = day;
                      return updated;
                    });
                  }}
                />
                <div className="font-bold">{item}</div>
              </div>
              {workSchedules?.[key]?.has_schedule && (
                <div className="mb-3 space-y-2">
                  {workSchedules?.[key]?.schedules?.map((schedule, i) => (
                    <div
                      key={i}
                      className="space-y-2 border border-blue-400 rounded-md p-4"
                    >
                      <div className="flex flex-row justify-between">
                        <div className="space-y-2">
                          <FormLabel>Shift</FormLabel>
                          <Select
                            onValueChange={(newShiftName) => {
                              console.log(newShiftName);

                              setWorkSchedules((prev) => {
                                const updated = [...prev];
                                const day = { ...updated[key] };
                                const schedules = [...(day.schedules || [])];

                                if (schedules[i]) {
                                  schedules[i] = {
                                    ...schedules[i],
                                    shift_name: newShiftName,
                                  };
                                }

                                day.schedules = schedules;
                                updated[key] = day;

                                return updated;
                              });
                            }}
                            value={schedule.shift_name}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Morning Shift">
                                Morning Shift
                              </SelectItem>
                              <SelectItem value="Afternoon Shift">
                                Afternoon Shift
                              </SelectItem>
                              <SelectItem value="Night Shift">
                                Night Shift
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="link"
                          className="text-red-500"
                          onClick={() => {
                            setWorkSchedules((prev) => {
                              const updated = [...prev];
                              const day = { ...updated[key] };
                              const schedules = [...(day.schedules || [])];
                              if (schedules.length === 1) {
                                day.has_schedule = false;
                              }

                              schedules.splice(i, 1);

                              day.schedules = schedules;
                              updated[key] = day;

                              return updated;
                            });
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 space-y-2">
                        <div className="grid grid-cols-9 gap-2 space-y-1">
                          <div className="space-y-2 col-span-4">
                            <FormLabel>Working Hour</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                placeholder="Select time"
                                value={schedule.start_time}
                                onChange={(e) => {
                                  setWorkSchedules((prev) => {
                                    const updated = [...prev];
                                    const day = { ...updated[key] };
                                    const schedules = [
                                      ...(day.schedules || []),
                                    ];

                                    if (schedules[i]) {
                                      schedules[i] = {
                                        ...schedules[i],
                                        start_time: e.target.value,
                                      };
                                    }

                                    day.schedules = schedules;
                                    updated[key] = day;

                                    return updated;
                                  });
                                }}
                              />
                            </FormControl>
                          </div>
                          <div className="space-y-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <div className="pt-2 text-center">-</div>
                          </div>
                          <div className="space-y-2 col-span-4">
                            <FormLabel>&nbsp;</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                placeholder="Select time"
                                value={schedule.end_time}
                                onChange={(e) => {
                                  setWorkSchedules((prev) => {
                                    const updated = [...prev];
                                    const day = { ...updated[key] };
                                    const schedules = [
                                      ...(day.schedules || []),
                                    ];

                                    if (schedules[i]) {
                                      schedules[i] = {
                                        ...schedules[i],
                                        end_time: e.target.value,
                                      };
                                    }

                                    day.schedules = schedules;
                                    updated[key] = day;

                                    return updated;
                                  });
                                }}
                              />
                            </FormControl>
                          </div>
                        </div>

                        <div className="grid grid-cols-9 gap-2 space-y-1">
                          <div className="space-y-2 col-span-4">
                            <FormLabel>Break Time</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                placeholder="Select time"
                                value={schedule.break_start_time}
                                onChange={(e) => {
                                  setWorkSchedules((prev) => {
                                    const updated = [...prev];
                                    const day = { ...updated[key] };
                                    const schedules = [
                                      ...(day.schedules || []),
                                    ];

                                    if (schedules[i]) {
                                      schedules[i] = {
                                        ...schedules[i],
                                        break_start_time: e.target.value,
                                      };
                                    }

                                    day.schedules = schedules;
                                    updated[key] = day;

                                    return updated;
                                  });
                                }}
                              />
                            </FormControl>
                          </div>
                          <div className="space-y-2">
                            <FormLabel>&nbsp;</FormLabel>
                            <div className="pt-2 text-center">-</div>
                          </div>
                          <div className="space-y-2 col-span-4">
                            <FormLabel>&nbsp;</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                placeholder="Select time"
                                value={schedule.break_end_time}
                                onChange={(e) => {
                                  setWorkSchedules((prev) => {
                                    const updated = [...prev];
                                    const day = { ...updated[key] };
                                    const schedules = [
                                      ...(day.schedules || []),
                                    ];

                                    if (schedules[i]) {
                                      schedules[i] = {
                                        ...schedules[i],
                                        break_end_time: e.target.value,
                                      };
                                    }

                                    day.schedules = schedules;
                                    updated[key] = day;

                                    return updated;
                                  });
                                }}
                              />
                            </FormControl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => {
                      setWorkSchedules((prev) => {
                        const updated = [...prev];
                        const day = { ...updated[key] };
                        const schedules = [...(day.schedules || [])];

                        schedules.push({
                          ...defaultValueNew,
                          sequence: schedules.length + 1,
                        });

                        day.schedules = schedules;
                        updated[key] = day;

                        return updated;
                      });
                    }}
                  >
                    <Plus />
                    Add Shift
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-[100px]">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
