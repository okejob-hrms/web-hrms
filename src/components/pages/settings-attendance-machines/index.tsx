'use client';

import * as React from 'react';
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
import {
  useIclockActions,
  useIclockDevices,
  useIclockHealth,
  useIclockLogs,
  useIclockUnmatched,
} from './hook';
import type { IclockReconcileReport } from '@/services/iclock/types';

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

export default function SettingsAttendanceMachines() {
  const healthQuery = useIclockHealth();
  const devicesQuery = useIclockDevices();
  const unmatchedQuery = useIclockUnmatched();
  const actions = useIclockActions();

  const [logPin, setLogPin] = React.useState('');
  const [logDevice, setLogDevice] = React.useState('');
  const [logFrom, setLogFrom] = React.useState('');
  const [logTo, setLogTo] = React.useState('');
  const logsQuery = useIclockLogs({
    pin: logPin || undefined,
    device: logDevice || undefined,
    from: logFrom || undefined,
    to: logTo || undefined,
    page: 1,
  });

  const [repairFrom, setRepairFrom] = React.useState('');
  const [repairTo, setRepairTo] = React.useState('');
  const [repairDevice, setRepairDevice] = React.useState('');
  const [repairPin, setRepairPin] = React.useState('');
  const [reconcileReport, setReconcileReport] = React.useState<IclockReconcileReport | null>(null);

  const [reprocessDate, setReprocessDate] = React.useState('');
  const [reprocessPin, setReprocessPin] = React.useState('');

  const health = healthQuery.data;

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
            disabled={actions.syncNow.isPending}
          >
            {actions.syncNow.isPending ? 'Syncing…' : 'Sync now'}
          </Button>
        </Can>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="logs">Punch logs</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched PINs</TabsTrigger>
          <TabsTrigger value="repair">Repair</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sync status"
              value={health?.last_run_status ?? '—'}
              badge={
                health?.stale ? (
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
                disabled={actions.syncDevices.isPending}
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
                {(devicesQuery.data ?? []).map((device) => (
                  <TableRow key={device.serial}>
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
                ))}
                {!devicesQuery.isLoading && (devicesQuery.data?.length ?? 0) === 0 ? (
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
              <Input value={logPin} onChange={(e) => setLogPin(e.target.value)} placeholder="e.g. 20250102" />
            </div>
            <div>
              <Label>Device SN</Label>
              <Input value={logDevice} onChange={(e) => setLogDevice(e.target.value)} />
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={logFrom} onChange={(e) => setLogFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={logTo} onChange={(e) => setLogTo(e.target.value)} />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logsQuery.data?.data ?? []).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.iclock_log_id}</TableCell>
                    <TableCell>{log.iclock_employee_code}</TableCell>
                    <TableCell>{formatDt(log.punched_at)}</TableCell>
                    <TableCell>{log.device_sn ?? '—'}</TableCell>
                    <TableCell>{log.punch_state ?? '—'}</TableCell>
                    <TableCell>{STATUS_LABEL[log.status] ?? log.status}</TableCell>
                    <TableCell>{log.attendance_id ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {!logsQuery.isLoading && (logsQuery.data?.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      No punch logs found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
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
                {(unmatchedQuery.data ?? []).map((row) => (
                  <TableRow key={row.iclock_employee_code}>
                    <TableCell className="font-medium">{row.iclock_employee_code}</TableCell>
                    <TableCell>{row.punch_count}</TableCell>
                    <TableCell>{formatDt(row.first_punched_at)}</TableCell>
                    <TableCell>{formatDt(row.last_punched_at)}</TableCell>
                  </TableRow>
                ))}
                {!unmatchedQuery.isLoading && (unmatchedQuery.data?.length ?? 0) === 0 ? (
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!repairFrom || !repairTo || actions.reconcile.isPending}
                  onClick={async () => {
                    const res = await actions.reconcile.mutateAsync({
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                    });
                    setReconcileReport(res.data);
                  }}
                >
                  Reconcile (preview)
                </Button>
                <Button
                  variant="secondary"
                  disabled={!repairFrom || !repairTo || actions.backfill.isPending}
                  onClick={() =>
                    actions.backfill.mutate({
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                      dry_run: true,
                    })
                  }
                >
                  Backfill dry-run
                </Button>
                <Button
                  disabled={!repairFrom || !repairTo || actions.backfill.isPending}
                  onClick={() => {
                    if (!window.confirm('Run backfill and write to database?')) return;
                    actions.backfill.mutate({
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                      dry_run: false,
                      confirm: true,
                    });
                  }}
                >
                  Run backfill
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
                disabled={!reprocessDate || !reprocessPin || actions.reprocess.isPending}
                onClick={() =>
                  actions.reprocess.mutate({
                    date: reprocessDate,
                    pin: reprocessPin,
                  })
                }
              >
                Reprocess day
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
