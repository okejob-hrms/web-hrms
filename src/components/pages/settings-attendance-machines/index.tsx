'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
import { SearchableSelect } from '@/components/ui/combobox';
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
import { getEmployees } from '@/services/employees';
import {
  useIclockActions,
  useIclockDevices,
  useIclockHealth,
  useIclockLogs,
  useIclockUnmatched,
} from './hook';
import type { IclockBackfillResult, IclockReconcileReport } from '@/services/iclock/types';

type BackfillResultState = IclockBackfillResult & { rangeFrom: string; rangeTo: string };

function formatDt(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const LAST_RUN_STAT_KEYS = [
  'fetched',
  'stored',
  'created',
  'updated',
  'unmatched',
  'failed',
  'skipped',
  'duplicates',
] as const;

type LastRunStatKey = (typeof LAST_RUN_STAT_KEYS)[number];

const LAST_RUN_STAT_LABEL_KEY: Record<LastRunStatKey, string> = {
  fetched: 'statFetched',
  stored: 'statStored',
  created: 'statCreated',
  updated: 'statUpdated',
  unmatched: 'statUnmatched',
  failed: 'statFailed',
  skipped: 'statSkipped',
  duplicates: 'statDuplicates',
};

function formatStatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return String(value);
  }
  return '—';
}

/** Soft cap for write backfill to avoid ADMS timeouts / huge rewrites. */
const MAX_BACKFILL_DAYS = 31;

function inclusiveDaySpan(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const start = Date.UTC(fy, fm - 1, fd);
  const end = Date.UTC(ty, tm - 1, td);
  return Math.floor((end - start) / 86_400_000) + 1;
}

