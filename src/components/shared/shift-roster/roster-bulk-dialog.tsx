'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/combobox';
import { BasicDatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { dateToStr, strToDate, type SelectOption } from './utils';

const MAX_RANGE_DAYS = 62;

export type RosterBulkPayload = {
  employee_ids: number[];
  from: string;
  to: string;
  shift_id: number | null;
  is_day_off: boolean;
  on_conflict: 'skip' | 'overwrite';
};

type RosterBulkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Array<{ id: number; name: string | null }>;
  shiftOptions: SelectOption[];
  isPending: boolean;
  onSubmit: (payload: RosterBulkPayload) => void;
  /** Earliest selectable date (YYYY-MM-DD). */
  minDate?: string;
  month?: string;
};

export function RosterBulkDialog({
  open,
  onOpenChange,
  employees,
  shiftOptions,
  isPending,
  onSubmit,
  minDate,
  month,
}: RosterBulkDialogProps) {
  const t = useTranslations('settings.shiftRoster');
  const [employeeIds, setEmployeeIds] = React.useState<number[]>([]);
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [shiftId, setShiftId] = React.useState('');
  const [dayOff, setDayOff] = React.useState(false);
  const [conflict, setConflict] = React.useState<'skip' | 'overwrite'>('skip');

  React.useEffect(() => {
    if (!open) return;
    const base = month ? dayjs(`${month}-01`) : dayjs();
    let start = base.startOf('month');
    if (minDate && start.isBefore(dayjs(minDate), 'day')) start = dayjs(minDate);
    let end = base.endOf('month');
    if (end.isBefore(start, 'day')) end = start;
    setFrom(start.format('YYYY-MM-DD'));
    setTo(end.format('YYYY-MM-DD'));
    setEmployeeIds([]);
    setShiftId('');
    setDayOff(false);
    setConflict('skip');
  }, [open, month, minDate]);

  const visibleEmployeeIds = employees.map((e) => e.id);
  const selectedIds = employeeIds.filter((id) => visibleEmployeeIds.includes(id));

  let rangeError: string | null = null;
  if (from && to) {
    if (dayjs(to).isBefore(from, 'day')) rangeError = t('rangeInvalid');
    else if (dayjs(to).diff(from, 'day') >= MAX_RANGE_DAYS) rangeError = t('rangeTooLong', { max: MAX_RANGE_DAYS });
  }

  const disabledBefore = minDate ? { before: dayjs(minDate).toDate() } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{t('bulkAssign')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-3">
            {employees.map((e) => (
              <label key={e.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={employeeIds.includes(e.id)}
                  onCheckedChange={(checked) =>
                    setEmployeeIds((prev) =>
                      checked === true ? [...prev, e.id] : prev.filter((id) => id !== e.id),
                    )
                  }
                />
                <span>{e.name}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <BasicDatePicker
              label={t('from')}
              value={strToDate(from)}
              onSelect={(d) => setFrom(dateToStr(d))}
              disabled={disabledBefore}
            />
            <BasicDatePicker
              label={t('to')}
              value={strToDate(to)}
              onSelect={(d) => setTo(dateToStr(d))}
              disabled={disabledBefore}
            />
          </div>
          {rangeError ? <p className="text-sm text-destructive">{rangeError}</p> : null}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={dayOff} onCheckedChange={(checked) => setDayOff(checked === true)} />
            <span>{t('setDayOff')}</span>
          </label>
          {!dayOff && (
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
          <div className="space-y-2">
            <Label>{t('onConflict')}</Label>
            <SearchableSelect
              options={[
                { value: 'skip', label: t('skip') },
                { value: 'overwrite', label: t('overwrite') },
              ]}
              value={conflict}
              onValueChange={(v) => setConflict((v as 'skip' | 'overwrite') || 'skip')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            disabled={isPending || !selectedIds.length || !from || !to || Boolean(rangeError)}
            onClick={() => {
              if (!dayOff && !shiftId) {
                toast.error(t('shiftRequired'));
                return;
              }
              onSubmit({
                employee_ids: selectedIds,
                from,
                to,
                shift_id: dayOff ? null : Number(shiftId),
                is_day_off: dayOff,
                on_conflict: conflict,
              });
            }}
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
