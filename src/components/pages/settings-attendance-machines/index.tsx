'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BasicDatePicker } from '@/components/ui/date-picker';
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
import { cn } from '@/lib/utils';
import {
  useIclockActions,
  useIclockDevices,
  useIclockHealth,
  useIclockLogs,
} from './hook';
import { UnknownPinsTab } from './unknown-pins-tab';
import type { IclockCsvSyncSummary } from '@/services/iclock/types';

function formatDt(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatStatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return String(value);
  }
  return '—';
}

const CSV_STAT_KEYS = [
  'inserted',
  'updated',
  'deleted',
  'unknown_pins',
  'ignored_pins',
  'skipped_approved',
  'skipped_manual',
  'unresolved_punches',
  'rows_read',
  'writes',
] as const;

type CsvStatKey = (typeof CSV_STAT_KEYS)[number];

const CSV_STAT_LABEL_KEY: Record<CsvStatKey, string> = {
  inserted: 'statInserted',
  updated: 'statUpdated',
  deleted: 'statDeleted',
  unknown_pins: 'statUnknownPins',
  ignored_pins: 'statIgnoredPins',
  skipped_approved: 'statSkippedApproved',
  skipped_manual: 'statSkippedManual',
  unresolved_punches: 'statUnresolved',
  rows_read: 'statRowsRead',
  writes: 'statWrites',
};

function dateToStr(d: Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

function strToDate(s: string): Date | undefined {
  return s ? dayjs(s).toDate() : undefined;
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
    <div className="rounded-md border p-3 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{label}</p>
        {badge}
      </div>
      <p className="text-sm font-semibold break-all">{value}</p>
    </div>
  );
}

function csvStatValue(
  summary: IclockCsvSyncSummary | null | undefined,
  metadata: Record<string, number | string | null> | null | undefined,
  key: CsvStatKey,
): unknown {
  if (summary && summary[key] !== undefined && summary[key] !== null) {
    return summary[key];
  }
  return metadata?.[key];
}

