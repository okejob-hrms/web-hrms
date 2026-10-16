'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { ApiErrorResponse } from '@/lib/types';
import {
  getIclockDevices,
  getIclockHealth,
  getIclockLogs,
  syncIclockDevices,
  triggerIclockCsvSync,
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

export function useIclockHealth(enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: ['iclock', 'health'],
    queryFn: async () => (await getIclockHealth()).data,
    refetchInterval: refetchInterval === undefined ? 60_000 : refetchInterval,
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

export function useIclockActions() {
  const t = useTranslations('settings.attendanceMachines');
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['iclock'] });
  };

  const syncDevices = useMutation({
    mutationFn: () => syncIclockDevices(),
    onSuccess: (res) => {
      toast.success(t('syncedDevices', { count: res.data?.synced ?? 0 }));
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('syncDevicesFailed')));
    },
  });

  const csvSync = useMutation({
    mutationFn: (payload: { from: string; to: string }) => triggerIclockCsvSync(payload),
    onSuccess: (res) => {
      toast.success(t('csvSyncQueued', { runId: res.data?.run_id ?? '' }));
      invalidate();
    },
    onError: async (e: unknown) => {
      toast.error(await getErrorMessage(e, t('csvSyncFailed')));
    },
  });

  return { syncDevices, csvSync };
}
