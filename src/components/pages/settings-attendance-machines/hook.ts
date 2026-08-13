'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('settings.attendanceMachines');
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['iclock'] });
  };

  const syncNow = useMutation({
    mutationFn: () => triggerIclockSync({ sync: true }),
    onSuccess: () => {
      toast.success(t('liveSyncCompleted'));
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('syncFailed')));
    },
  });

  const syncDevices = useMutation({
    mutationFn: () => syncIclockDevices(),
    onSuccess: (res) => {
      toast.success(t('syncedDevices', { count: res.data?.synced ?? 0 }));
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('deviceSyncFailed')));
    },
  });

  const reconcile = useMutation({
    mutationFn: reconcileIclock,
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('reconcileFailed')));
    },
  });

  const backfill = useMutation({
    mutationFn: backfillIclock,
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('backfillFailed')));
    },
  });

  const reprocess = useMutation({
    mutationFn: reprocessIclock,
    onSuccess: (res, variables) => {
      if (variables && 'from' in variables) {
        const data = res.data as {
          processed_days?: number;
          updated?: number;
        } | null;
        toast.success(
          t('rebuildCompletedSuccess', {
            scope: `${variables.from} → ${variables.to}${variables.pin ? `, PIN ${variables.pin}` : ''}`,
            days: data?.processed_days ?? 0,
            updated: data?.updated ?? 0,
          }),
        );
      } else {
        toast.success(res.message || t('reprocessCompleted'));
      }
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('reprocessFailed')));
    },
  });

  return { syncNow, syncDevices, reconcile, backfill, reprocess, invalidate };
}
