'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Edit3, Ellipsis, Plus, Trash, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatternAssignDialog } from '@/components/shared/shift-roster/pattern-assign-dialog';
import { PatternAssigneesDialog } from '@/components/shared/shift-roster/pattern-assignees-dialog';
import { PatternEditorDialog } from '@/components/shared/shift-roster/pattern-editor-dialog';
import { RosterBulkDialog } from '@/components/shared/shift-roster/roster-bulk-dialog';
import {
  RosterCellDialog,
  type RosterCellTarget,
} from '@/components/shared/shift-roster/roster-cell-dialog';
import { RosterGrid } from '@/components/shared/shift-roster/roster-grid';
import { getErrorMessage, toShiftOptions } from '@/components/shared/shift-roster/utils';
import {
  assignTeamPattern,
  bulkAssignTeamRoster,
  createTeamPattern,
  deleteTeamPattern,
  endTeamPatternAssignment,
  getTeamPatternAssignments,
  getTeamPatterns,
  getTeamRoster,
  getTeamRosterMeta,
  setTeamRosterCell,
  updateTeamPattern,
} from '@/services/ess/team-roster';
import type { ShiftPattern } from '@/services/shift-roster';

export const SectionTeamRoster = () => {
  const t = useTranslations('ess.teamRoster');
  const qc = useQueryClient();
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [cellTarget, setCellTarget] = React.useState<RosterCellTarget | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ShiftPattern | null>(null);
  const [assignPattern, setAssignPattern] = React.useState<ShiftPattern | null>(null);
  const [assigneesPattern, setAssigneesPattern] = React.useState<ShiftPattern | null>(null);

  const metaQuery = useQuery({
    queryKey: ['team-roster-meta'],
    queryFn: async () => (await getTeamRosterMeta()).data,
  });
  const hasTeam = Boolean(metaQuery.data?.has_team);

  const rosterQuery = useQuery({
    queryKey: ['team-roster', month],
    queryFn: async () => (await getTeamRoster(month)).data,
    enabled: hasTeam,
  });

  const patternsQuery = useQuery({
    queryKey: ['team-patterns'],
    queryFn: async () => (await getTeamPatterns()).data ?? [],
    enabled: hasTeam,
  });

  const assigneesQuery = useQuery({
    queryKey: ['team-pattern-assignments', assigneesPattern?.id],
    queryFn: async ({ queryKey }) => (await getTeamPatternAssignments(queryKey[1] as number)).data ?? [],
    enabled: !!assigneesPattern?.id,
  });

  const roster = rosterQuery.data;
  const editableFrom = roster?.editable_from ?? dayjs().format('YYYY-MM-DD');
  const shiftOptions = toShiftOptions(roster?.shifts);
  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('saveFailed')));

  const invalidateRoster = () => qc.invalidateQueries({ queryKey: ['team-roster'] });
  const invalidatePatterns = () => {
    qc.invalidateQueries({ queryKey: ['team-patterns'] });
    qc.invalidateQueries({ queryKey: ['team-pattern-assignments'] });
    invalidateRoster();
  };

  const cellMutation = useMutation({
    mutationFn: setTeamRosterCell,
    onSuccess: () => {
      toast.success(t('cellUpdated'));
      setCellTarget(null);
      invalidateRoster();
    },
    onError,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAssignTeamRoster,
    onSuccess: (res) => {
      toast.success(
        t('bulkDone', { created: res.data?.created ?? 0, conflicts: res.data?.conflicts?.length ?? 0 }),
      );
      setBulkOpen(false);
      invalidateRoster();
    },
    onError,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createTeamPattern>[0]) =>
      editing ? updateTeamPattern(editing.id, payload) : createTeamPattern(payload),
    onSuccess: () => {
      toast.success(t('patternSaved'));
      setEditorOpen(false);
      invalidatePatterns();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamPattern,
    onSuccess: () => {
      toast.success(t('patternDeleted'));
      invalidatePatterns();
    },
    onError,
  });

  const assignMutation = useMutation({
    mutationFn: (vars: { id: number; payload: Parameters<typeof assignTeamPattern>[1] }) =>
      assignTeamPattern(vars.id, vars.payload),
    onSuccess: () => {
      toast.success(t('patternAssigned'));
      setAssignPattern(null);
      invalidatePatterns();
    },
    onError,
  });

  const endMutation = useMutation({
    mutationFn: (vars: { id: number; effectiveTo: string }) => endTeamPatternAssignment(vars.id, vars.effectiveTo),
    onSuccess: () => {
      toast.success(t('assignmentEnded'));
      invalidatePatterns();
    },
    onError,
  });

  if (metaQuery.isLoading) {
    return <div className="py-6 text-sm text-text-secondary">{t('loading')}</div>;
  }

  if (!hasTeam) {
    return (
      <div className="py-6">
        <div className="rounded-md border bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-2 text-sm text-text-secondary">{t('noTeam')}</p>
        </div>
      </div>
    );
  }

  const deferred = (fn: () => void) => () => setTimeout(fn, 0);

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-text-secondary">
            {t('subtitle', { count: metaQuery.data?.team_size ?? 0 })}
          </p>
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">{t('tabRoster')}</TabsTrigger>
            <TabsTrigger value="patterns">{t('tabPatterns')}</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2 sm:w-60">
                <Label>{t('month')}</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <Button onClick={() => setBulkOpen(true)}>{t('bulkAssign')}</Button>
            </div>
            <p className="text-xs text-text-secondary">{t('pastLocked', { date: editableFrom })}</p>
            {rosterQuery.isError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {t('loadFailed')}
              </div>
            ) : null}
            <RosterGrid
              calendar={roster}
              isCellEditable={(date) => !dayjs(date).isBefore(dayjs(editableFrom), 'day')}
              onCellClick={(employee, date, cells) =>
                setCellTarget({
                  employeeId: employee.id,
                  employeeName: employee.name ?? String(employee.id),
                  date,
                  cells,
                })
              }
            />
          </TabsContent>

          <TabsContent value="patterns" className="flex flex-col gap-4 pt-4">
            <div className="flex justify-end">
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setEditing(null);
                  setEditorOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t('createPattern')}
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('patternName')}</TableHead>
                    <TableHead>{t('owner')}</TableHead>
                    <TableHead>{t('cycle')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!patternsQuery.data?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-text-secondary">
                        {t('noPatterns')}
                      </TableCell>
                    </TableRow>
                  )}
                  {patternsQuery.data?.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell className="font-medium">{pattern.name}</TableCell>
                      <TableCell>
                        <Badge variant={pattern.can_edit ? 'default' : 'secondary'}>
                          {pattern.can_edit ? t('ownerMine') : t('ownerHr')}
                        </Badge>
                      </TableCell>
                      <TableCell>{t('cycleDays', { n: pattern.cycle_length_days })}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger aria-label={t('actions')}>
                            <Ellipsis className="text-grayscale-30" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={deferred(() => setAssigneesPattern(pattern))}>
                              <Users />
                              {t('assignees')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={deferred(() => setAssignPattern(pattern))}>
                              <UserPlus />
                              {t('assign')}
                            </DropdownMenuItem>
                            {pattern.can_edit ? (
                              <>
                                <DropdownMenuItem
                                  onSelect={deferred(() => {
                                    setEditing(pattern);
                                    setEditorOpen(true);
                                  })}
                                >
                                  <Edit3 />
                                  {t('edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => deleteMutation.mutate(pattern.id)}
                                >
                                  <Trash />
                                  {t('delete')}
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RosterCellDialog
        target={cellTarget}
        shiftOptions={shiftOptions}
        isPending={cellMutation.isPending}
        onClose={() => setCellTarget(null)}
        onSubmit={(payload) => cellMutation.mutate(payload)}
      />

      <RosterBulkDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        employees={roster?.employees ?? []}
        shiftOptions={shiftOptions}
        isPending={bulkMutation.isPending}
        month={month}
        minDate={editableFrom}
        onSubmit={(payload) => bulkMutation.mutate(payload)}
      />

      <PatternEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        shiftOptions={shiftOptions}
        isPending={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <PatternAssignDialog
        open={Boolean(assignPattern)}
        onOpenChange={(open) => !open && setAssignPattern(null)}
        employees={roster?.employees ?? []}
        minEffectiveFrom={editableFrom}
        isPending={assignMutation.isPending}
        onSubmit={(payload) => assignPattern && assignMutation.mutate({ id: assignPattern.id, payload })}
      />

      <PatternAssigneesDialog
        open={Boolean(assigneesPattern)}
        onOpenChange={(open) => !open && setAssigneesPattern(null)}
        patternName={assigneesPattern?.name ?? ''}
        rows={assigneesQuery.data}
        isLoading={assigneesQuery.isLoading}
        isError={assigneesQuery.isError}
        canEnd
        minEndDate={dayjs(editableFrom).subtract(1, 'day').format('YYYY-MM-DD')}
        isEnding={endMutation.isPending}
        onEnd={(id, effectiveTo) => endMutation.mutate({ id, effectiveTo })}
      />
    </div>
  );
};
