'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShiftPattern } from '@/services/shift-roster';
import type { SelectOption } from './utils';

type DayDraft = { day_index: number; shift_id: string };

function emptyDays(cycle: number): DayDraft[] {
  return Array.from({ length: cycle }, (_, i) => ({ day_index: i, shift_id: '' }));
}

export type PatternEditorPayload = {
  name: string;
  branch_id?: number | null;
  cycle_length_days: number;
  is_active: boolean;
  days: Array<{ day_index: number; shift_id: number | null }>;
};

type PatternEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ShiftPattern | null;
  shiftOptions: SelectOption[];
  isPending: boolean;
  onSubmit: (payload: PatternEditorPayload) => void;
  /** When provided, a branch selector is shown (HR only). */
  branchOptions?: SelectOption[];
  defaultBranchId?: string;
};

export function PatternEditorDialog({
  open,
  onOpenChange,
  editing,
  shiftOptions,
  isPending,
  onSubmit,
  branchOptions,
  defaultBranchId = '',
}: PatternEditorDialogProps) {
  const t = useTranslations('settings.shiftPatterns');
  const [name, setName] = React.useState('');
  const [branchId, setBranchId] = React.useState('');
  const [cycle, setCycle] = React.useState(7);
  const [days, setDays] = React.useState<DayDraft[]>(emptyDays(7));

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setBranchId(editing.branch_id ? String(editing.branch_id) : '');
      setCycle(editing.cycle_length_days);
      setDays(
        Array.from({ length: editing.cycle_length_days }, (_, i) => {
          const day = editing.days.find((d) => d.day_index === i);
          return { day_index: i, shift_id: day?.shift_id ? String(day.shift_id) : '' };
        }),
      );
    } else {
      setName('');
      setBranchId(defaultBranchId);
      setCycle(7);
      setDays(emptyDays(7));
    }
  }, [open, editing, defaultBranchId]);

  const dayOptions = [{ value: '', label: t('dayOff') }, ...shiftOptions];

  const submit = () =>
    onSubmit({
      name,
      ...(branchOptions ? { branch_id: branchId ? Number(branchId) : null } : {}),
      cycle_length_days: cycle,
      is_active: true,
      days: days.map((d) => ({
        day_index: d.day_index,
        shift_id: d.shift_id ? Number(d.shift_id) : null,
      })),
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{editing ? t('edit') : t('create')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {branchOptions ? (
            <div className="space-y-2">
              <Label>{t('branch')}</Label>
              <SearchableSelect
                options={[{ value: '', label: t('tenantWide') }, ...branchOptions]}
                value={branchId}
                onValueChange={(v) => setBranchId(String(v ?? ''))}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>{t('cycle')}</Label>
            <Input
              type="number"
              min={1}
              max={366}
              value={cycle}
              onChange={(e) => {
                const next = Math.max(1, Number(e.target.value) || 1);
                setCycle(next);
                setDays((prev) =>
                  emptyDays(next).map((d) => prev.find((p) => p.day_index === d.day_index) ?? d),
                );
              }}
            />
          </div>
          <div className="space-y-3 rounded-md border p-3">
            <Label>{t('days')}</Label>
            {days.map((day) => (
              <div key={day.day_index} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-text-secondary">
                  {t('dayN', { n: day.day_index + 1 })}
                </span>
                <div className="min-w-0 flex-1">
                  <SearchableSelect
                    options={dayOptions}
                    value={day.shift_id}
                    onValueChange={(v) =>
                      setDays((prev) =>
                        prev.map((d) =>
                          d.day_index === day.day_index ? { ...d, shift_id: String(v ?? '') } : d,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button disabled={isPending || !name} onClick={submit}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
