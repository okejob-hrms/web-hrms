import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { AllowanceItem } from '@/services/payroll/types';
import { usePayrollDetail } from '../hook';

interface AllowanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AllowanceItem[];
  setData: (val: AllowanceItem[]) => void;
  onSave: () => void;
}

export default function AllowanceModal({
  open,
  onOpenChange,
  data,
  setData,
  onSave,
}: AllowanceModalProps) {
  const { allowanceType } = usePayrollDetail();

  // ADD
  const handleAdd = () => {
    setData([
      ...data,
      {
        allowance_type_id: '',
        allowance_name: '',
        allowance_value: '0',
      },
    ]);
  };

  // CHANGE (by index)
  const handleChange = (
    index: number,
    key: 'allowance_type_id' | 'allowance_value' | 'allowance_name',
    val: string,
  ) => {
    setData(
      data.map((item, i) => {
        if (i !== index) return item;

        // kalau yang berubah adalah allowance_type_id
        if (key === 'allowance_type_id') {
          // cari name dari list type
          const selected = allowanceType?.data.find(
            (t) => String(t.id) === val,
          );

          return {
            ...item,
            allowance_type_id: val,
            allowance_name: selected?.name || '',
          };
        }

        // default update
        return { ...item, [key]: val };
      }),
    );
  };

  // REMOVE (by index)
  const handleRemove = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const isInvalid = data.some((item) => !item.allowance_type_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Allowance</DialogTitle>
        </DialogHeader>

        {/* List */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              {/* Type */}
              <div className="col-span-6">
                <label className="text-sm font-medium mb-1 block">
                  Allowance Type
                </label>
                <Select
                  value={item.allowance_type_id}
                  onValueChange={(v) =>
                    handleChange(index, 'allowance_type_id', v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowanceType?.data.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="col-span-5">
                <label className="text-sm font-medium mb-1 block">
                  Allowance Value
                </label>
                <Input
                  value={item.allowance_value}
                  onChange={(e) =>
                    handleChange(index, 'allowance_value', e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              {/* Delete */}
              <div className="col-span-1 flex justify-center pb-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-0"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {/* Add */}
          <Button
            variant="outline"
            className="border-0"
            onClick={handleAdd}
            type="button"
          >
            + Add Allowance
          </Button>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isInvalid}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
