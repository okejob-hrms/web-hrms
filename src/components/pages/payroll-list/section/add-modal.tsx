import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PayrollGroupRequest } from '@/services/payroll/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { month, year } from '@/lib/utils';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  formData: PayrollGroupRequest;
  setFormData: React.Dispatch<React.SetStateAction<PayrollGroupRequest>>;
}

export default function PayrunsAddModal({
  onUpdate,
  isOpen,
  setIsOpen,
  formData,
  setFormData,
}: Props) {
  const handleUpdate = async (e: React.MouseEvent) => {
    console.log('Employee data updated');
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              Add Payroll Group
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Payment Period</div>
              <div className="grid grid-cols-2 gap-3 space-y-2">
                <div className="col-span-1">
                  <Select
                    onValueChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        period_month: Number(e),
                      }));
                    }}
                    value={String(formData.period_month)}
                    defaultValue={String(
                      formData.period_month ?? new Date().getMonth(),
                    )}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {month.map((item, i) => (
                        <SelectItem value={String(item.id)} key={i}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Select
                    onValueChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        period_year: Number(e),
                      }));
                    }}
                    value={String(formData.period_year)}
                    defaultValue={String(
                      formData.period_year ?? new Date().getFullYear(),
                    )}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {year.map((item, i) => (
                        <SelectItem value={String(item.id)} key={i}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-3 space-y-2">
                <div className="col-span-1">
                  <div className="text-sm text-gray-500">Send Payslip Date</div>
                  <Input
                    type="date"
                    value={formData.send_payslip_at}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        send_payslip_at: new Date(
                          e.target.value,
                        ).toDateString(),
                      }));
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <div className="text-sm text-gray-500">
                    Send Payslip Automatically
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">No</span>
                    <Switch
                      checked={formData.auto_send_payslip}
                      onCheckedChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          auto_send_payslip: !formData.auto_send_payslip,
                        }));
                      }}
                    />
                    <span className="text-sm text-blue-600 font-medium">
                      Active
                    </span>
                  </div>
                  {formData.auto_send_payslip && (
                    <>
                      <Input
                        className="mt-3"
                        type="time"
                        value={new Date(
                          formData.send_payslip_at ?? '',
                        ).getTime()}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            overtime_date: e.target.value,
                          }));
                        }}
                      />
                      <span className="text-sm text-gray-500 font-medium">
                        Payslip will sent on selected date and time
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-sm text-gray-500">Notes</div>
              <Textarea
                rows={5}
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
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
