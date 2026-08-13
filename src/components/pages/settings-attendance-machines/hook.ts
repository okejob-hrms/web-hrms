'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { toast } from 'sonner';
import type { ApiErrorResponse } from '@/lib/types';
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

async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse;
      if (errorData.message) {
        return errorData.message;
      }
      if (errorData.errors) {
        const firstFieldErrors = Object.values(errorData.errors)[0];
        if (firstFieldErrors?.[0]) {
          return firstFieldErrors[0];
        }
      }
    } catch {
      // fall through
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

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
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, 'Sync failed'));
    },
  });

  const syncDevices = useMutation({
    mutationFn: () => syncIclockDevices(),
    onSuccess: (res) => {
      toast.success(`Synced ${res.data?.synced ?? 0} device(s)`);
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, 'Device sync failed'));
    },
  });

  const reconcile = useMutation({
    mutationFn: reconcileIclock,
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, 'Reconcile failed'));
    },
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
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, 'Backfill failed'));
    },
  });

  const reprocess = useMutation({
    mutationFn: reprocessIclock,
    onSuccess: (res) => {
      toast.success(res.message || 'Reprocess completed');
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, 'Reprocess failed'));
    },
  });

  return { syncNow, syncDevices, reconcile, backfill, reprocess };
}
