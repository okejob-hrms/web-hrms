'use client';

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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const tSettings = useTranslations('settings');
  const { allowanceType } = usePayrollDetail();

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

  const handleChange = (
    index: number,
    key: 'allowance_type_id' | 'allowance_value' | 'allowance_name',
    val: string,
  ) => {
    setData(
      data.map((item, i) => {
        if (i !== index) return item;

        if (key === 'allowance_type_id') {
          const selected = allowanceType?.data.find(
            (type) => String(type.id) === val,
          );

          return {
            ...item,
            allowance_type_id: val,
            allowance_name: selected?.name || '',
          };
        }

        return { ...item, [key]: val };
      }),
    );
  };

  const handleRemove = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const isInvalid = data.some((item) => !item.allowance_type_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{t('allowance')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-6">
                <label className="text-sm font-medium mb-1 block">
                  {t('allowanceType')}
                </label>
                <Select
                  value={item.allowance_type_id}
                  onValueChange={(v) =>
                    handleChange(index, 'allowance_type_id', v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tSettings('selectType')} />
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

              <div className="col-span-5">
                <label className="text-sm font-medium mb-1 block">
                  {t('allowanceValue')}
                </label>
                <Input
                  value={item.allowance_value}
                  onChange={(e) =>
                    handleChange(index, 'allowance_value', e.target.value)
                  }
                  placeholder="0"
                />
              </div>

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
          <Button
            variant="outline"
            className="border-0"
            onClick={handleAdd}
            type="button"
          >
            {t('addAllowance')}
          </Button>
        </div>

        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={onSave} disabled={isInvalid}>
              {tCommon('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
