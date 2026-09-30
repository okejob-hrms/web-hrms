'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BasicDatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { dateToStr, strToDate } from './utils';

export type PatternAssignPayload = {
  employee_ids: number[];
  anchor_date: string;
  effective_from: string;
  effective_to: string | null;
};

type PatternAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Array<{ id: number; name: string | null; code?: string | null }>;
  isPending: boolean;
  onSubmit: (payload: PatternAssignPayload) => void;
  /** Server-side search (HR). When omitted, the list is filtered locally. */
  search?: { value: string; onChange: (value: string) => void };
  /** Earliest effective-from date (YYYY-MM-DD). */
  minEffectiveFrom?: string;
};

export function PatternAssignDialog({
  open,
  onOpenChange,
  employees,
  isPending,
  onSubmit,
  search,
  minEffectiveFrom,
}: PatternAssignDialogProps) {
  const t = useTranslations('settings.shiftPatterns');
  const [localSearch, setLocalSearch] = React.useState('');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [anchorDate, setAnchorDate] = React.useState('');
  const [effectiveFrom, setEffectiveFrom] = React.useState('');
  const [effectiveTo, setEffectiveTo] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    const start = minEffectiveFrom ?? dayjs().format('YYYY-MM-DD');
    setSelected([]);
    setAnchorDate(start);
    setEffectiveFrom(start);
    setEffectiveTo('');
  }, [open, minEffectiveFrom]);

  const searchValue = search?.value ?? localSearch;
  const visible = search
    ? employees
    : employees.filter((e) =>
        `${e.name ?? ''} ${e.code ?? ''}`.toLowerCase().includes(localSearch.toLowerCase()),
      );
  const disabledBefore = minEffectiveFrom ? { before: dayjs(minEffectiveFrom).toDate() } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{t('assign')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              className="pl-9"
              placeholder={t('searchEmployees')}
              value={searchValue}
              onChange={(e) => (search ? search.onChange(e.target.value) : setLocalSearch(e.target.value))}
            />
          </div>
          <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-3">
            {visible.map((emp) => (
              <label key={emp.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(emp.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked === true ? [...prev, emp.id] : prev.filter((x) => x !== emp.id),
                    )
                  }
                />
                <span>
                  {emp.name}
                  {emp.code ? ` · ${emp.code}` : ''}
                </span>
              </label>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <BasicDatePicker
              label={t('anchorDate')}
              value={strToDate(anchorDate)}
              onSelect={(d) => setAnchorDate(dateToStr(d) || anchorDate)}
            />
            <BasicDatePicker
              label={t('effectiveFrom')}
              value={strToDate(effectiveFrom)}
              onSelect={(d) => setEffectiveFrom(dateToStr(d) || effectiveFrom)}
              disabled={disabledBefore}
            />
            <BasicDatePicker
              label={t('effectiveTo')}
              value={strToDate(effectiveTo)}
              onSelect={(d) => setEffectiveTo(dateToStr(d))}
              disabled={disabledBefore}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            disabled={!selected.length || isPending}
            onClick={() =>
              onSubmit({
                employee_ids: selected,
                anchor_date: anchorDate,
                effective_from: effectiveFrom,
                effective_to: effectiveTo || null,
              })
            }
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
