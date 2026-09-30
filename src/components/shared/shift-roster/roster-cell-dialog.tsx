'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { RosterCell } from '@/services/shift-roster';
import type { SelectOption } from './utils';

export type RosterCellTarget = {
  employeeId: number;
  employeeName: string;
  date: string;
  cells: RosterCell[];
};

export type RosterCellPayload = {
  employee_id: number;
  date: string;
  shift_id?: number | null;
  is_day_off?: boolean;
  clear?: boolean;
};

type RosterCellDialogProps = {
  target: RosterCellTarget | null;
  shiftOptions: SelectOption[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: RosterCellPayload) => void;
};

export function RosterCellDialog({ target, shiftOptions, isPending, onClose, onSubmit }: RosterCellDialogProps) {
  const t = useTranslations('settings.shiftRoster');
  const [mode, setMode] = React.useState<'shift' | 'off' | 'clear'>('shift');
  const [shiftId, setShiftId] = React.useState('');

  React.useEffect(() => {
    if (!target) return;
    setMode(target.cells.some((c) => c.is_day_off) ? 'off' : 'shift');
    setShiftId(target.cells[0]?.shift_id ? String(target.cells[0].shift_id) : '');
  }, [target]);

  const save = () => {
    if (!target) return;
    const base = { employee_id: target.employeeId, date: target.date };
    if (mode === 'clear') return onSubmit({ ...base, clear: true });
    if (mode === 'off') return onSubmit({ ...base, is_day_off: true, shift_id: null });
    if (!shiftId) {
      toast.error(t('shiftRequired'));
      return;
    }
    onSubmit({ ...base, shift_id: Number(shiftId), is_day_off: false });
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{t('editCell')}</DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              {target.employeeName} · {target.date}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant={mode === 'shift' ? 'default' : 'outline'} size="sm" onClick={() => setMode('shift')}>
                {t('setShift')}
              </Button>
              <Button variant={mode === 'off' ? 'default' : 'outline'} size="sm" onClick={() => setMode('off')}>
                {t('setDayOff')}
              </Button>
              <Button variant={mode === 'clear' ? 'default' : 'outline'} size="sm" onClick={() => setMode('clear')}>
                {t('clearManual')}
              </Button>
            </div>
            {mode === 'shift' && (
              <div className="space-y-2">
                <Label>{t('selectShift')}</Label>
                <SearchableSelect
                  options={shiftOptions}
                  value={shiftId}
                  onValueChange={(v) => setShiftId(String(v ?? ''))}
                  placeholder={t('selectShift')}
                />
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={save} disabled={isPending}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
