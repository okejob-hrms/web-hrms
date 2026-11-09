'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPeriodDate, formatPeriodDateWithWeekday } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import type {
  AttendanceReviewIssue,
  ResolveUnresolvedItem,
  ReviewPunch,
  ReviewShiftOption,
} from '@/services/attendance-review/types';
import { formatLocalDateTime, minutesParts } from './format';
import { rosterHintFromIssue, rosterWeekHref } from './roster-hint';

const DISCARD_REASONS = ['break', 'duplicate', 'test', 'other'] as const;
type DiscardReason = (typeof DISCARD_REASONS)[number];

const STATUS_PENDING = 0;
const STATUS_UNRESOLVED = 4;

interface RowState {
  selected: boolean;
  shiftId: number | null;
  countedDate: string;
}

interface ResolveUnresolvedDialogProps {
  issue: AttendanceReviewIssue | null;
  isPending: boolean;
  onClose: () => void;
  onResolve: (items: ResolveUnresolvedItem[]) => void;
}

export function ResolveUnresolvedDialog({
  issue,
  isPending,
  onClose,
  onResolve,
}: ResolveUnresolvedDialogProps) {
  const t = useTranslations('attendanceReview');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());

  const unmatched = React.useMemo(
    () =>
      (issue?.machine_punches ?? []).filter(
        (punch) => punch.status === STATUS_UNRESOLVED || punch.status === STATUS_PENDING,
      ),
    [issue],
  );

  const [rows, setRows] = React.useState<Record<number, RowState>>({});
  const [discardReason, setDiscardReason] = React.useState<DiscardReason>('other');

  React.useEffect(() => {
    if (!issue) {
      setRows({});
      setDiscardReason('other');
      return;
    }
    const options = issue.shift_options ?? [];
    const next: Record<number, RowState> = {};
    for (const punch of unmatched) {
      const choices = dateChoicesForPunch(punch);
      const countedDate =
        punch.suggested_counted_date && choices.includes(punch.suggested_counted_date)
          ? punch.suggested_counted_date
          : (choices[1] ?? choices[0] ?? punch.at_local.slice(0, 10));
      const shifts = options.filter((option) => option.counted_date === countedDate);
      const shiftId =
        punch.suggested_shift_id != null && shifts.some((s) => s.id === punch.suggested_shift_id)
          ? punch.suggested_shift_id
          : nearestShiftId(punch.at_local, shifts);
      next[punch.id] = { selected: true, shiftId, countedDate };
    }
    setRows(next);
    setDiscardReason('other');
  }, [issue, unmatched]);

  const selectedPunches = unmatched.filter((punch) => rows[punch.id]?.selected);
  const canAssign = selectedPunches.every((punch) => {
    const row = rows[punch.id];
    return row?.shiftId != null && row.countedDate !== '';
  });

  const preview = React.useMemo(
    () => buildPreview(selectedPunches, rows, issue?.shift_options ?? []),
    [selectedPunches, rows, issue?.shift_options],
  );

  const shiftChoicesFor = (countedDate: string): ReviewShiftOption[] =>
    (issue?.shift_options ?? []).filter((option) => option.counted_date === countedDate);

  const updateRow = (id: number, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const assignItems = (): ResolveUnresolvedItem[] =>
    selectedPunches.map((punch) => ({
      log_id: punch.id,
      action: 'assign',
      counted_date: rows[punch.id].countedDate,
      shift_id: rows[punch.id].shiftId!,
    }));

  const discardItems = (): ResolveUnresolvedItem[] =>
    selectedPunches.map((punch) => ({
      log_id: punch.id,
      action: 'discard',
      reason: discardReason,
    }));

  const rosterHint = issue ? rosterHintFromIssue(issue) : null;

  return (
    <Dialog open={!!issue} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[min(960px,calc(100%-2rem))] max-w-[min(960px,calc(100%-2rem))] flex-col gap-4 overflow-hidden bg-white sm:max-w-[min(960px,calc(100%-2rem))]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('resolveUnresolvedTitle')}</DialogTitle>
          <DialogDescription>
            {[issue?.employee?.name, issue?.date ? formatPeriodDateWithWeekday(issue.date, locale) : null]
              .filter(Boolean)
              .join(' · ')}
          </DialogDescription>
        </DialogHeader>

        {rosterHint ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {t('rosterUnpublishedHint', {
              date: formatPeriodDate(rosterHint.week_start, locale),
            })}{' '}
            <Link href={rosterWeekHref(rosterHint.week_start)} className="inline-flex items-center gap-1 font-medium underline">
              {t('openShiftRoster')}
              <ExternalLink className="size-3.5" />
            </Link>
          </p>
        ) : null}

        {unmatched.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('resolveUnresolvedEmpty')}</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <div className="rounded-md border border-gray-200">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[26%]" />
                  <col />
                </colgroup>
                <thead className="bg-gray-50 text-xs text-text-secondary">
                  <tr>
                    <th className="px-3 py-2">
                      <span className="sr-only">{t('resolveSelect')}</span>
                    </th>
                    <th className="px-3 py-2">{t('resolvePunch')}</th>
                    <th className="px-3 py-2">{t('resolveReason')}</th>
                    <th className="px-3 py-2">{t('resolveCountedDate')}</th>
                    <th className="px-3 py-2">{t('resolveShift')}</th>
                  </tr>
                </thead>
                <tbody>
                  {unmatched.map((punch) => {
                    const row = rows[punch.id];
                    if (!row) return null;
                    const choices = dateChoicesForPunch(punch);
                    const shifts = shiftChoicesFor(row.countedDate);
                    return (
                      <tr key={punch.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 align-middle">
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={(checked) => updateRow(punch.id, { selected: checked === true })}
                            aria-label={t('resolveSelect')}
                          />
                        </td>
                        <td className="px-3 py-2 align-middle whitespace-nowrap font-medium">
                          {formatLocalDateTime(punch.at_local, locale) ?? punch.at_local}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <Badge variant="outline" className="font-normal">
                            {reasonLabel(t, punch.unresolved_reason)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <Select
                            value={row.countedDate}
                            onValueChange={(value) => {
                              const nextShifts = shiftChoicesFor(value);
                              updateRow(punch.id, {
                                countedDate: value,
                                shiftId: nearestShiftId(punch.at_local, nextShifts),
                              });
                            }}
                            disabled={!row.selected || isPending}
                          >
                            <SelectTrigger size="sm" className="w-full min-w-0 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {choices.map((date) => (
                                <SelectItem key={date} value={date}>
                                  {formatPeriodDate(date, locale)}
                                  {date === issue?.date ? ` · ${t('resolveIssueDay')}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <Select
                            value={row.shiftId != null ? String(row.shiftId) : undefined}
                            onValueChange={(value) => updateRow(punch.id, { shiftId: Number(value) })}
                            disabled={!row.selected || isPending || shifts.length === 0}
                          >
                            <SelectTrigger size="sm" className="w-full min-w-0 bg-white">
                              <SelectValue placeholder={t('resolveNoShiftOption')} />
                            </SelectTrigger>
                            <SelectContent>
                              {shifts.map((shift) => (
                                <SelectItem key={`${shift.id}|${shift.counted_date}`} value={String(shift.id)}>
                                  {shift.name ?? `#${shift.id}`}
                                  {` · ${shift.start_local.slice(11, 16)}–${shift.end_local.slice(11, 16)}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {preview.length > 0 ? (
              <div className="rounded-md border border-sky-200 bg-sky-50/60 px-3 py-2 text-sm">
                <div className="mb-1 text-xs font-medium text-sky-900">{t('resolvePreview')}</div>
                <ul className="flex flex-col gap-1 text-sky-950">
                  {preview.map((item) => (
                    <li key={`${item.countedDate}|${item.shiftId}`}>
                      {[
                        item.shiftName ?? t('noShift'),
                        t('bookedOn', { date: formatPeriodDate(item.countedDate, locale) }),
                        item.inLocal ? `${t('punchRole.in')} ${item.inLocal.slice(11, 16)}` : t('noClockIn'),
                        item.outLocal ? `${t('punchRole.out')} ${item.outLocal.slice(11, 16)}` : t('noClockOut'),
                        item.workedMinutes != null ? t('worked', minutesParts(item.workedMinutes)) : null,
                        item.lateMinutes != null && item.lateMinutes > 0
                          ? t('resolveLate', minutesParts(item.lateMinutes))
                          : t('resolveOnTime'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>{t('resolveDiscardReason')}</Label>
                <Select
                  value={discardReason}
                  onValueChange={(value) => setDiscardReason(value as DiscardReason)}
                  disabled={isPending}
                >
                  <SelectTrigger size="sm" className="w-44 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCARD_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {t(`resolveDiscardReasons.${reason}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="shrink-0 flex-wrap gap-2 sm:justify-between">
          <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || selectedPunches.length === 0}
              onClick={() => onResolve(discardItems())}
            >
              {t('resolveDiscardSelected', { count: selectedPunches.length })}
            </Button>
            <Button
              type="button"
              disabled={isPending || selectedPunches.length === 0 || !canAssign}
              onClick={() => onResolve(assignItems())}
            >
              {isPending ? tCommon('processing') : t('resolveAssignSelected', { count: selectedPunches.length })}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function dateChoicesForPunch(punch: ReviewPunch): string[] {
  const day = dayjs(punch.at_local.slice(0, 10));
  return [-1, 0, 1].map((offset) => day.add(offset, 'day').format('YYYY-MM-DD'));
}

function nearestShiftId(atLocal: string, shifts: ReviewShiftOption[]): number | null {
  if (shifts.length === 0) return null;
  const at = dayjs(atLocal);
  let best: ReviewShiftOption | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const shift of shifts) {
    const distance = Math.min(
      Math.abs(at.diff(dayjs(shift.start_local), 'minute')),
      Math.abs(at.diff(dayjs(shift.end_local), 'minute')),
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      best = shift;
    }
  }
  return best?.id ?? null;
}

function reasonLabel(
  t: { (key: string): string; has: (key: string) => boolean },
  reason: string | null,
): string {
  if (!reason) return t('unresolvedReason.unknown');
  const key = `unresolvedReason.${reason}`;
  return t.has(key) ? t(key) : reason;
}

interface PreviewRecord {
  countedDate: string;
  shiftId: number;
  shiftName: string | null;
  inLocal: string | null;
  outLocal: string | null;
  workedMinutes: number | null;
  lateMinutes: number | null;
}

function buildPreview(
  punches: ReviewPunch[],
  rows: Record<number, RowState>,
  options: ReviewShiftOption[],
): PreviewRecord[] {
  const groups = new Map<string, { countedDate: string; shiftId: number; times: string[] }>();

  for (const punch of punches) {
    const row = rows[punch.id];
    if (!row?.selected || row.shiftId == null || !row.countedDate) continue;
    const key = `${row.countedDate}|${row.shiftId}`;
    const group = groups.get(key) ?? { countedDate: row.countedDate, shiftId: row.shiftId, times: [] };
    group.times.push(punch.at_local);
    groups.set(key, group);
  }

  return Array.from(groups.values()).map((group) => {
    const times = [...group.times].sort();
    const inLocal = times[0] ?? null;
    const outLocal = times.length >= 2 ? times[times.length - 1]! : null;
    const option = options.find((o) => o.id === group.shiftId && o.counted_date === group.countedDate);
    let workedMinutes: number | null = null;
    let lateMinutes: number | null = null;
    if (inLocal && outLocal) {
      workedMinutes = Math.max(0, dayjs(outLocal).diff(dayjs(inLocal), 'minute'));
    }
    if (inLocal && option) {
      lateMinutes = Math.max(0, dayjs(inLocal).diff(dayjs(option.start_local), 'minute'));
    }
    return {
      countedDate: group.countedDate,
      shiftId: group.shiftId,
      shiftName: option?.name ?? null,
      inLocal,
      outLocal,
      workedMinutes,
      lateMinutes,
    };
  });
}
