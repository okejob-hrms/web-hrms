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
import type { RosterOverride, RosterOverridePayload } from '@/services/shift-roster';
import { useLocalDateFormat, type SelectOption } from './utils';

export type RosterOverrideTarget = {
  employeeId: number;
  employeeName: string;
  /** Set for a single-day override; omitted for the whole week. */
  date?: string;
  /** The override stored at this scope, if any (clearing it falls back to the team shift / week override). */
  current: RosterOverride | null;
  effective: RosterOverride;
};

type RosterOverrideDialogProps = {
  target: RosterOverrideTarget | null;
  shiftOptions: SelectOption[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (target: RosterOverrideTarget, payload: RosterOverridePayload) => void;
};

export function RosterOverrideDialog({ target, shiftOptions, isPending, onClose, onSubmit }: RosterOverrideDialogProps) {
  const t = useTranslations('rosterWeek');
  const formatDate = useLocalDateFormat();
  const [mode, setMode] = React.useState<'shift' | 'off' | 'clear'>('shift');
  const [shiftId, setShiftId] = React.useState('');

  React.useEffect(() => {
    if (!target) return;
    setMode(target.effective.is_day_off ? 'off' : 'shift');
    setShiftId(target.effective.shift_id ? String(target.effective.shift_id) : '');
  }, [target]);

  const save = () => {
    if (!target) return;
    if (mode === 'clear') return onSubmit(target, { clear: true });
    if (mode === 'off') return onSubmit(target, { is_day_off: true, shift_id: null });
    if (!shiftId) {
      toast.error(t('shiftRequired'));
      return;
    }
    onSubmit(target, { shift_id: Number(shiftId), is_day_off: false });
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[min(28rem,calc(100%-2rem))] bg-white">
        <DialogHeader>
          <DialogTitle>{target?.date ? t('editDay') : t('editWeek')}</DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary break-words">
              {target.employeeName} · {target.date ? formatDate(target.date, 'ddd, DD MMM YYYY') : t('wholeWeek')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === 'shift' ? 'default' : 'outline'}
                size="sm"
                className="min-h-9"
                onClick={() => setMode('shift')}
              >
                {t('setShift')}
              </Button>
              <Button
                variant={mode === 'off' ? 'default' : 'outline'}
                size="sm"
                className="min-h-9"
                onClick={() => setMode('off')}
              >
                {t('setDayOff')}
              </Button>
              {target.current ? (
                <Button
                  variant={mode === 'clear' ? 'default' : 'outline'}
                  size="sm"
                  className="min-h-9"
                  onClick={() => setMode('clear')}
                >
                  {target.date ? t('clearDayOverride') : t('clearWeekOverride')}
                </Button>
              ) : null}
            </div>
            {mode === 'shift' && (
              <div className="space-y-2">
                <Label>{t('shift')}</Label>
                <SearchableSelect
                  options={shiftOptions}
                  value={shiftId}
                  onValueChange={(v) => setShiftId(String(v ?? ''))}
                  placeholder={t('selectShift')}
                />
              </div>
            )}
            {mode === 'clear' && (
              <p className="text-sm text-text-secondary">
                {target.date ? t('clearDayHint') : t('clearWeekHint')}
              </p>
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
