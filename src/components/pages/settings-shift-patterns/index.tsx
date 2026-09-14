'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { HTTPError } from 'ky';
import { Ellipsis, Plus, RefreshCw, Search, Trash, UserPlus, Users, Edit3 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { ApiErrorResponse } from '@/lib/types';
import { getEmployees } from '@/services/employees';
import { getBranches, getShift } from '@/services/settings';
import {
  assignShiftPattern,
  createShiftPattern,
  deleteShiftPattern,
  endShiftPatternAssignment,
  getShiftPatternAssignments,
  getShiftPatterns,
  regenerateShiftPatterns,
  updateShiftPattern,
  type ShiftPattern,
  type ShiftPatternAssignment,
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

type DayDraft = { day_index: number; shift_id: string };

function emptyDays(cycle: number): DayDraft[] {
  return Array.from({ length: cycle }, (_, i) => ({ day_index: i, shift_id: '' }));
}

export default function SettingsShiftPatterns() {
  const t = useTranslations('settings.shiftPatterns');
  const qc = useQueryClient();
  const [branchFilter, setBranchFilter] = React.useState('');
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ShiftPattern | null>(null);
  const [name, setName] = React.useState('');
  const [branchId, setBranchId] = React.useState('');
  const [cycle, setCycle] = React.useState(7);
  const [days, setDays] = React.useState<DayDraft[]>(emptyDays(7));
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignPatternId, setAssignPatternId] = React.useState<number | null>(null);
  const [employeeSearch, setEmployeeSearch] = React.useState('');
  const [selectedEmployees, setSelectedEmployees] = React.useState<number[]>([]);
  const [anchorDate, setAnchorDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [effectiveFrom, setEffectiveFrom] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [effectiveTo, setEffectiveTo] = React.useState('');
  const [assigneesOpen, setAssigneesOpen] = React.useState(false);
  const [assigneesPattern, setAssigneesPattern] = React.useState<ShiftPattern | null>(null);
  const [endDateById, setEndDateById] = React.useState<Record<number, string>>({});

  const branchesQuery = useQuery({
    queryKey: ['branches', 'patterns'],
    queryFn: async () => (await getBranches()).data ?? [],
  });

  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => (await getShift()).data ?? [],
  });

  const patternsQuery = useQuery({
    queryKey: ['shift-patterns', branchFilter],
    queryFn: async () =>
      (await getShiftPatterns(branchFilter ? Number(branchFilter) : undefined)).data ?? [],
  });

  const employeesQuery = useQuery({
    queryKey: ['employees', 'pattern-assign', employeeSearch],
    queryFn: async () => {
      const res = await getEmployees({
        search: employeeSearch || undefined,
        per_page: 50,
        status: '1',
      });
      return res.data?.data ?? [];
    },
    enabled: assignOpen,
  });

  const assigneesQuery = useQuery({
    queryKey: ['shift-pattern-assignments', assigneesPattern?.id],
    queryFn: async ({ queryKey }) => {
      const patternId = queryKey[1] as number;
      return (await getShiftPatternAssignments(patternId)).data ?? [];
    },
    enabled: assigneesOpen && !!assigneesPattern?.id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['shift-patterns'] });
    qc.invalidateQueries({ queryKey: ['shift-pattern-assignments'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        branch_id: branchId ? Number(branchId) : null,
        cycle_length_days: cycle,
        is_active: true,
        days: days.map((d) => ({
          day_index: d.day_index,
          shift_id: d.shift_id ? Number(d.shift_id) : null,
        })),
      };
      if (editing) return updateShiftPattern(editing.id, payload);
      return createShiftPattern(payload);
    },
    onSuccess: () => {
      toast.success(t('saved'));
      setEditorOpen(false);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShiftPattern,
    onSuccess: () => {
      toast.success(t('deleted'));
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const assignMutation = useMutation({
    mutationFn: assignShiftPattern,
    onSuccess: () => {
      toast.success(t('assigned'));
      setAssignOpen(false);
      setSelectedEmployees([]);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const endAssignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      effective_to,
    }: {
      assignmentId: number;
      effective_to?: string;
    }) => endShiftPatternAssignment(assignmentId, { effective_to }),
    onSuccess: () => {
      toast.success(t('assignmentEnded'));
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const regenerateMutation = useMutation({
    mutationFn: regenerateShiftPatterns,
    onSuccess: () => toast.success(t('regenerated')),
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const openCreate = () => {
    setEditing(null);
    setName('');
    setBranchId(branchFilter);
    setCycle(7);
    setDays(emptyDays(7));
    setEditorOpen(true);
  };

  const openEdit = (pattern: ShiftPattern) => {
    setEditing(pattern);
    setName(pattern.name);
    setBranchId(pattern.branch_id ? String(pattern.branch_id) : '');
    setCycle(pattern.cycle_length_days);
    setDays(
      Array.from({ length: pattern.cycle_length_days }, (_, i) => {
        const day = pattern.days.find((d) => d.day_index === i);
        return { day_index: i, shift_id: day?.shift_id ? String(day.shift_id) : '' };
      }),
    );
    setEditorOpen(true);
  };

  const openAssignees = (pattern: ShiftPattern) => {
    setAssigneesPattern(pattern);
    setEndDateById({});
    setAssigneesOpen(true);
  };

  const isAssignmentActive = (row: ShiftPatternAssignment) => {
    if (!row.effective_to) return true;
    return dayjs(row.effective_to).isSame(dayjs(), 'day') || dayjs(row.effective_to).isAfter(dayjs(), 'day');
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const raw = String(value).slice(0, 10);
    return dayjs(raw).isValid() ? dayjs(raw).format('YYYY-MM-DD') : raw;
  };

  const branchOptions =
    branchesQuery.data?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const shiftOptions = [
    { value: '', label: t('dayOff') },
    ...(shiftsQuery.data?.map((s: { id: number; name: string }) => ({
      value: String(s.id),
      label: s.name,
    })) ?? []),
  ];

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl">{t('title')}</h2>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="time_attendance.attendance_configuration.edit">
            <Button
              variant="outline"
              onClick={() =>
                regenerateMutation.mutate({
                  branch_id: branchFilter ? Number(branchFilter) : undefined,
                  days: 60,
                })
              }
            >
              {t('regenerate')}
            </Button>
          </Can>
          <Can permission="time_attendance.attendance_configuration.create">
            <Button className="flex flex-row items-center gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('create')}
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('filterBranch')}</Label>
          <SearchableSelect
            options={[{ value: '', label: t('allBranches') }, ...branchOptions]}
            value={branchFilter}
            onValueChange={(v) => setBranchFilter(String(v ?? ''))}
            placeholder={t('filterBranch')}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('branch')}</TableHead>
              <TableHead>{t('cycle')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!patternsQuery.data?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary">
                  {t('empty')}
                </TableCell>
              </TableRow>
            )}
            {patternsQuery.data?.map((pattern) => (
              <TableRow key={pattern.id}>
                <TableCell className="font-medium">{pattern.name}</TableCell>
                <TableCell>{pattern.branch?.name ?? t('tenantWide')}</TableCell>
                <TableCell>{pattern.cycle_length_days}</TableCell>
                <TableCell>
                  <Badge variant={pattern.is_active ? 'secondary' : 'outline'}>
                    {pattern.is_active ? t('active') : t('inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Ellipsis className="text-grayscale-30" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Can permission="time_attendance.attendance_configuration.view">
                        <DropdownMenuItem
                          onSelect={() => {
                            // Defer so Radix menu teardown does not cancel the dialog open.
                            setTimeout(() => openAssignees(pattern), 0);
                          }}
                        >
                          <Users />
                          {t('assignees')}
                        </DropdownMenuItem>
                      </Can>
                      <Can permission="time_attendance.attendance_configuration.edit">
                        <DropdownMenuItem
                          onSelect={() => {
                            setTimeout(() => openEdit(pattern), 0);
                          }}
                        >
                          <Edit3 />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setTimeout(() => {
                              setAssignPatternId(pattern.id);
                              setAssignOpen(true);
                            }, 0);
                          }}
                        >
                          <UserPlus />
                          {t('assign')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            regenerateMutation.mutate({
                              pattern_id: pattern.id,
                              days: 60,
                            })
                          }
                        >
                          <RefreshCw />
                          {t('regenerate')}
                        </DropdownMenuItem>
                      </Can>
                      <Can permission="time_attendance.attendance_configuration.delete">
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => deleteMutation.mutate(pattern.id)}
                        >
                          <Trash />
                          {t('delete')}
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') : t('create')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('branch')}</Label>
              <SearchableSelect
                options={[{ value: '', label: t('tenantWide') }, ...branchOptions]}
                value={branchId}
                onValueChange={(v) => setBranchId(String(v ?? ''))}
              />
            </div>
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
                  setDays((prev) => {
                    const nextDays = emptyDays(next);
                    return nextDays.map((d) => prev.find((p) => p.day_index === d.day_index) ?? d);
                  });
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
                      options={shiftOptions}
                      value={day.shift_id}
                      onValueChange={(v) =>
                        setDays((prev) =>
                          prev.map((d) =>
                            d.day_index === day.day_index
                              ? { ...d, shift_id: String(v ?? '') }
                              : d,
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
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              {t('cancel')}
            </Button>
            <Button disabled={saveMutation.isPending || !name} onClick={() => saveMutation.mutate()}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
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
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
            </div>
            <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-3">
              {employeesQuery.data?.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedEmployees.includes(emp.id)}
                    onCheckedChange={(checked) =>
                      setSelectedEmployees((prev) =>
                        checked === true
                          ? [...prev, emp.id]
                          : prev.filter((x) => x !== emp.id),
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
              />
              <BasicDatePicker
                label={t('effectiveTo')}
                value={strToDate(effectiveTo)}
                onSelect={(d) => setEffectiveTo(dateToStr(d))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={!assignPatternId || !selectedEmployees.length || assignMutation.isPending}
              onClick={() =>
                assignMutation.mutate({
                  pattern_id: assignPatternId!,
                  employee_ids: selectedEmployees,
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

      <Dialog open={assigneesOpen} onOpenChange={setAssigneesOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {t('assigneesTitle', { name: assigneesPattern?.name ?? '' })}
            </DialogTitle>
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
                {assigneesQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-secondary">
                      {t('loadingAssignees')}
                    </TableCell>
                  </TableRow>
                )}
                {assigneesQuery.isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      {t('loadAssigneesFailed')}
                    </TableCell>
                  </TableRow>
                )}
                {!assigneesQuery.isLoading &&
                  !assigneesQuery.isError &&
                  !assigneesQuery.data?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-secondary">
                      {t('noAssignees')}
                    </TableCell>
                  </TableRow>
                )}
                {assigneesQuery.data?.map((row) => {
                  const active = isAssignmentActive(row);
                  const employeeName =
                    row.employee?.user?.name ?? t('unknownEmployee');
                  const code = row.employee?.code;
                  const defaultEnd = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
                  const endValue = endDateById[row.id] ?? defaultEnd;

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {employeeName}
                        {code ? (
                          <span className="block text-xs text-text-secondary">{code}</span>
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
                        {active ? (
                          <Can permission="time_attendance.attendance_configuration.edit">
                            <div className="inline-flex items-center gap-2">
                              <Input
                                type="date"
                                className="h-8 w-35"
                                value={endValue}
                                onChange={(e) =>
                                  setEndDateById((prev) => ({
                                    ...prev,
                                    [row.id]: e.target.value || defaultEnd,
                                  }))
                                }
                                aria-label={t('endOn')}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={endAssignmentMutation.isPending}
                                onClick={() =>
                                  endAssignmentMutation.mutate({
                                    assignmentId: row.id,
                                    effective_to: endValue,
                                  })
                                }
                              >
                                {t('endAssignment')}
                              </Button>
                            </div>
                          </Can>
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
            <Button variant="outline" onClick={() => setAssigneesOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
