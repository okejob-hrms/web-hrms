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
import { OvertimePayrun } from '@/services/payroll/types';
import { useTranslations } from 'next-intl';

interface OvertimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OvertimePayrun;
  setData: (val: OvertimePayrun) => void;
  onSave: () => void;
}

export default function OvertimeModal({
  open,
  onOpenChange,
  data,
  setData,
  onSave,
}: OvertimeModalProps) {
  const t = useTranslations('payroll');
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{tAtt('overtime')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12">
              <label className="text-sm font-medium mb-1 block">
                {t('overtimeAmount')}
              </label>
              <Input
                type="number"
                value={data.overtime_amount}
                onChange={(e) =>
                  setData({
                    ...data,
                    overtime_amount: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={onSave} disabled={!data.overtime_amount}>
              {tCommon('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
