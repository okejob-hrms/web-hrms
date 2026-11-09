'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Edit3, ExternalLink, Info, UserX, Wrench, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/auth/can';
import { StatusBadge } from '@/components/shared/status-badge';
import { getStatusAttendance } from '@/lib/helpers';
import { formatPeriodDate, formatPeriodDateWithWeekday } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';
import type { AttendanceReviewIssue, ReviewAction, ReviewRecord } from '@/services/attendance-review/types';
import type { RecordActionTarget } from '../types';
import { issuePayrollImpact, issueTitle } from './check-labels';
import { formatLocalDateTime, minutesParts, SEVERITY_STYLES } from './format';
import { MachinePunchDays } from './machine-punch-days';
import { rosterHintFromIssue, rosterWeekHref } from './roster-hint';

const STATUS_REJECTED = 2;
const STATUS_ABSENT = 3;

interface IssueCardProps {
  issue: AttendanceReviewIssue;
  editHref: (issue: AttendanceReviewIssue, record: ReviewRecord) => string | null;
  unresolvedHref: (issue: AttendanceReviewIssue) => string;
  onAccept: (issue: AttendanceReviewIssue) => void;
  onResolveUnresolved: (issue: AttendanceReviewIssue) => void;
  onRecordAction: (target: RecordActionTarget) => void;
}

