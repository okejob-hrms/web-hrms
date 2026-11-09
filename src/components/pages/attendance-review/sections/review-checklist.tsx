'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReviewChecklistProps {
  blockersOpen: number;
  warningsOpen: number;
  approvable: number;
  waiting: number;
  approveDisabled?: boolean;
  onFixBlockers?: () => void;
  onCheckWarnings?: () => void;
  onApprove?: () => void;
}

export function ReviewChecklist({
  blockersOpen,
  warningsOpen,
  approvable,
  waiting,
  approveDisabled,
  onFixBlockers,
  onCheckWarnings,
  onApprove,
}: ReviewChecklistProps) {
  const t = useTranslations('attendanceReview');
  const approveDone = waiting === 0;
  const canApprove = !!onApprove && approvable > 0 && !approveDisabled;
  const approveTitle = t('footerWaiting', { waiting, approvable });

  return (
    <nav aria-label={t('checklistTitle')} className="rounded-md border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{t('checklistTitle')}</h2>
      <ol className="grid gap-2 md:grid-cols-3">
        <li>
          <ChecklistStep
            index={1}
            label={t('checklistFixBlockers', { count: blockersOpen })}
            done={blockersOpen === 0}
            onClick={blockersOpen > 0 ? onFixBlockers : undefined}
          />
        </li>
        <li>
          <ChecklistStep
            index={2}
            label={t('checklistCheckWarnings', { count: warningsOpen })}
            done={warningsOpen === 0}
            onClick={warningsOpen > 0 ? onCheckWarnings : undefined}
          />
        </li>
        <li>
          {/* Wrap so hover title still works when the button is disabled */}
          <span className="block w-full" title={approveTitle}>
            <Button
              type="button"
              size="default"
              disabled={!canApprove}
              onClick={canApprove ? onApprove : undefined}
              className={cn(
                'h-auto w-full justify-start gap-2 px-2 py-2 font-medium',
                approveDone && 'bg-green-600 hover:bg-green-600 disabled:opacity-100',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  approveDone
                    ? 'bg-white/20 text-white'
                    : 'bg-primary-foreground/20 text-primary-foreground',
                )}
                aria-hidden
              >
                {approveDone ? <Check className="size-3.5" /> : 3}
              </span>
              <span className="text-left text-sm">
                {t('checklistApprove', { count: approvable })}
              </span>
            </Button>
          </span>
        </li>
      </ol>
    </nav>
  );
}

interface ChecklistStepProps {
  index: number;
  label: string;
  done: boolean;
  onClick?: () => void;
}

function ChecklistStep({ index, label, done, onClick }: ChecklistStepProps) {
  const content = (
    <>
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          done ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary',
        )}
        aria-hidden
      >
        {done ? <Check className="size-3.5" /> : index}
      </span>
      <span className={cn('text-sm', done && 'text-text-secondary line-through')}>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-md border border-gray-200 p-2 text-left hover:bg-gray-50"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-2 rounded-md border border-gray-100 p-2">{content}</div>;
}
