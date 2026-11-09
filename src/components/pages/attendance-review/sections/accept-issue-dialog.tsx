'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPeriodDateWithWeekday } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import type { AttendanceReviewIssue } from '@/services/attendance-review/types';
import { issueTitle } from './check-labels';

const NOTE_MIN_LENGTH = 3;

interface AcceptIssueDialogProps {
  /** Remount with `key={issue_key}` so the note starts empty for each issue. */
  issue: AttendanceReviewIssue | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function AcceptIssueDialog({ issue, isPending, onClose, onConfirm }: AcceptIssueDialogProps) {
  const t = useTranslations('attendanceReview');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const [note, setNote] = React.useState('');
  const valid = note.trim().length >= NOTE_MIN_LENGTH;

  return (
    <Dialog open={!!issue} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !isPending) onConfirm(note.trim());
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('acceptTitle')}</DialogTitle>
            <DialogDescription>
              {[
                issue ? issueTitle(t, issue) : null,
                issue?.employee?.name,
                issue?.date ? formatPeriodDateWithWeekday(issue.date, locale) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="attendance-review-accept-note">{t('acceptNoteLabel')}</Label>
            <Textarea
              id="attendance-review-accept-note"
              value={note}
              maxLength={500}
              autoFocus
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('acceptNotePlaceholder')}
            />
            {note !== '' && !valid ? (
              <p className="text-xs text-destructive">{t('acceptNoteTooShort', { min: NOTE_MIN_LENGTH })}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={!valid || isPending}>
              {isPending ? tCommon('processing') : t('actionAccept')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
