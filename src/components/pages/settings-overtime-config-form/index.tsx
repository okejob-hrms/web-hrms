'use client';

import { OvertimeConfigValues, useOvertimeConfigForm } from './hook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit3, Ellipsis, Plus, Trash } from 'lucide-react';
import TitleContent from '@/components/ui/title';
import { RadioForm } from '@/components/ui/radio-group';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/tables/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Exception, TieringRule } from '@/services/settings/types';
import { Switch } from '@/components/ui/switch';

export default function SettingsOvertimeConfigForm() {
  const { form, onSubmit, isLoading, handleBack, data } =
    useOvertimeConfigForm();
  const [openTier, setOpenTier] = useState(false);
  const [openExceptions, setOpenExceptions] = useState(false);
  const [listTier, setListTier] = useState<TieringRule[]>(
    data?.tiering_rules || [],
  );
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [listExceptions, setListExceptions] = useState<Exception[]>(
    data?.exceptions || [],
  );
  const [tierField, setTierField] = useState({
    from_hour: '',
    to_hour: '',
    rate: '',
  });
  const [exceptionsField, setExceptionsField] = useState({
    day: '',
    rate: '',
  });

  const handleSubmit = (values: OvertimeConfigValues) => {
    const payload = {
      ...values,
      tiering_rules: listTier,
      exceptions: listExceptions,
    };

    onSubmit(payload);
  };

  //MANAGE TIER
  const handleSaveTier = () => {
    if (!tierField?.from_hour || !tierField?.to_hour || !tierField?.rate) {
      toast.error('Please fill all data');
      return;
    }

    if (editIndex !== null) {
      // EDIT MODE
      setListTier((prev) =>
        prev.map((item, i) => (i === editIndex ? tierField : item)),
      );
      toast.success('Tier updated');
    } else {
      // ADD MODE
      setListTier((prev) => [...prev, tierField]);
      toast.success('Tier added');
    }

    setTierField({
      from_hour: '',
      to_hour: '',
      rate: '',
    });
    setEditIndex(null);
    setOpenTier(false);
  };

  const handleDeleteTier = (index: number) => {
    setListTier((prev) => prev.filter((_, i) => i !== index));
  };

  //MANAGE EXCEPTION
  const handleSaveExceptions = () => {
    if (!exceptionsField?.day || !exceptionsField?.rate) {
      toast.error('Please fill all data');
      return;
    }

    if (editIndex !== null) {
      // EDIT MODE
      setListExceptions((prev) =>
        prev.map((item, i) => (i === editIndex ? exceptionsField : item)),
      );
      toast.success('Tier updated');
    } else {
      // ADD MODE
      setListExceptions((prev) => [...prev, exceptionsField]);
      toast.success('Tier added');
    }

    setTierField({
      from_hour: '',
      to_hour: '',
      rate: '',
    });
    setEditIndex(null);
    setOpenTier(false);
  };

  const handleDeleteExceptions = (index: number) => {
    setListExceptions((prev) => prev.filter((_, i) => i !== index));
  };

  const columns: ColumnDef<TieringRule>[] = [
    {
      accessorKey: 'from_hour',
      header: 'Timing Hour',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.from_hour}</span>
            <span className="font-bold">
              {row.original.to_hour && `- ${row.original.to_hour}`}
            </span>
            <span className="text-gray">Hour</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.rate}</span>
            <span className="text-gray">x Hourly Rate</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        const index = row.index;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button
                  type="button"
                  onClick={() => {
                    setOpenTier(true);
                    setTierField({
                      from_hour: row.original.from_hour,
                      to_hour: row.original.to_hour,
                      rate: row.original.rate,
                    });
                    setEditIndex(index);
                  }}
                  className="flex gap-2"
                >
                  <Edit3 />
                  Edit
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  type="button"
                  onClick={() => handleDeleteTier(index)}
                  className="flex gap-2"
                >
                  <Trash />
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const columnsOvertime: ColumnDef<Exception>[] = [
    { accessorKey: 'day', header: 'Day', size: 160 },
    {
      accessorKey: 'rate',
      header: 'Rate',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.rate}</span>
            <span className="text-gray">x Hourly Rate</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        const index = row.index;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button
                  type="button"
                  onClick={() => {
                    setOpenExceptions(true);
                    setExceptionsField({
                      day: row.original.day,
                      rate: row.original.rate,
                    });
                    setEditIndex(index);
                  }}
                  className="flex gap-2"
                >
                  <Edit3 />
                  Edit
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  type="button"
                  onClick={() => handleDeleteExceptions(index)}
                  className="flex gap-2"
                >
                  <Trash />
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TitleContent label="Overtime Configuration" />

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(form.getValues());
          }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 gap-4">
            <h3 className="font-bold">Formula & Rate Coefficient</h3>
            {/* Company Name */}
            <FormField
              control={form.control}
              name="working_hours_divisor"
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
                        { label: '160 Hours/Month', value: '160' },
                        { label: '173 Hours/Month', value: '173' },
                        { label: '180 Hours/Month', value: '180' },
                      ]}
                      value={String(field.value)}
                      onChange={(val) => field.onChange(Number(val))}
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
                type="button"
                variant="default"
                className="flex flex-row gap-6"
                onClick={() => setOpenTier(true)}
              >
                <Plus />
                Add Tiering Rules
              </Button>
            </div>
            <DataTable columns={columns} data={listTier} />

            <h3 className="font-bold">Limits & Thresholds</h3>

            <div className="grid grid-cols-2 gap-8">
              {/* Maximum Overtime Hours */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="max_daily_hours"
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
                  name="max_weekly_hours"
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
                  name="max_monthly_hours"
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
                  name="auto_reject"
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
                  name="prorate_by_minutes"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Prorate by Minutes{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">No</span>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                name="weekend_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weekend Overtime Rate{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                      />
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
                name="public_holiday_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Public Holiday Overtime Rate{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                      />
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
                type="button"
                variant="default"
                className="flex flex-row gap-6"
                onClick={() => setOpenExceptions(true)}
              >
                <Plus />
                Add Exception
              </Button>
            </div>
            <DataTable columns={columnsOvertime} data={listExceptions} />
          </div>

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleBack()}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[100px]"
              isLoading={isLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={openTier} onOpenChange={setOpenTier}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
              Add Tiering Rules
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Total Hours Range
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0"
                value={tierField.from_hour}
                onChange={(e) =>
                  setTierField((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="0"
                value={tierField.to_hour}
                onChange={(e) =>
                  setTierField((prev) => ({
                    ...prev,
                    to_hour: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700">Rate</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0"
                value={tierField.rate}
                onChange={(e) =>
                  setTierField((prev) => ({
                    ...prev,
                    rate: e.target.value,
                  }))
                }
              />
              <div className="text-gray-500 w-50">x hourly rate</div>
            </div>
          </div>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setOpenTier(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveTier}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openExceptions} onOpenChange={setOpenExceptions}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
              Add Exceptions
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700">Day</label>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Type your day exceptions"
                value={exceptionsField.day}
                onChange={(e) =>
                  setExceptionsField((prev) => ({
                    ...prev,
                    day: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700">Rate</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0"
                value={exceptionsField.rate}
                onChange={(e) =>
                  setExceptionsField((prev) => ({
                    ...prev,
                    rate: e.target.value,
                  }))
                }
              />
              <div className="text-gray-500 w-50">x hourly rate</div>
            </div>
          </div>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setOpenTier(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveExceptions}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
