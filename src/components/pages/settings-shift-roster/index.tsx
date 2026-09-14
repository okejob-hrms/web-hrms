'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { HTTPError } from 'ky';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { usePermissionStore } from '@/hooks/use-permission-store';
import type { ApiErrorResponse } from '@/lib/types';
import { getBranches, getShift } from '@/services/settings';
import {
  bulkAssignRoster,
  getRosterCalendar,
  reresolveRoster,
  setRosterCell,
  type RosterCell,
} from '@/services/shift-roster';

async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse;
      if (errorData.message) return errorData.message;
    } catch {
      // fall through
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function dateToStr(d: Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

function strToDate(s: string): Date | undefined {
  return s ? dayjs(s).toDate() : undefined;
}

type CellTarget = {
  employeeId: number;
  employeeName: string;
  date: string;
  cells: RosterCell[];
};

export default function SettingsShiftRoster() {
  const t = useTranslations('settings.shiftRoster');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const qc = useQueryClient();

  const [branchId, setBranchId] = React.useState<string>('');
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [cellTarget, setCellTarget] = React.useState<CellTarget | null>(null);
  const [cellMode, setCellMode] = React.useState<'shift' | 'off' | 'clear'>('shift');
  const [cellShiftId, setCellShiftId] = React.useState<string>('');
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkEmployeeIds, setBulkEmployeeIds] = React.useState<number[]>([]);
  const [bulkFrom, setBulkFrom] = React.useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [bulkTo, setBulkTo] = React.useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [bulkShiftId, setBulkShiftId] = React.useState<string>('');
  const [bulkDayOff, setBulkDayOff] = React.useState(false);
  const [bulkConflict, setBulkConflict] = React.useState<'skip' | 'overwrite'>('skip');

  const branchesQuery = useQuery({
    queryKey: ['branches', 'roster'],
    queryFn: async () => {
      const res = await getBranches();
      return res.data ?? [];
    },
  });

  React.useEffect(() => {
    if (!branchId && branchesQuery.data?.length) {
      setBranchId(String(branchesQuery.data[0].id));
    }
  }, [branchId, branchesQuery.data]);

  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => (await getShift()).data ?? [],
  });

  const calendarQuery = useQuery({
    queryKey: ['shift-roster', branchId, month],
    queryFn: async () => (await getRosterCalendar(Number(branchId), month)).data,
    enabled: Boolean(branchId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['shift-roster'] });

  const setCellMutation = useMutation({
    mutationFn: setRosterCell,
    onSuccess: () => {
      toast.success(t('cellUpdated'));
      setCellTarget(null);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAssignRoster,
    onSuccess: (res) => {
      const conflicts = res.data?.conflicts?.length ?? 0;
      toast.success(t('bulkDone', { created: res.data?.created ?? 0, conflicts }));
      setBulkOpen(false);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const reresolveMutation = useMutation({
    mutationFn: reresolveRoster,
    onSuccess: () => toast.success(t('reresolveDone')),
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const branchOptions =
    branchesQuery.data?.map((b) => ({
      value: String(b.id),
      label: b.name,
    })) ?? [];

  const shiftOptions =
    shiftsQuery.data?.map((s: { id: number; name: string }) => ({
      value: String(s.id),
      label: s.name,
    })) ?? [];

  const openCell = (employeeId: number, employeeName: string, date: string, cells: RosterCell[]) => {
    if (!canEdit) return;
    setCellTarget({ employeeId, employeeName, date, cells });
    setCellMode(cells.some((c) => c.is_day_off) ? 'off' : 'shift');
    setCellShiftId(cells[0]?.shift_id ? String(cells[0].shift_id) : '');
  };

  const saveCell = () => {
    if (!cellTarget) return;
    if (cellMode === 'clear') {
      setCellMutation.mutate({
        employee_id: cellTarget.employeeId,
        date: cellTarget.date,
        clear: true,
      });
      return;
    }
    if (cellMode === 'off') {
      setCellMutation.mutate({
        employee_id: cellTarget.employeeId,
        date: cellTarget.date,
        is_day_off: true,
        shift_id: null,
      });
      return;
    }
    if (!cellShiftId) {
      toast.error(t('shiftRequired'));
      return;
    }
    setCellMutation.mutate({
      employee_id: cellTarget.employeeId,
      date: cellTarget.date,
      shift_id: Number(cellShiftId),
      is_day_off: false,
    });
  };

  const calendar = calendarQuery.data;

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl">{t('title')}</h2>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <Can permission="time_attendance.attendance_configuration.edit">
          <Button onClick={() => setBulkOpen(true)}>{t('bulkAssign')}</Button>
        </Can>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('branch')}</Label>
          <SearchableSelect
            options={branchOptions}
            value={branchId}
            onValueChange={(v) => setBranchId(String(v ?? ''))}
            placeholder={t('selectBranch')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('month')}</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {calendarQuery.isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('loadFailed')}
        </div>
      ) : null}

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-[180px] bg-white">
                {t('employee')}
              </TableHead>
              {calendar?.dates.map((date) => (
                <TableHead key={date} className="min-w-[88px] text-center text-xs">
                  {dayjs(date).format('DD')}
                  <div className="font-normal text-text-secondary">{dayjs(date).format('ddd')}</div>
                </TableHead>
              ))}
              <TableHead className="sticky right-0 z-10 min-w-[120px] bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!calendar?.employees.length && (
              <TableRow>
                <TableCell colSpan={(calendar?.dates.length ?? 0) + 2} className="text-center text-text-secondary">
                  {t('noEmployees')}
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
                    ? cells.map((c) => c.shift_name ?? (c.is_day_off ? 'Off' : '—')).join(', ')
                    : '';
                  const source = cells[0]?.source;
                  return (
                    <TableCell
                      key={date}
                      className={`text-center text-xs ${canEdit ? 'cursor-pointer hover:bg-muted/60' : ''}`}
                      onClick={() =>
                        openCell(employee.id, employee.name ?? String(employee.id), date, cells)
                      }
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{label || '·'}</span>
                        {source ? (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase">
                            {source === 'manual' ? 'M' : source === 'pattern' ? 'P' : source[0]}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="sticky right-0 z-10 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  <Can permission="time_attendance.attendance_configuration.edit">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reresolveMutation.isPending}
                      onClick={() =>
                        reresolveMutation.mutate({
                          employee_id: employee.id,
                          from: dayjs(month).startOf('month').format('YYYY-MM-DD'),
                          to: dayjs(month).endOf('month').format('YYYY-MM-DD'),
                        })
                      }
                    >
                      {t('reresolve')}
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(cellTarget)} onOpenChange={(open) => !open && setCellTarget(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('editCell')}</DialogTitle>
          </DialogHeader>
          {cellTarget && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                {cellTarget.employeeName} · {cellTarget.date}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={cellMode === 'shift' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCellMode('shift')}
                >
                  {t('setShift')}
                </Button>
                <Button
                  variant={cellMode === 'off' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCellMode('off')}
                >
                  {t('setDayOff')}
                </Button>
                <Button
                  variant={cellMode === 'clear' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCellMode('clear')}
                >
                  {t('clearManual')}
                </Button>
              </div>
              {cellMode === 'shift' && (
                <div className="space-y-2">
                  <Label>{t('selectShift')}</Label>
                  <SearchableSelect
                    options={shiftOptions}
                    value={cellShiftId}
                    onValueChange={(v) => setCellShiftId(String(v ?? ''))}
                    placeholder={t('selectShift')}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCellTarget(null)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveCell} disabled={setCellMutation.isPending}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>{t('bulkAssign')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-3">
              {calendar?.employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={bulkEmployeeIds.includes(e.id)}
                    onCheckedChange={(checked) => {
                      setBulkEmployeeIds((prev) =>
                        checked === true ? [...prev, e.id] : prev.filter((id) => id !== e.id),
                      );
                    }}
                  />
                  <span>{e.name}</span>
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <BasicDatePicker
                label={t('from')}
                value={strToDate(bulkFrom)}
                onSelect={(d) => setBulkFrom(dateToStr(d))}
              />
              <BasicDatePicker
                label={t('to')}
                value={strToDate(bulkTo)}
                onSelect={(d) => setBulkTo(dateToStr(d))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={bulkDayOff}
                onCheckedChange={(checked) => setBulkDayOff(checked === true)}
              />
              <span>{t('setDayOff')}</span>
            </label>
            {!bulkDayOff && (
              <div className="space-y-2">
                <Label>{t('selectShift')}</Label>
                <SearchableSelect
                  options={shiftOptions}
                  value={bulkShiftId}
                  onValueChange={(v) => setBulkShiftId(String(v ?? ''))}
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
                value={bulkConflict}
                onValueChange={(v) => setBulkConflict((v as 'skip' | 'overwrite') || 'skip')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={bulkMutation.isPending || !bulkEmployeeIds.length}
              onClick={() => {
                if (!bulkDayOff && !bulkShiftId) {
                  toast.error(t('shiftRequired'));
                  return;
                }
                bulkMutation.mutate({
                  employee_ids: bulkEmployeeIds,
                  from: bulkFrom,
                  to: bulkTo,
                  shift_id: bulkDayOff ? null : Number(bulkShiftId),
                  is_day_off: bulkDayOff,
                  on_conflict: bulkConflict,
                });
              }}
            >
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
