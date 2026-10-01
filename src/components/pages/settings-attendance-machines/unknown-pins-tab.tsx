'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { getErrorMessage } from '@/components/shared/shift-roster/utils';
import {
  getIclockIgnoredPins,
  getIclockUnmatched,
  ignoreIclockPins,
  unignoreIclockPin,
} from '@/services/iclock';
import type { IclockIgnoredPin } from '@/services/iclock/types';

function formatDt(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

export function UnknownPinsTab({ enabled, canEdit }: { enabled: boolean; canEdit: boolean }) {
  const t = useTranslations('settings.attendanceMachines');
  const qc = useQueryClient();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [ignoreOpen, setIgnoreOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [unignoreTarget, setUnignoreTarget] = React.useState<IclockIgnoredPin | null>(null);

  const unmatchedQuery = useQuery({
    queryKey: ['iclock', 'unmatched'],
    queryFn: async () => (await getIclockUnmatched()).data ?? [],
    enabled,
  });
  const ignoredQuery = useQuery({
    queryKey: ['iclock', 'ignored-pins'],
    queryFn: async () => (await getIclockIgnoredPins()).data ?? [],
    enabled,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['iclock', 'unmatched'] });
    qc.invalidateQueries({ queryKey: ['iclock', 'ignored-pins'] });
  };
  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('tryAgain')));

  const ignoreMutation = useMutation({
    mutationFn: () =>
      ignoreIclockPins({
        pins: selected.filter((pin) => (unmatchedQuery.data ?? []).some((row) => row.pin === pin)),
        note: note.trim() || undefined,
      }),
    onSuccess: (res) => {
      toast.success(t('pinsIgnored', { count: res.data?.added ?? 0, logs: res.data?.logs_ignored ?? 0 }));
      setSelected([]);
      setNote('');
      setIgnoreOpen(false);
      refresh();
    },
    onError,
  });

  const unignoreMutation = useMutation({
    mutationFn: (id: number) => unignoreIclockPin(id),
    onSuccess: (res) => {
      toast.success(t('pinUnignored', { pin: res.data?.pin ?? '', logs: res.data?.logs_requeued ?? 0 }));
      setUnignoreTarget(null);
      refresh();
    },
    onError,
  });

  const rows = unmatchedQuery.data ?? [];
  const visibleSelected = selected.filter((pin) => rows.some((row) => row.pin === pin));
  const allSelected = rows.length > 0 && visibleSelected.length === rows.length;
  const toggle = (pin: string, on: boolean) =>
    setSelected((s) => (on ? Array.from(new Set([...s, pin])) : s.filter((p) => p !== pin)));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">{t('unknownPinsTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('unknownPinsHint')}</p>
          </div>
          {canEdit ? (
            <Button disabled={!visibleSelected.length} onClick={() => setIgnoreOpen(true)}>
              {t('markPartTimer', { count: visibleSelected.length })}
            </Button>
          ) : null}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {canEdit ? (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      aria-label={t('selectAll')}
                      onCheckedChange={(v) => setSelected(v === true ? rows.map((r) => r.pin) : [])}
                    />
                  </TableHead>
                ) : null}
                <TableHead>{t('pin')}</TableHead>
                <TableHead>{t('enrolledName')}</TableHead>
                <TableHead>{t('punches')}</TableHead>
                <TableHead>{t('first')}</TableHead>
                <TableHead>{t('last')}</TableHead>
                <TableHead>{t('devices')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatchedQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-destructive text-center">
                    {t('failedLoadUnmatched', { message: unmatchedQuery.error?.message || t('tryAgain') })}
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((row) => (
                <TableRow key={row.pin}>
                  {canEdit ? (
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(row.pin)}
                        aria-label={row.pin}
                        onCheckedChange={(v) => toggle(row.pin, v === true)}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="font-medium">{row.pin}</TableCell>
                  <TableCell>{row.name ?? '—'}</TableCell>
                  <TableCell>{row.punch_count}</TableCell>
                  <TableCell>{formatDt(row.first_punched_at)}</TableCell>
                  <TableCell>{formatDt(row.last_punched_at)}</TableCell>
                  <TableCell className="text-xs">{row.devices.join(', ') || '—'}</TableCell>
                </TableRow>
              ))}
              {unmatchedQuery.isSuccess && !rows.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center">{t('noUnmatchedPins')}</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-medium">{t('ignoredPinsTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('ignoredPinsHint')}</p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pin')}</TableHead>
                <TableHead>{t('note')}</TableHead>
                <TableHead>{t('addedBy')}</TableHead>
                <TableHead>{t('addedAt')}</TableHead>
                {canEdit ? <TableHead className="text-right">{t('actions')}</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ignoredQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-destructive text-center">{t('failedLoadIgnored')}</TableCell>
                </TableRow>
              ) : null}
              {(ignoredQuery.data ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.pin}</TableCell>
                  <TableCell>{row.note ?? '—'}</TableCell>
                  <TableCell>{row.created_by?.name ?? '—'}</TableCell>
                  <TableCell>{formatDt(row.created_at)}</TableCell>
                  {canEdit ? (
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setUnignoreTarget(row)}>
                        {t('unignore')}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {ignoredQuery.isSuccess && !ignoredQuery.data.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center">{t('noIgnoredPins')}</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={ignoreOpen} onOpenChange={setIgnoreOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('markPartTimerTitle')}</DialogTitle>
            <DialogDescription>{t('markPartTimerConfirm', { pins: visibleSelected.join(', ') })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('note')}</Label>
            <Input value={note} maxLength={255} placeholder={t('notePlaceholder')} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIgnoreOpen(false)}>{t('cancel')}</Button>
            <Button disabled={ignoreMutation.isPending} onClick={() => ignoreMutation.mutate()}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(unignoreTarget)} onOpenChange={(open) => !open && setUnignoreTarget(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('unignoreTitle')}</DialogTitle>
            <DialogDescription>{t('unignoreConfirm', { pin: unignoreTarget?.pin ?? '' })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnignoreTarget(null)}>{t('cancel')}</Button>
            <Button
              disabled={unignoreMutation.isPending}
              onClick={() => unignoreTarget && unignoreMutation.mutate(unignoreTarget.id)}
            >
              {t('unignore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
