'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Can } from '@/components/auth/can';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissionStore } from '@/hooks/use-permission-store';
import {
  useIclockActions,
  useIclockDevices,
  useIclockHealth,
  useIclockLogs,
  useIclockUnmatched,
} from './hook';
import type { IclockBackfillResult, IclockReconcileReport } from '@/services/iclock/types';

function formatDt(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const STATUS_LABEL: Record<number, string> = {
  0: 'Pending',
  1: 'Processed',
  2: 'Unmatched',
  3: 'Failed',
};

/** Soft cap for write backfill to avoid ADMS timeouts / huge rewrites. */
const MAX_BACKFILL_DAYS = 31;

function inclusiveDaySpan(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const start = Date.UTC(fy, fm - 1, fd);
  const end = Date.UTC(ty, tm - 1, td);
  return Math.floor((end - start) / 86_400_000) + 1;
}

export default function SettingsAttendanceMachines() {
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const [activeTab, setActiveTab] = React.useState('overview');
  const healthQuery = useIclockHealth(true);
  const devicesQuery = useIclockDevices(activeTab === 'machines');
  const unmatchedQuery = useIclockUnmatched(activeTab === 'unmatched');
  const actions = useIclockActions();

  const [logPin, setLogPin] = React.useState('');
  const [logDevice, setLogDevice] = React.useState('');
  const [logFrom, setLogFrom] = React.useState('');
  const [logTo, setLogTo] = React.useState('');
  const [logPage, setLogPage] = React.useState(1);
  const debouncedLogPin = useDebounce(logPin, 400);
  const debouncedLogDevice = useDebounce(logDevice, 400);

  const logsQuery = useIclockLogs(
    {
      pin: debouncedLogPin || undefined,
      device: debouncedLogDevice || undefined,
      from: logFrom || undefined,
      to: logTo || undefined,
      page: logPage,
    },
    activeTab === 'logs',
  );

  const [repairFrom, setRepairFrom] = React.useState('');
  const [repairTo, setRepairTo] = React.useState('');
  const [repairDevice, setRepairDevice] = React.useState('');
  const [repairPin, setRepairPin] = React.useState('');
  const [reconcileReport, setReconcileReport] = React.useState<IclockReconcileReport | null>(null);
  const [backfillResult, setBackfillResult] = React.useState<IclockBackfillResult | null>(null);
  const repairFiltersRef = React.useRef({
    from: repairFrom,
    to: repairTo,
    device: repairDevice,
    pin: repairPin,
  });
  repairFiltersRef.current = {
    from: repairFrom,
    to: repairTo,
    device: repairDevice,
    pin: repairPin,
  };

  const [reprocessDate, setReprocessDate] = React.useState('');
  const [reprocessPin, setReprocessPin] = React.useState('');

  React.useEffect(() => {
    setReconcileReport(null);
    setBackfillResult(null);
  }, [repairFrom, repairTo, repairDevice, repairPin]);

  const matchesRepairFilters = React.useCallback(
    (variables: { from: string; to: string; device?: string; pin?: string }) => {
      const current = repairFiltersRef.current;
      return (
        variables.from === current.from &&
        variables.to === current.to &&
        (variables.device ?? '') === current.device &&
        (variables.pin ?? '') === current.pin
      );
    },
    [],
  );

  const health = healthQuery.data;
  const logsLastPage = logsQuery.data?.last_page ?? 1;
  const logsTotal = logsQuery.data?.total ?? 0;
  const repairRangeValid =
    Boolean(repairFrom && repairTo) && repairFrom <= repairTo;
  const repairSpanDays = repairRangeValid ? inclusiveDaySpan(repairFrom, repairTo) : 0;
  const backfillWriteAllowed = repairRangeValid && repairSpanDays <= MAX_BACKFILL_DAYS;
  const admsBusy =
    actions.syncNow.isPending ||
    actions.syncDevices.isPending ||
    actions.reconcile.isPending ||
    actions.backfill.isPending ||
    actions.reprocess.isPending;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Machines</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor iClock / ADMS sync health, machines, punch logs, and repair gaps.
          </p>
        </div>
        <Can permission="time_attendance.attendance_configuration.edit">
          <Button
            onClick={() => actions.syncNow.mutate()}
            disabled={admsBusy}
          >
            {actions.syncNow.isPending ? 'Syncing…' : 'Sync now'}
          </Button>
        </Can>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="logs">Punch logs</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched PINs</TabsTrigger>
          {canEdit ? <TabsTrigger value="repair">Repair</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {healthQuery.isError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              Failed to load sync health. {healthQuery.error?.message || 'Try refreshing the page.'}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sync status"
              value={health?.last_run_status ?? '—'}
              badge={
                health == null ? null : health.stale ? (
                  <Badge variant="destructive">Stale</Badge>
                ) : (
                  <Badge variant="secondary">Fresh</Badge>
                )
              }
            />
            <StatCard label="Last synced" value={formatDt(health?.last_synced_at)} />
            <StatCard label="Cursor TID" value={String(health?.last_tid ?? '—')} />
            <StatCard label="API" value={health?.api_url || '—'} />
          </div>

          {health?.last_error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {health.last_error}
            </div>
          ) : null}

          {health?.metadata ? (
            <div className="rounded-md border p-4">
              <h3 className="mb-2 text-sm font-medium">Last run stats</h3>
              <pre className="text-muted-foreground overflow-auto text-xs">
                {JSON.stringify(health.metadata, null, 2)}
              </pre>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="machines" className="space-y-4">
          <div className="flex justify-end">
            <Can permission="time_attendance.attendance_configuration.edit">
              <Button
                variant="outline"
                onClick={() => actions.syncDevices.mutate()}
                disabled={admsBusy}
              >
                {actions.syncDevices.isPending ? 'Refreshing…' : 'Refresh from ADMS'}
              </Button>
            </Can>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Last punch</TableHead>
                  <TableHead>24h punches</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devicesQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-destructive text-center">
                      Failed to load devices. {devicesQuery.error?.message || 'Try again.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  (devicesQuery.data ?? []).map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.serial}</TableCell>
                      <TableCell>{device.ip ?? '—'}</TableCell>
                      <TableCell>{device.alias ?? '—'}</TableCell>
                      <TableCell>{formatDt(device.last_punch_at)}</TableCell>
                      <TableCell>{device.punches_last_24h ?? 0}</TableCell>
                      <TableCell>
                        {device.quiet ? (
                          <Badge variant="outline">Quiet</Badge>
                        ) : (
                          <Badge>Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!devicesQuery.isLoading &&
                !devicesQuery.isError &&
                (devicesQuery.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      No devices yet. Click Refresh from ADMS.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label>PIN</Label>
              <Input
                value={logPin}
                onChange={(e) => {
                  setLogPin(e.target.value);
                  setLogPage(1);
                }}
                placeholder="e.g. 20250102"
              />
            </div>
            <div>
              <Label>Device SN</Label>
              <Input
                value={logDevice}
                onChange={(e) => {
                  setLogDevice(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>
            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={logFrom}
                onChange={(e) => {
                  setLogFrom(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={logTo}
                onChange={(e) => {
                  setLogTo(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-destructive text-center">
                      Failed to load punch logs. {logsQuery.error?.message || 'Try again.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  (logsQuery.data?.data ?? []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.iclock_log_id}</TableCell>
                      <TableCell>{log.iclock_employee_code}</TableCell>
                      <TableCell>{formatDt(log.punched_at)}</TableCell>
                      <TableCell>{log.device_sn ?? '—'}</TableCell>
                      <TableCell>{log.punch_state ?? '—'}</TableCell>
                      <TableCell>{STATUS_LABEL[log.status] ?? log.status}</TableCell>
                      <TableCell>{log.attendance_id ?? '—'}</TableCell>
                      <TableCell
                        className="text-muted-foreground max-w-[220px] truncate text-xs"
                        title={log.error_message ?? undefined}
                      >
                        {log.error_message || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!logsQuery.isLoading &&
                !logsQuery.isError &&
                (logsQuery.data?.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground text-center">
                      No punch logs found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Page {logPage} of {logsLastPage} · {logsTotal} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={logPage <= 1 || logsQuery.isFetching}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={logPage >= logsLastPage || logsQuery.isFetching}
                onClick={() => setLogPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unmatched" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PIN</TableHead>
                  <TableHead>Punches</TableHead>
                  <TableHead>First</TableHead>
                  <TableHead>Last</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unmatchedQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-destructive text-center">
                      Failed to load unmatched PINs.{' '}
                      {unmatchedQuery.error?.message || 'Try again.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  (unmatchedQuery.data ?? []).map((row) => (
                    <TableRow key={row.iclock_employee_code}>
                      <TableCell className="font-medium">{row.iclock_employee_code}</TableCell>
                      <TableCell>{row.punch_count}</TableCell>
                      <TableCell>{formatDt(row.first_punched_at)}</TableCell>
                      <TableCell>{formatDt(row.last_punched_at)}</TableCell>
                    </TableRow>
                  ))
                )}
                {!unmatchedQuery.isLoading &&
                !unmatchedQuery.isError &&
                (unmatchedQuery.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      No unmatched PINs.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="repair" className="space-y-6">
          <Can permission="time_attendance.attendance_configuration.edit">
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-medium">Reconcile / Backfill date range</h3>
              <p className="text-muted-foreground text-sm">
                Pulls ADMS Transaction history (not the live oplog tip) and compares with HRMS.
              </p>
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <Label>From</Label>
                  <Input type="date" value={repairFrom} onChange={(e) => setRepairFrom(e.target.value)} />
                </div>
                <div>
                  <Label>To</Label>
                  <Input type="date" value={repairTo} onChange={(e) => setRepairTo(e.target.value)} />
                </div>
                <div>
                  <Label>Device (optional)</Label>
                  <Input value={repairDevice} onChange={(e) => setRepairDevice(e.target.value)} />
                </div>
                <div>
                  <Label>PIN (optional)</Label>
                  <Input value={repairPin} onChange={(e) => setRepairPin(e.target.value)} />
                </div>
              </div>
              {!repairRangeValid && repairFrom && repairTo ? (
                <p className="text-destructive text-sm">From date must be on or before To date.</p>
              ) : null}
              {repairRangeValid && !backfillWriteAllowed ? (
                <p className="text-destructive text-sm">
                  Repair actions are limited to {MAX_BACKFILL_DAYS} days ({repairSpanDays} selected).
                  Narrow the range, or use the CLI for larger windows.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!backfillWriteAllowed || admsBusy}
                  onClick={() => {
                    const payload = {
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                    };
                    actions.reconcile.mutate(payload, {
                      onSuccess: (res, variables) => {
                        if (!matchesRepairFilters(variables)) return;
                        setReconcileReport(res.data);
                        toast.success(
                          `Reconcile: ${res.data?.missing_count ?? 0} missing of ${res.data?.adms_count ?? 0} ADMS punches`,
                        );
                      },
                    });
                  }}
                >
                  {actions.reconcile.isPending ? 'Reconciling…' : 'Reconcile (preview)'}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!backfillWriteAllowed || admsBusy}
                  onClick={() => {
                    const payload = {
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                      dry_run: true as const,
                    };
                    actions.backfill.mutate(payload, {
                      onSuccess: (res, variables) => {
                        if (!matchesRepairFilters(variables)) return;
                        setBackfillResult(res.data);
                        toast.success(
                          `Backfill dry-run: ${res.data?.missing_before ?? 0} missing punch(es), would store ${res.data?.stored ?? 0}`,
                        );
                      },
                    });
                  }}
                >
                  {actions.backfill.isPending && actions.backfill.variables?.dry_run
                    ? 'Running…'
                    : 'Backfill dry-run'}
                </Button>
                <Button
                  disabled={!backfillWriteAllowed || admsBusy}
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Run backfill for ${repairFrom} → ${repairTo}${
                          repairDevice ? ` (device ${repairDevice})` : ''
                        }${repairPin ? ` (PIN ${repairPin})` : ''} and write to the database?`,
                      )
                    ) {
                      return;
                    }
                    const payload = {
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                      dry_run: false as const,
                      confirm: true as const,
                    };
                    actions.backfill.mutate(payload, {
                      onSuccess: (res, variables) => {
                        toast.success(
                          `Backfill completed: stored ${res.data?.stored ?? 0}, days ${res.data?.processed_days ?? 0}`,
                        );
                        actions.invalidate();
                        if (!matchesRepairFilters(variables)) return;
                        setBackfillResult(res.data);
                      },
                    });
                  }}
                >
                  {actions.backfill.isPending && actions.backfill.variables?.dry_run === false
                    ? 'Writing…'
                    : 'Run backfill'}
                </Button>
              </div>

              {reconcileReport ? (
                <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <div>
                    ADMS {reconcileReport.adms_count} · HRMS {reconcileReport.hrms_count} · Missing{' '}
                    <strong>{reconcileReport.missing_count}</strong>
                  </div>
                  {(reconcileReport.missing ?? []).slice(0, 10).map((row) => (
                    <div key={row.iclock_log_id} className="text-muted-foreground font-mono text-xs">
                      #{row.iclock_log_id} {row.pin} {row.time} {row.device}
                    </div>
                  ))}
                </div>
              ) : null}

              {backfillResult ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="font-medium">
                    {backfillResult.dry_run ? 'Dry-run result' : 'Backfill result'}
                  </div>
                  <pre className="text-muted-foreground mt-2 overflow-auto text-xs">
                    {JSON.stringify(backfillResult, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="font-medium">Reprocess employee / day</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={reprocessDate} onChange={(e) => setReprocessDate(e.target.value)} />
                </div>
                <div>
                  <Label>PIN</Label>
                  <Input value={reprocessPin} onChange={(e) => setReprocessPin(e.target.value)} />
                </div>
              </div>
              <Button
                disabled={!reprocessDate || !reprocessPin || actions.reprocess.isPending || admsBusy}
                onClick={() => {
                  if (
                    !window.confirm(
                      `Reprocess attendance for PIN ${reprocessPin} on ${reprocessDate}? This rewrites waiting/absent attendance for that day.`,
                    )
                  ) {
                    return;
                  }
                  actions.reprocess.mutate({
                    date: reprocessDate,
                    pin: reprocessPin,
                  });
                }}
              >
                {actions.reprocess.isPending ? 'Reprocessing…' : 'Reprocess day'}
              </Button>
            </div>
          </Can>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs uppercase tracking-wide">
        <span>{label}</span>
        {badge}
      </div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
