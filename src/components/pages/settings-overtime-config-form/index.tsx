'use client';

import { CompanyFormValues, useCompanyForm } from './hook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, stringAvatar } from '@/lib/utils';
import TitleContent from '@/components/ui/title';
import { RadioForm } from '@/components/ui/radio-group';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/tables/data-table';

export default function SettingsOvertimeConfigForm() {
  const {
    form,
    onSubmit,
    dataWorkSchedule,
    handleBack,
    uploadLogo,
    imagePhoto,
  } = useCompanyForm();

  const defaultValueNew = {
    shift_name: 'Night Shift',
    start_time: '09:05',
    end_time: '17:00',
    break_start_time: '12:00',
    break_end_time: '13:00',
    ends_next_day: false,
  };

  const handleSubmit = (values: CompanyFormValues) => {
    onSubmit({
      ...values,
    });
  };

  const columns: ColumnDef<[]>[] = [
    { accessorKey: 'total_hour', header: 'Total Hour', size: 160 },
    { accessorKey: 'workingHours', header: 'Rate', size: 200 },
  ];

  const columnsOvertime: ColumnDef<[]>[] = [
    { accessorKey: 'total_hour', header: 'Day', size: 160 },
    { accessorKey: 'workingHours', header: 'Rate', size: 200 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TitleContent label="Overtime Configuration" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            <h3 className="font-bold">Formula & Rate Coefficient</h3>
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Working Hours Divisor
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioForm
                      name={field.name}
                      label="Formula"
                      options={[
                        { label: 'Per Month', value: 'per_month' },
                        { label: 'Per Year', value: 'per_year' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row justify-between items-center">
              <h3 className="font-semibold">Tiering Rules</h3>
              <Button
                variant="default"
                className="flex flex-row gap-6"
                onClick={() => {}}
              >
                <Plus />
                Add Tiering Rules
              </Button>
            </div>
            <DataTable columns={columns} data={[]} />

            <h3 className="font-bold">Limits & Thresholds</h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Maximum Overtime Hours */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={
                            (checked) => field.onChange(checked ? 0 : undefined) // default 0 saat aktif
                          }
                        />
                      </FormControl>
                      <div className="w-full space-y-1">
                        <FormLabel>Maximum Daily Overtime Hour</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={field.value === undefined}
                          />
                          <span className="text-gray-500">hours</span>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 0 : undefined)
                          }
                        />
                      </FormControl>
                      <div className="w-full space-y-1">
                        <FormLabel>Maximum Weekly Overtime Hour</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={field.value === undefined}
                          />
                          <span className="text-gray-500">hours</span>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 0 : undefined)
                          }
                        />
                      </FormControl>
                      <div className="w-full space-y-1">
                        <FormLabel>Maximum Monthly Overtime Hour</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={field.value === undefined}
                          />
                          <span className="text-gray-500">hours</span>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="test"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>
                          Auto Reject Policy
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="text-sm text-gray-600">
                          Reject if request exceeds limit
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Prorate by Minutes{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">No</span>
                          <input
                            type="checkbox"
                            role="switch"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors">
                            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                          </div>
                          <span className="text-sm text-blue-600 font-medium">
                            Yes
                          </span>
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-400">
                        Calculated per minute, not rounded per hour
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <h3 className="font-bold">Holiday & Special Day Overtime</h3>

            <div className="flex flex-row gap-4 items-center">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weekend Overtime Rate{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-gray-400">x hourly rate for all hours</div>
            </div>

            <div className="flex flex-row gap-4 items-center">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Public Holiday Overtime Rate{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-gray-400">x hourly rate for all hours</div>
            </div>

            <div className="flex flex-row justify-between items-center">
              <h3 className="font-semibold">Special Exceptions</h3>
              <Button
                variant="default"
                className="flex flex-row gap-6"
                onClick={() => {}}
              >
                <Plus />
                Add Exception
              </Button>
            </div>
            <DataTable columns={columnsOvertime} data={[]} />
          </div>

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
