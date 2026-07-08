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
import { Trash2 } from 'lucide-react';
import { AdditionalItem } from '@/services/payroll/types';
import { useTranslations } from 'next-intl';

interface AdditionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AdditionalItem[];
  setData: (val: AdditionalItem[]) => void;
  onSave: () => void;
}

export default function AdditionalModal({
  open,
  onOpenChange,
  data,
  setData,
  onSave,
}: AdditionalModalProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');

  const handleAdd = () => {
    setData([
      ...data,
      {
        name: '',
        amount: 0,
      },
    ]);
  };

  const handleChange = (
    index: number,
    key: 'allowance_type_id' | 'amount' | 'name',
    val: string,
  ) => {
    setData(
      data.map((item, i) => {
        if (i !== index) return item;
        return { ...item, [key]: val };
      }),
    );
  };

  const handleRemove = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const isInvalid = data.some((item) => !item.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{t('additionalEarnings')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                <label className="text-sm font-medium mb-1 block">
                  {t('additionalName')}
                </label>
                <Input
                  value={item.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder={t('enterAdditionalName')}
                />
              </div>

              <div className="col-span-5">
                <label className="text-sm font-medium mb-1 block">
                  {t('additionalAmount')}
                </label>
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleChange(index, 'amount', e.target.value)
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
            {t('addEarnings')}
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
