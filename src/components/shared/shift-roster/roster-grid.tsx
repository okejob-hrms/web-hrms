'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RosterCalendar, RosterCell } from '@/services/shift-roster';

export type RosterEmployee = RosterCalendar['employees'][number];

type RosterGridProps = {
  calendar: RosterCalendar | undefined;
  isLoading?: boolean;
  emptyLabel?: string;
  isCellEditable: (date: string) => boolean;
  onCellClick: (employee: RosterEmployee, date: string, cells: RosterCell[]) => void;
  renderActions?: (employee: RosterEmployee) => React.ReactNode;
};

const stickyRight =
  'sticky right-0 z-10 min-w-[120px] bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]';

function lastChangedTitle(cells: RosterCell[], label: (name: string, at: string) => string) {
  const latest = [...cells]
    .filter((c) => c.updated_by_name)
    .sort((a, b) => String(b.updated_at ?? '').localeCompare(String(a.updated_at ?? '')))[0];
  if (!latest?.updated_by_name) return undefined;
  const at = latest.updated_at ? dayjs(latest.updated_at).format('YYYY-MM-DD HH:mm') : '';
  return label(latest.updated_by_name, at);
}

export function RosterGrid({
  calendar,
  isLoading,
  emptyLabel,
  isCellEditable,
  onCellClick,
  renderActions,
}: RosterGridProps) {
  const t = useTranslations('settings.shiftRoster');

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 min-w-[180px] bg-white">{t('employee')}</TableHead>
            {calendar?.dates.map((date) => (
              <TableHead key={date} className="min-w-[88px] text-center text-xs">
                {dayjs(date).format('DD')}
                <div className="font-normal text-text-secondary">{dayjs(date).format('ddd')}</div>
              </TableHead>
            ))}
            {renderActions ? <TableHead className={stickyRight}>{t('actions')}</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!calendar?.employees.length && (
            <TableRow>
              <TableCell
                colSpan={(calendar?.dates.length ?? 0) + (renderActions ? 2 : 1)}
                className="text-center text-text-secondary"
              >
                {isLoading ? t('loading') : (emptyLabel ?? t('noEmployees'))}
              </TableCell>
            </TableRow>
          )}
          {calendar?.employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="sticky left-0 z-10 bg-white font-medium">
                <div>{employee.name ?? '—'}</div>
                <div className="text-xs text-text-secondary">{employee.code}</div>
              </TableCell>
              {calendar.dates.map((date) => {
                const cells = calendar.cells?.[employee.id]?.[date] ?? [];
                const label = cells.length
                  ? cells.map((c) => c.shift_name ?? (c.is_day_off ? t('off') : '—')).join(', ')
                  : '';
                const source = cells[0]?.source;
                const editable = isCellEditable(date);
                return (
                  <TableCell
                    key={date}
                    title={lastChangedTitle(cells, (name, at) => t('lastChangedBy', { name, at }))}
                    className={`text-center text-xs ${
                      editable ? 'cursor-pointer hover:bg-muted/60' : 'bg-muted/30 text-text-secondary'
                    }`}
                    onClick={() => editable && onCellClick(employee, date, cells)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{label || '·'}</span>
                      {source ? (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase">
                          {source === 'manual' ? 'M' : source === 'roster' ? 'R' : source[0]}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                );
              })}
              {renderActions ? (
                <TableCell className={stickyRight}>{renderActions(employee)}</TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