export default function SettingsAttendanceMachines() {
  const t = useTranslations('settings.attendanceMachines');
  const tCommon = useTranslations('common');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const [activeTab, setActiveTab] = React.useState('overview');
  const actions = useIclockActions();

  const [repairFrom, setRepairFrom] = React.useState('');
  const [repairTo, setRepairTo] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [watchingRunId, setWatchingRunId] = React.useState<string | null>(null);

  const csvBusyStatus = (status?: string | null) =>
    status === 'queued' || status === 'exporting' || status === 'importing';

  const healthQuery = useIclockHealth(
    true,
    watchingRunId || activeTab === 'repair' || activeTab === 'overview' ? 5_000 : 60_000,
  );
  const devicesQuery = useIclockDevices(activeTab === 'machines');
  const health = healthQuery.data;
  const csvSync = health?.csv_sync ?? null;
  const csvRunning = csvBusyStatus(csvSync?.status);

  React.useEffect(() => {
    if (!watchingRunId || !csvSync) return;
    if (csvSync.run_id !== watchingRunId) return;
    if (csvSync.status === 'completed' || csvSync.status === 'failed') {
      setWatchingRunId(null);
    }
  }, [watchingRunId, csvSync]);

  const statusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return t('statusPending');
      case 1:
        return t('statusProcessed');
      case 2:
        return t('statusUnmatched');
      case 3:
        return t('statusFailed');
      case 4:
        return t('statusUnresolved');
      case 5:
        return t('statusIgnored');
      default:
        return String(status);
    }
  };

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

  const logsLastPage = logsQuery.data?.last_page ?? 1;
  const logsTotal = logsQuery.data?.total ?? 0;
  const repairRangeValid = Boolean(repairFrom && repairTo) && repairFrom <= repairTo;
  const admsBusy = actions.syncDevices.isPending || actions.csvSync.isPending || csvRunning;

  const summary = csvSync?.summary ?? null;
  const meta = health?.metadata ?? null;

  const startCsvSync = () => {
    if (!repairRangeValid) return;
    actions.csvSync.mutate(
      { from: repairFrom, to: repairTo },
      {
        onSuccess: (res) => {
          setConfirmOpen(false);
          setWatchingRunId(res.data?.run_id ?? null);
        },
      },
    );
  };

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {[
            { value: 'overview', label: t('tabOverview') },
            { value: 'machines', label: t('tabMachines') },
            { value: 'logs', label: t('tabLogs') },
            { value: 'unmatched', label: t('tabUnmatched') },
            ...(canEdit ? [{ value: 'repair', label: t('tabRepair') }] : []),
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'px-2.5 sm:px-3 text-secondary-hover border-l-0',
                'data-[state=active]:border-l-0 data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:font-medium',
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {tab.label}
              </code>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {healthQuery.isError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {t('failedLoadHealth', {
                message: healthQuery.error?.message || t('tryRefreshing'),
              })}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label={t('syncStatus')}
              value={health?.last_run_status ?? csvSync?.status ?? '—'}
              badge={
                health == null ? null : health.stale ? (
                  <Badge variant="destructive">{t('stale')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('fresh')}</Badge>
                )
              }
            />
            <StatCard label={t('lastSynced')} value={formatDt(health?.last_synced_at)} />
            <StatCard
              label={t('syncRange')}
              value={
                csvSync?.from && csvSync?.to ? `${csvSync.from} → ${csvSync.to}` : '—'
              }
            />
          </div>

          {health?.last_error || csvSync?.error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {health?.last_error || csvSync?.error}
            </div>
          ) : null}

          <div className="space-y-3 rounded-md border p-4">
            <h3 className="text-sm font-medium">{t('lastRunStats')}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CSV_STAT_KEYS.map((key) => (
                <StatCard
                  key={key}
                  label={t(CSV_STAT_LABEL_KEY[key])}
                  value={formatStatValue(csvStatValue(summary, meta, key))}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="machines" className="space-y-4">
          <div className="flex justify-end">
            <Can permission="time_attendance.attendance_configuration.edit">
              <Button
                variant="outline"
                onClick={() => actions.syncDevices.mutate()}
                disabled={admsBusy}
              >
                {actions.syncDevices.isPending ? t('refreshing') : t('refreshFromAdms')}
              </Button>
            </Can>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('serial')}</TableHead>
                  <TableHead>{t('ip')}</TableHead>
                  <TableHead>{t('alias')}</TableHead>
                  <TableHead>{t('lastPunch')}</TableHead>
                  <TableHead>{t('punches24h')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devicesQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-destructive text-center">
                      {t('failedLoadDevices', {
                        message: devicesQuery.error?.message || t('tryAgain'),
                      })}
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
                          <Badge variant="outline">{t('quiet')}</Badge>
                        ) : (
                          <Badge>{t('active')}</Badge>
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
                      {t('noDevices')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('pin')}</Label>
              <Input
                value={logPin}
                onChange={(e) => {
                  setLogPin(e.target.value);
                  setLogPage(1);
                }}
                placeholder={t('pinPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('deviceSn')}</Label>
              <Input
                value={logDevice}
                onChange={(e) => {
                  setLogDevice(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>
            <BasicDatePicker
              label={t('from')}
              value={strToDate(logFrom)}
              onSelect={(d) => {
                setLogFrom(dateToStr(d));
                setLogPage(1);
              }}
            />
            <BasicDatePicker
              label={t('to')}
              value={strToDate(logTo)}
              onSelect={(d) => {
                setLogTo(dateToStr(d));
                setLogPage(1);
              }}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('logId')}</TableHead>
                  <TableHead>{t('pin')}</TableHead>
                  <TableHead>{t('time')}</TableHead>
                  <TableHead>{t('device')}</TableHead>
                  <TableHead>{t('state')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('attendance')}</TableHead>
                  <TableHead>{t('error')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-destructive text-center">
                      {t('failedLoadLogs', {
                        message: logsQuery.error?.message || t('tryAgain'),
                      })}
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
                      <TableCell>{statusLabel(log.status)}</TableCell>
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
                      {t('noPunchLogs')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {t('pageOf', { page: logPage, last: logsLastPage, total: logsTotal })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={logPage <= 1 || logsQuery.isFetching}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={logPage >= logsLastPage || logsQuery.isFetching}
                onClick={() => setLogPage((p) => p + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unmatched" className="space-y-4">
          <UnknownPinsTab enabled={activeTab === 'unmatched'} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="repair" className="space-y-6">
          <Can permission="time_attendance.attendance_configuration.edit">
            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{t('csvRepairTitle')}</h3>
                <p className="text-muted-foreground text-sm">{t('csvRepairHint')}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <BasicDatePicker
                  label={t('from')}
                  value={strToDate(repairFrom)}
                  onSelect={(d) => setRepairFrom(dateToStr(d))}
                />
                <BasicDatePicker
                  label={t('to')}
                  value={strToDate(repairTo)}
                  onSelect={(d) => setRepairTo(dateToStr(d))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!repairRangeValid || admsBusy}
                  onClick={() => setConfirmOpen(true)}
                >
                  {csvRunning || actions.csvSync.isPending
                    ? t('csvSyncRunning')
                    : t('runCsvSync')}
                </Button>
              </div>

              {csvSync ? (
                <div className="space-y-3 rounded-md border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium">{t('csvSyncStatus')}</h4>
                    <Badge variant={csvSync.status === 'failed' ? 'destructive' : 'secondary'}>
                      {csvSync.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t('csvSyncRunMeta', {
                      runId: csvSync.run_id,
                      from: csvSync.from,
                      to: csvSync.to,
                      started: formatDt(csvSync.started_at),
                      finished: formatDt(csvSync.finished_at),
                    })}
                  </p>
                  {csvSync.error ? (
                    <p className="text-destructive text-sm">{csvSync.error}</p>
                  ) : null}
                  {summary ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {CSV_STAT_KEYS.map((key) => (
                        <StatCard
                          key={key}
                          label={t(CSV_STAT_LABEL_KEY[key])}
                          value={formatStatValue(csvStatValue(summary, null, key))}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Can>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('csvSyncConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('csvSyncConfirmBody', { from: repairFrom, to: repairTo })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={startCsvSync} disabled={actions.csvSync.isPending}>
              {actions.csvSync.isPending ? t('csvSyncQueuing') : t('runCsvSync')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