function dateToStr(d: Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

function strToDate(s: string): Date | undefined {
  return s ? dayjs(s).toDate() : undefined;
}

export default function SettingsAttendanceMachines() {
  const t = useTranslations('settings.attendanceMachines');
  const tCommon = useTranslations('common');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const [activeTab, setActiveTab] = React.useState('overview');
  const healthQuery = useIclockHealth(true);
  const devicesQuery = useIclockDevices(activeTab === 'machines' || activeTab === 'repair');
  const unmatchedQuery = useIclockUnmatched(activeTab === 'unmatched');
  const actions = useIclockActions();

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

  const [repairFrom, setRepairFrom] = React.useState('');
  const [repairTo, setRepairTo] = React.useState('');
  const [repairDevice, setRepairDevice] = React.useState('');
  const [repairDeviceSearch, setRepairDeviceSearch] = React.useState('');
  const [repairPin, setRepairPin] = React.useState('');
  const [reconcileReport, setReconcileReport] = React.useState<IclockReconcileReport | null>(null);
  const [backfillResult, setBackfillResult] = React.useState<BackfillResultState | null>(null);
  const [backfillConfirmOpen, setBackfillConfirmOpen] = React.useState(false);
  const [reprocessConfirmOpen, setReprocessConfirmOpen] = React.useState(false);

  const deviceOptions = React.useMemo(
    () =>
      (devicesQuery.data ?? []).map((d) => ({
        label: d.alias ? `${d.serial} (${d.alias})` : d.serial,
        value: d.serial,
      })),
    [devicesQuery.data],
  );
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
  const [reprocessUserId, setReprocessUserId] = React.useState<number | null>(null);
  const [reprocessEmployeeLabel, setReprocessEmployeeLabel] = React.useState('');
  const [employeeSearch, setEmployeeSearch] = React.useState('');
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 400);

  const employeesQuery = useQuery({
    queryKey: ['iclock', 'reprocess-employees', debouncedEmployeeSearch],
    queryFn: () =>
      getEmployees(
        debouncedEmployeeSearch
          ? { search: debouncedEmployeeSearch, per_page: 50, status: '1' }
          : { per_page: 50, status: '1' },
      ),
    enabled: activeTab === 'repair' && canEdit,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const employeeOptions = React.useMemo(() => {
    const options =
      employeesQuery.data?.data?.data
        ?.filter((item) => Boolean(item.code?.trim()))
        .map((item) => ({
          label: `${item.name} · ${item.code}`,
          value: item.code,
        })) ?? [];

    if (
      reprocessPin &&
      reprocessEmployeeLabel &&
      !options.some((option) => option.value === reprocessPin)
    ) {
      options.unshift({
        label: reprocessEmployeeLabel,
        value: reprocessPin,
      });
    }

    return options;
  }, [employeesQuery.data?.data?.data, reprocessEmployeeLabel, reprocessPin]);

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

  const formatRepairScope = (variables: {
    from: string;
    to: string;
    device?: string;
    pin?: string;
  }) => {
    const parts = [`${variables.from} → ${variables.to}`];
    if (variables.device) parts.push(t('repairScopeDevice', { device: variables.device }));
    if (variables.pin) parts.push(t('repairScopePin', { pin: variables.pin }));
    return parts.join(', ');
  };

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
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-xl">{t('title')}</h2>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <Can permission="time_attendance.attendance_configuration.edit">
          <Button
            onClick={() => actions.syncNow.mutate()}
            disabled={admsBusy}
          >
            {actions.syncNow.isPending ? t('syncing') : t('syncNow')}
          </Button>
        </Can>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
          <TabsTrigger value="machines">{t('tabMachines')}</TabsTrigger>
          <TabsTrigger value="logs">{t('tabLogs')}</TabsTrigger>
          <TabsTrigger value="unmatched">{t('tabUnmatched')}</TabsTrigger>
          {canEdit ? <TabsTrigger value="repair">{t('tabRepair')}</TabsTrigger> : null}
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
              value={health?.last_run_status ?? '—'}
              badge={
                health == null ? null : health.stale ? (
                  <Badge variant="destructive">{t('stale')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('fresh')}</Badge>
                )
              }
            />
            <StatCard label={t('lastSynced')} value={formatDt(health?.last_synced_at)} />
            <StatCard label={t('cursorTid')} value={String(health?.last_tid ?? '—')} />
          </div>

          {health?.last_error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {health.last_error}
            </div>
          ) : null}

          {health?.metadata ? (
            <div className="space-y-3 rounded-md border p-4">
              <h3 className="text-sm font-medium">{t('lastRunStats')}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {LAST_RUN_STAT_KEYS.map((key) => (
                  <StatCard
                    key={key}
                    label={t(LAST_RUN_STAT_LABEL_KEY[key])}
                    value={formatStatValue(health.metadata?.[key])}
                  />
                ))}
              </div>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pin')}</TableHead>
                  <TableHead>{t('punches')}</TableHead>
                  <TableHead>{t('first')}</TableHead>
                  <TableHead>{t('last')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unmatchedQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-destructive text-center">
                      {t('failedLoadUnmatched', {
                        message: unmatchedQuery.error?.message || t('tryAgain'),
                      })}
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
                      {t('noUnmatchedPins')}
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
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{t('reconcileBackfillTitle')}</h3>
                <p className="text-muted-foreground text-sm">{t('reconcileBackfillDesc')}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
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
                <div className="space-y-2">
                  <Label>{t('deviceOptional')}</Label>
                  <SearchableSelect
                    value={repairDevice || null}
                    onValueChange={(v) => setRepairDevice(v == null ? '' : String(v))}
                    options={deviceOptions}
                    placeholder={t('selectDevice')}
                    searchPlaceholder={t('deviceSn')}
                    emptyMessage={t('noDevices')}
                    searchValue={repairDeviceSearch}
                    onSearchChange={setRepairDeviceSearch}
                    isLoading={devicesQuery.isFetching}
                    allowClear
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pinOptional')}</Label>
                  <Input value={repairPin} onChange={(e) => setRepairPin(e.target.value)} />
                </div>
              </div>
              {!repairRangeValid && repairFrom && repairTo ? (
                <p className="text-destructive text-sm">{t('fromBeforeTo')}</p>
              ) : null}
              {repairRangeValid && !backfillWriteAllowed ? (
                <p className="text-destructive text-sm">
                  {t('repairLimitedDays', {
                    max: MAX_BACKFILL_DAYS,
                    selected: repairSpanDays,
                  })}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!backfillWriteAllowed || admsBusy}
                  isLoading={actions.reconcile.isPending}
                  onClick={() => {
                    const payload = {
                      from: repairFrom,
                      to: repairTo,
                      device: repairDevice || undefined,
                      pin: repairPin || undefined,
                    };
                    actions.reconcile.mutate(payload, {
                      onSuccess: (res, variables) => {
                        toast.success(
                          t('reconcileSuccess', {
                            scope: formatRepairScope(variables),
                            missing: res.data?.missing_count ?? 0,
                            adms: res.data?.adms_count ?? 0,
                          }),
                        );
                        if (!matchesRepairFilters(variables)) return;
                        setReconcileReport(res.data);
                      },
                    });
                  }}
                >
                  {t('reconcilePreview')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!backfillWriteAllowed || admsBusy}
                  isLoading={actions.backfill.isPending && !!actions.backfill.variables?.dry_run}
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
                        toast.success(
                          t('backfillDryRunSuccess', {
                            scope: formatRepairScope(variables),
                            missing: res.data?.missing_before ?? 0,
                            stored: res.data?.stored ?? 0,
                          }),
                        );
                        if (!matchesRepairFilters(variables)) return;
                        setBackfillResult(
                          res.data
                            ? { ...res.data, rangeFrom: variables.from, rangeTo: variables.to }
                            : null,
                        );
                      },
                    });
                  }}
                >
                  {t('backfillDryRun')}
                </Button>
                <Button
                  disabled={!backfillWriteAllowed || admsBusy}
                  onClick={() => setBackfillConfirmOpen(true)}
                >
                  {t('runBackfill')}
                </Button>
              </div>

              {reconcileReport ? (
                <div className="space-y-2 rounded-md bg-muted/40 p-4 text-sm">
                  <div>
                    {t('reconcileSummary', {
                      adms: reconcileReport.adms_count,
                      hrms: reconcileReport.hrms_count,
                    })}{' '}
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
                <div className="space-y-3 rounded-md bg-muted/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {backfillResult.dry_run ? t('dryRunResult') : t('backfillResult')}
                    </span>
                    {backfillResult.dry_run && (
                      <Badge variant="outline">{t('dryRun')}</Badge>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      compact
                      label={t('backfillPeriod')}
                      value={`${backfillResult.rangeFrom} → ${backfillResult.rangeTo}`}
                    />
                    <StatCard compact label={t('missingBefore')} value={String(backfillResult.missing_before)} />
                    <StatCard compact label={t('statStored')} value={String(backfillResult.stored)} />
                    <StatCard compact label={t('processedDays')} value={String(backfillResult.processed_days)} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard compact label={t('statCreated')} value={String(backfillResult.created)} />
                    <StatCard compact label={t('statUpdated')} value={String(backfillResult.updated)} />
                    <StatCard compact label={t('statUnmatched')} value={String(backfillResult.unmatched)} />
                    <StatCard compact label={t('statSkipped')} value={String(backfillResult.skipped)} />
                    <StatCard compact label={t('statFailed')} value={String(backfillResult.failed)} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-sm font-semibold">{t('reprocessTitle')}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <BasicDatePicker
                  label={t('date')}
                  value={strToDate(reprocessDate)}
                  onSelect={(d) => setReprocessDate(dateToStr(d))}
                />
                <div className="space-y-2">
                  <Label>{t('employeePin')}</Label>
                  <SearchableSelect
                    value={reprocessPin || null}
                    onValueChange={(value) => {
                      const code = value == null || value === '' ? '' : String(value);
                      setReprocessPin(code);
                      if (!code) {
                        setReprocessUserId(null);
                        setReprocessEmployeeLabel('');
                        return;
                      }
                      const match = employeesQuery.data?.data?.data?.find(
                        (item) => item.code === code,
                      );
                      setReprocessUserId(match?.user_id ?? null);
                      setReprocessEmployeeLabel(
                        match ? `${match.name} · ${match.code}` : code,
                      );
                    }}
                    options={employeeOptions}
                    placeholder={t('selectEmployeePin')}
                    searchPlaceholder={t('searchEmployeePin')}
                    emptyMessage={t('noEmployeeFound')}
                    searchValue={employeeSearch}
                    onSearchChange={setEmployeeSearch}
                    isLoading={employeesQuery.isFetching}
                    allowClear
                  />
                  <p className="text-muted-foreground text-xs">{t('employeePinHint')}</p>
                </div>
              </div>
              <Button
                disabled={!reprocessDate || !reprocessPin || admsBusy}
                onClick={() => setReprocessConfirmOpen(true)}
              >
                {t('reprocessDay')}
              </Button>
            </div>
          </Can>
        </TabsContent>
      </Tabs>

      {/* Backfill confirm dialog */}
      <AlertDialog open={backfillConfirmOpen} onOpenChange={setBackfillConfirmOpen}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmBackfillTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmBackfill', {
                from: repairFrom,
                to: repairTo,
                devicePart: repairDevice ? t('confirmBackfillDevice', { device: repairDevice }) : '',
                pinPart: repairPin ? t('confirmBackfillPin', { pin: repairPin }) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBackfillConfirmOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              isLoading={actions.backfill.isPending && actions.backfill.variables?.dry_run === false}
              onClick={() => {
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
                    setBackfillConfirmOpen(false);
                    toast.success(
                      t('backfillCompletedSuccess', {
                        scope: formatRepairScope(variables),
                        stored: res.data?.stored ?? 0,
                        days: res.data?.processed_days ?? 0,
                      }),
                    );
                    actions.invalidate();
                    if (!matchesRepairFilters(variables)) return;
                    setBackfillResult(
                      res.data
                        ? { ...res.data, rangeFrom: variables.from, rangeTo: variables.to }
                        : null,
                    );
                  },
                });
              }}
            >
              {t('runBackfill')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reprocess confirm dialog */}
      <AlertDialog open={reprocessConfirmOpen} onOpenChange={setReprocessConfirmOpen}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmReprocessTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmReprocess', { pin: reprocessPin, date: reprocessDate })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setReprocessConfirmOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              isLoading={actions.reprocess.isPending}
              onClick={() => {
                actions.reprocess.mutate(
                  {
                    date: reprocessDate,
                    pin: reprocessPin,
                    ...(reprocessUserId != null ? { employee_id: reprocessUserId } : {}),
                  },
                  { onSuccess: () => setReprocessConfirmOpen(false) },
                );
              }}
            >
              {t('reprocessDay')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  badge,
  compact,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-md border ${compact ? 'p-3' : 'p-4'}`}>
      <div className="text-muted-foreground mb-1 flex items-center justify-between gap-2 text-xs uppercase tracking-wide">
        <span className="min-w-0 truncate">{label}</span>
        {badge ? <span className="shrink-0">{badge}</span> : null}
      </div>
      <div className="truncate text-sm font-medium" title={value}>
        {value}
      </div>
    </div>
  );
}
