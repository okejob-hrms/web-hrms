'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  backfillIclock,
  getIclockDevices,
  getIclockHealth,
  getIclockLogs,
  getIclockUnmatched,
  reconcileIclock,
  reprocessIclock,
  syncIclockDevices,
  triggerIclockSync,
} from '@/services/iclock';

export function useIclockHealth(enabled = true) {
  return useQuery({
    queryKey: ['iclock', 'health'],
    queryFn: async () => (await getIclockHealth()).data,
    refetchInterval: 60_000,
    enabled,
  });
}

export function useIclockDevices(enabled = true) {
  return useQuery({
    queryKey: ['iclock', 'devices'],
    queryFn: async () => (await getIclockDevices()).data ?? [],
    enabled,
  });
}

export function useIclockLogs(
  params: {
    pin?: string;
    device?: string;
    from?: string;
    to?: string;
    page?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ['iclock', 'logs', params],
    queryFn: async () => (await getIclockLogs(params)).data,
    enabled,
  });
}

export function useIclockUnmatched(enabled = true) {
  return useQuery({
    queryKey: ['iclock', 'unmatched'],
    queryFn: async () => (await getIclockUnmatched()).data ?? [],
    enabled,
  });
}

export function useIclockActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['iclock'] });
  };

  const syncNow = useMutation({
    mutationFn: () => triggerIclockSync({ sync: true }),
    onSuccess: () => {
      toast.success('Live iClock sync completed');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || 'Sync failed'),
  });

  const syncDevices = useMutation({
    mutationFn: () => syncIclockDevices(),
    onSuccess: (res) => {
      toast.success(`Synced ${res.data?.synced ?? 0} device(s)`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || 'Device sync failed'),
  });

  const reconcile = useMutation({
    mutationFn: reconcileIclock,
    onError: (e: Error) => toast.error(e.message || 'Reconcile failed'),
  });

  const backfill = useMutation({
    mutationFn: backfillIclock,
    onSuccess: (res) => {
      const dryRun = Boolean(res.data?.dry_run);
      if (dryRun) {
        toast.success(
          `Backfill dry-run: ${res.data?.missing_before ?? 0} missing punch(es), would store ${res.data?.stored ?? 0}`,
        );
        return;
      }
      toast.success(
        `Backfill completed: stored ${res.data?.stored ?? 0}, days ${res.data?.processed_days ?? 0}`,
      );
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || 'Backfill failed'),
  });

  const reprocess = useMutation({
    mutationFn: reprocessIclock,
    onSuccess: (res) => {
      toast.success(res.message || 'Reprocess completed');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || 'Reprocess failed'),
  });

  return { syncNow, syncDevices, reconcile, backfill, reprocess };
}
