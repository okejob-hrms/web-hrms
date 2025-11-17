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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Working Time</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 items-end">
            {/* Value */}
            <div className="col-span-6">
              <label className="text-sm font-medium mb-1 block">
                Working Days
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

            {/* Value */}
            <div className="col-span-6">
              <label className="text-sm font-medium mb-1 block">
                Working Hour
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

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!data.working_days && !data.working_hours}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
