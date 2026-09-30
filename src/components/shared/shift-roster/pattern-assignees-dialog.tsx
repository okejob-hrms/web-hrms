'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ShiftPatternAssignment } from '@/services/shift-roster';
import { formatDate, isAssignmentActive } from './utils';

type PatternAssigneesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patternName: string;
  rows: ShiftPatternAssignment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  canEnd: boolean;
  isEnding: boolean;
  onEnd: (assignmentId: number, effectiveTo: string) => void;
  minEndDate?: string;
};

export function PatternAssigneesDialog({
  open,
  onOpenChange,
  patternName,
  rows,
  isLoading,
  isError,
  canEnd,
  isEnding,
  onEnd,
  minEndDate,
}: PatternAssigneesDialogProps) {
  const t = useTranslations('settings.shiftPatterns');
  const [endDateById, setEndDateById] = React.useState<Record<number, string>>({});
  const defaultEnd = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  React.useEffect(() => {
    if (open) setEndDateById({});
  }, [open]);

  const message = (text: string, className = 'text-text-secondary') => (
    <TableRow>
      <TableCell colSpan={6} className={`text-center ${className}`}>
        {text}
      </TableCell>
    </TableRow>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{t('assigneesTitle', { name: patternName })}</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employee')}</TableHead>
                <TableHead>{t('anchorDate')}</TableHead>
                <TableHead>{t('effectiveFrom')}</TableHead>
                <TableHead>{t('effectiveToCol')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && message(t('loadingAssignees'))}
              {isError && message(t('loadAssigneesFailed'), 'text-destructive')}
              {!isLoading && !isError && !rows?.length && message(t('noAssignees'))}
              {rows?.map((row) => {
                const active = isAssignmentActive(row.effective_to);
                const startsOn = row.effective_from.slice(0, 10);
                const rowDefaultEnd = startsOn > defaultEnd ? startsOn : defaultEnd;
                const rowMinEnd = minEndDate && minEndDate > startsOn ? minEndDate : startsOn;
                const endValue = endDateById[row.id] ?? rowDefaultEnd;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.employee?.user?.name ?? t('unknownEmployee')}
                      {row.employee?.code ? (
                        <span className="block text-xs text-text-secondary">{row.employee.code}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{formatDate(row.anchor_date)}</TableCell>
                    <TableCell>{formatDate(row.effective_from)}</TableCell>
                    <TableCell>{formatDate(row.effective_to)}</TableCell>
                    <TableCell>
                      <Badge variant={active ? 'secondary' : 'outline'}>
                        {active ? t('active') : t('ended')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {active && canEnd ? (
                        <div className="inline-flex items-center gap-2">
                          <Input
                            type="date"
                            className="h-8 w-35"
                            min={rowMinEnd}
                            value={endValue}
                            onChange={(e) =>
                              setEndDateById((prev) => ({ ...prev, [row.id]: e.target.value || rowDefaultEnd }))
                            }
                            aria-label={t('endOn')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isEnding}
                            onClick={() => onEnd(row.id, endValue)}
                          >
                            {t('endAssignment')}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-text-secondary">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
