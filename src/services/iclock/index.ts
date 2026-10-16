import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import type {
  IclockCsvSyncQueued,
  IclockDevice,
  IclockHealth,
  IclockIgnoredPin,
  IclockLog,
  IclockUnmatchedPin,
} from './types';

/** ADMS device list sync can exceed the default ky timeout. */
const ADMS_TIMEOUT_MS = 90_000;

type LogsParams = {
  pin?: string;
  device?: string;
  status?: string | number;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
};

export const getIclockHealth = async (): Promise<ApiResponse<IclockHealth>> => {
  return api.get('setting/iclock/health').json();
};

export const getIclockDevices = async (): Promise<ApiResponse<IclockDevice[]>> => {
  return api.get('setting/iclock/devices').json();
};

export const syncIclockDevices = async (): Promise<ApiResponse<{ synced: number; devices: IclockDevice[] }>> => {
  return api.post('setting/iclock/devices/sync', { json: {}, timeout: ADMS_TIMEOUT_MS }).json();
};

export const getIclockLogs = async (params: LogsParams = {}) => {
  const searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams[key] = String(value);
    }
  });
  return api.get('setting/iclock/logs', { searchParams }).json<ApiResponse<{
    data: IclockLog[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  }>>();
};

export const getIclockUnmatched = async (): Promise<ApiResponse<IclockUnmatchedPin[]>> => {
  return api.get('setting/iclock/unmatched').json();
};

export const getIclockIgnoredPins = async (): Promise<ApiResponse<IclockIgnoredPin[]>> => {
  return api.get('setting/iclock/ignored-pins').json();
};

export const ignoreIclockPins = async (payload: { pins: string[]; note?: string }) => {
  return api
    .post('setting/iclock/ignored-pins', { json: payload })
    .json<ApiResponse<{ added: number; already_ignored: number; logs_ignored: number }>>();
};

export const unignoreIclockPin = async (id: number) => {
  return api
    .delete(`setting/iclock/ignored-pins/${id}`)
    .json<ApiResponse<{ pin: string; logs_requeued: number }>>();
};

export const triggerIclockCsvSync = async (payload: { from: string; to: string }) => {
  return api
    .post('setting/iclock/csv-sync', { json: payload })
    .json<ApiResponse<IclockCsvSyncQueued>>();
};
