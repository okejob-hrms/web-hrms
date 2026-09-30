'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ellipsis, Plus, RefreshCw, Trash, UserPlus, Users, Edit3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { PatternAssignDialog } from '@/components/shared/shift-roster/pattern-assign-dialog';
import { PatternAssigneesDialog } from '@/components/shared/shift-roster/pattern-assignees-dialog';
import { PatternEditorDialog } from '@/components/shared/shift-roster/pattern-editor-dialog';
import { getErrorMessage, toShiftOptions } from '@/components/shared/shift-roster/utils';
import { usePermissionStore } from '@/hooks/use-permission-store';
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
} from '@/services/shift-roster';

export default function SettingsShiftPatterns() {
  const t = useTranslations('settings.shiftPatterns');
  const qc = useQueryClient();
  const canEditPerm = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const [branchFilter, setBranchFilter] = React.useState('');
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ShiftPattern | null>(null);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignPatternId, setAssignPatternId] = React.useState<number | null>(null);
  const [employeeSearch, setEmployeeSearch] = React.useState('');
  const [assigneesOpen, setAssigneesOpen] = React.useState(false);
  const [assigneesPattern, setAssigneesPattern] = React.useState<ShiftPattern | null>(null);

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
    mutationFn: async (payload: Parameters<typeof createShiftPattern>[0]) => {
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
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const endAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, effective_to }: { assignmentId: number; effective_to?: string }) =>
      endShiftPatternAssignment(assignmentId, { effective_to }),
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
    setEditorOpen(true);
  };

  const openEdit = (pattern: ShiftPattern) => {
    setEditing(pattern);
    setEditorOpen(true);
  };

  const openAssignees = (pattern: ShiftPattern) => {
    setAssigneesPattern(pattern);
    setAssigneesOpen(true);
  };

  const branchOptions =
    branchesQuery.data?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const shiftOptions = toShiftOptions(shiftsQuery.data as Array<{ id: number; name: string }> | undefined);

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
              <TableHead>{t('owner')}</TableHead>
              <TableHead>{t('cycle')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!patternsQuery.data?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-secondary">
                  {t('empty')}
                </TableCell>
              </TableRow>
            )}
            {patternsQuery.data?.map((pattern) => (
              <TableRow key={pattern.id}>
                <TableCell className="font-medium">{pattern.name}</TableCell>
                <TableCell>{pattern.branch?.name ?? t('tenantWide')}</TableCell>
                <TableCell>
                  {pattern.owner_employee_id
                    ? t('ownerSupervisor', { name: pattern.owner?.user?.name ?? '—' })
                    : t('ownerHr')}
                </TableCell>
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
                        <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(pattern), 0)}>
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
                          onSelect={() => regenerateMutation.mutate({ pattern_id: pattern.id, days: 60 })}
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

      <PatternEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        shiftOptions={shiftOptions}
        branchOptions={branchOptions}
        defaultBranchId={branchFilter}
        isPending={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <PatternAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        employees={employeesQuery.data ?? []}
        search={{ value: employeeSearch, onChange: setEmployeeSearch }}
        isPending={assignMutation.isPending}
        onSubmit={(payload) =>
          assignPatternId && assignMutation.mutate({ pattern_id: assignPatternId, ...payload })
        }
      />

      <PatternAssigneesDialog
        open={assigneesOpen}
        onOpenChange={setAssigneesOpen}
        patternName={assigneesPattern?.name ?? ''}
        rows={assigneesQuery.data}
        isLoading={assigneesQuery.isLoading}
        isError={assigneesQuery.isError}
        canEnd={canEditPerm}
        isEnding={endAssignmentMutation.isPending}
        onEnd={(assignmentId, effectiveTo) =>
          endAssignmentMutation.mutate({ assignmentId, effective_to: effectiveTo })
        }
      />
    </div>
  );
}
