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
import { WorkHourPayrun } from '@/services/payroll/types';
import { useTranslations } from 'next-intl';

interface WorkHourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: WorkHourPayrun;
  setData: (val: WorkHourPayrun) => void;
  onSave: () => void;
}

export default function WorkHourModal({
  open,
  onOpenChange,
  data,
  setData,
  onSave,
}: WorkHourModalProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{t('workingTime')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-6">
              <label className="text-sm font-medium mb-1 block">
                {t('workingDays')}
              </label>
              <Input
                type="number"
                value={data.working_days}
                onChange={(e) =>
                  setData({
                    ...data,
                    working_days: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="col-span-6">
              <label className="text-sm font-medium mb-1 block">
                {t('workingHour')}
              </label>
              <Input
                type="number"
                value={data.working_hours}
                onChange={(e) =>
                  setData({
                    ...data,
                    working_hours: Number(e.target.value),
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
            <Button
              onClick={onSave}
              disabled={!data.working_days && !data.working_hours}
            >
              {tCommon('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