export function IssueCard({
  issue,
  editHref,
  unresolvedHref,
  onAccept,
  onResolveUnresolved,
  onRecordAction,
}: IssueCardProps) {
  const t = useTranslations('attendanceReview');
  const locale = resolveLocale(useLocale());
  const can = (action: ReviewAction) => issue.actions.includes(action);
  const details = useIssueDetails(issue);
  const payrollImpact = issuePayrollImpact(t, issue);
  const rosterHint = rosterHintFromIssue(issue);

  const canAccept = can('accept') && issue.state === 'open';
  const dayMarkAbsent = can('mark_absent') && issue.records.length === 0 && !!issue.employee && !!issue.date;

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-md border border-l-4 border-gray-200 bg-white p-4',
        SEVERITY_STYLES[issue.severity].border,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">
            {issue.employee?.name ?? t('noEmployee')}
            {issue.employee?.code ? (
              <span className="ml-2 text-sm font-normal text-text-secondary">{issue.employee.code}</span>
            ) : null}
          </div>
          <div className="text-xs text-text-secondary">
            {[issue.employee?.branch, issue.employee?.department].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {issue.date ? (
            <span className="text-sm font-medium">{formatPeriodDateWithWeekday(issue.date, locale)}</span>
          ) : null}
          <Badge className={SEVERITY_STYLES[issue.severity].badge}>{t(`severity.${issue.severity}`)}</Badge>
          {issue.state !== 'open' ? (
            <Badge variant="outline">{t(`state.${issue.state}`)}</Badge>
          ) : null}
        </div>
      </header>

      <div className="text-sm font-medium">{issueTitle(t, issue)}</div>

      {details.length > 0 ? (
        <ul className="flex flex-col gap-0.5 text-sm text-text-secondary">
          {details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {rosterHint ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {t('rosterUnpublishedHint', { date: formatPeriodDate(rosterHint.week_start, locale) })}{' '}
          <Link
            href={rosterWeekHref(rosterHint.week_start)}
            className="inline-flex items-center gap-1 font-medium underline"
          >
            {t('openShiftRoster')}
            <ExternalLink className="size-3.5" />
          </Link>
        </p>
      ) : null}

      {issue.records.length > 0 ? (
        <div className="flex flex-col gap-2">
          {issue.records.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              locale={locale}
              editHref={can('edit') ? editHref(issue, record) : null}
              onReject={
                can('reject') && record.status !== STATUS_REJECTED
                  ? () => onRecordAction({ kind: 'reject', issue, record })
                  : undefined
              }
              onMarkAbsent={
                can('mark_absent') && record.status !== STATUS_ABSENT
                  ? () => onRecordAction({ kind: 'mark_absent', issue, record })
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}

      {issue.machine_punches.length > 0 ? (
        <MachinePunchDays
          issueDate={issue.date}
          punches={issue.machine_punches}
          dayRecords={issue.day_records ?? []}
        />
      ) : null}

      {payrollImpact ? (
        <p className="flex items-start gap-1.5 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">{t('payrollImpact')}: </span>
            {payrollImpact}
          </span>
        </p>
      ) : null}

      {issue.acknowledgement ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          {t('acceptedBy', {
            by: issue.acknowledgement.by ?? '-',
            at: issue.acknowledgement.at ? formatPeriodDate(issue.acknowledgement.at, locale) : '-',
          })}
          {issue.acknowledgement.note ? ` — ${issue.acknowledgement.note}` : ''}
        </p>
      ) : null}

      {canAccept || dayMarkAbsent || can('open_unresolved') ? (
        <footer className="flex flex-wrap gap-2">
          {canAccept ? (
            <Button size="sm" variant="outline" onClick={() => onAccept(issue)}>
              <CheckCircle2 />
              {t('actionAccept')}
            </Button>
          ) : null}
          {dayMarkAbsent ? (
            <Can permission="time_attendance.attendance_records.approval">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRecordAction({ kind: 'mark_absent', issue, record: null })}
              >
                <UserX />
                {t('actionMarkAbsent')}
              </Button>
            </Can>
          ) : null}
          {can('open_unresolved') ? (
            <>
              <Can permission="time_attendance.attendance_records.approval">
                <Button size="sm" onClick={() => onResolveUnresolved(issue)}>
                  <Wrench />
                  {t('actionResolveUnresolved')}
                </Button>
              </Can>
              <Button size="sm" variant="link" className="h-8 px-1 text-xs text-text-secondary" asChild>
                <Link href={unresolvedHref(issue)}>
                  <ExternalLink className="size-3.5" />
                  {t('actionOpenUnresolved')}
                </Link>
              </Button>
            </>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

interface RecordRowProps {
  record: ReviewRecord;
  locale: string;
  editHref: string | null;
  onReject?: () => void;
  onMarkAbsent?: () => void;
}

function RecordRow({ record, locale, editHref, onReject, onMarkAbsent }: RecordRowProps) {
  const t = useTranslations('attendanceReview');
  const status = getStatusAttendance(record.status_label);
  const clockIn = formatLocalDateTime(record.in_local, locale);
  const clockOut = formatLocalDateTime(record.out_local, locale);
  const outBeforeIn = !!record.in_local && !!record.out_local && record.out_local <= record.in_local;
  const sourceLabel = (value: string | null) =>
    value ? (t.has(`source.${value}`) ? t(`source.${value}`) : value) : '-';
  const worked = record.worked_minutes != null ? minutesParts(record.worked_minutes) : null;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">
            <span className={cn(!clockIn && 'text-destructive')}>{clockIn ?? t('noClockIn')}</span>
            <span className="mx-1.5 text-text-secondary">→</span>
            <span className={cn((!clockOut || outBeforeIn) && 'text-destructive')}>
              {clockOut ?? t('noClockOut')}
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            {[
              record.shift?.name ?? t('noShift'),
              t('bookedOn', { date: formatPeriodDate(record.attendance_date, locale) }),
              t('sources', { in: sourceLabel(record.clock_sources.in), out: sourceLabel(record.clock_sources.out) }),
              worked ? t('worked', worked) : null,
              `#${record.id}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
          {record.break_punches.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-text-secondary">{t('breakPunches')}:</span>
              {record.break_punches.map((punch, index) => (
                <Badge key={`${punch.at}-${index}`} variant="outline" className="font-normal">
                  {formatLocalDateTime(punch.at, locale) ?? '-'}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge statusKey={status.key} variant={status.variant} className={status.className} />
          {editHref ? (
            <Can permission="time_attendance.attendance_records.edit">
              <Button size="sm" variant="outline" asChild>
                <Link href={editHref}>
                  <Edit3 />
                  {t('actionEdit')}
                </Link>
              </Button>
            </Can>
          ) : null}
          {onMarkAbsent ? (
            <Can permission="time_attendance.attendance_records.approval">
              <Button size="sm" variant="outline" onClick={onMarkAbsent}>
                <UserX />
                {t('actionMarkAbsent')}
              </Button>
            </Can>
          ) : null}
          {onReject ? (
            <Can permission="time_attendance.attendance_records.approval">
              <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={onReject}>
                <XCircle />
                {t('actionReject')}
              </Button>
            </Can>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const numberParam = (params: Record<string, unknown>, key: string) =>
  typeof params[key] === 'number' ? (params[key] as number) : null;

const stringParam = (params: Record<string, unknown>, key: string) =>
  typeof params[key] === 'string' && params[key] !== '' ? (params[key] as string) : null;

/** Short context lines from the check params (only the ones HR needs to decide). */
function useIssueDetails(issue: AttendanceReviewIssue): string[] {
  const t = useTranslations('attendanceReview');
  const locale = resolveLocale(useLocale());
  const { params } = issue;
  const lines: string[] = [];

  const worked = numberParam(params, 'worked_minutes');
  if (worked != null) lines.push(t('detailWorked', minutesParts(worked)));

  const overtime = numberParam(params, 'overtime_minutes');
  if (overtime != null) lines.push(t('detailOvertime', minutesParts(overtime)));

  const requested = numberParam(params, 'requested_minutes');
  if (requested != null) lines.push(t('detailRequestedOvertime', minutesParts(requested)));

  const punchCount = numberParam(params, 'punch_count');
  if (punchCount != null) lines.push(t('detailPunchCount', { count: punchCount }));

  const pin = stringParam(params, 'pin');
  if (pin) lines.push(t('detailPin', { pin, name: stringParam(params, 'name_on_machine') ?? '-' }));

  const scheduledStart = stringParam(params, 'scheduled_start_local');
  const scheduledEnd = stringParam(params, 'scheduled_end_local');
  if (scheduledStart && scheduledEnd) {
    lines.push(
      t('detailScheduled', {
        shift: stringParam(params, 'shift') ?? '-',
        start: formatLocalDateTime(scheduledStart, locale) ?? scheduledStart,
        end: formatLocalDateTime(scheduledEnd, locale) ?? scheduledEnd,
      }),
    );
  }

  const editedBy = stringParam(params, 'edited_by');
  if (editedBy) {
    const editedAt = stringParam(params, 'edited_at');
    lines.push(t('detailEditedBy', { by: editedBy, at: editedAt ? formatPeriodDate(editedAt, locale) : '-' }));
  }

  const joinDate = stringParam(params, 'join_date');
  const lastWorkingDate = stringParam(params, 'last_working_date');
  if (issue.code === 'outside_employment') {
    lines.push(
      t('detailEmployment', {
        join: joinDate ? formatPeriodDate(joinDate, locale) : '-',
        last: lastWorkingDate ? formatPeriodDate(lastWorkingDate, locale) : '-',
      }),
    );
  }

  if (Array.isArray(params.hints)) {
    params.hints
      .filter((hint): hint is string => typeof hint === 'string')
      .forEach((hint) => lines.push(t.has(`hint.${hint}`) ? t(`hint.${hint}`) : hint));
  }

  return lines;
}
