export type IclockCsvSyncSummary = {
  run_id?: string;
  from?: string;
  to?: string;
  rows_read?: number;
  unknown_pins?: number;
  ignored_pins?: number;
  writes?: number;
  unresolved_punches?: number;
  inserted?: number;
  updated?: number;
  deleted?: number;
  deleted_replaced?: number;
  deleted_own_stale?: number;
  skipped_approved?: number;
  skipped_manual?: number;
  kept_absent?: number;
  total_s?: number;
  report_dir?: string | null;
  by_resolution?: Record<string, number>;
};

export type IclockCsvSyncState = {
  run_id: string;
  status: 'queued' | 'exporting' | 'importing' | 'completed' | 'failed' | string;
  from: string;
  to: string;
  tenant_id?: number;
  started_at?: string | null;
  finished_at?: string | null;
  summary?: IclockCsvSyncSummary | null;
  error?: string | null;
  report_dir?: string | null;
};

export type IclockHealth = {
  last_synced_at: string | null;
  last_run_status: string | null;
  last_error: string | null;
  last_run_kind?: string | null;
  csv_sync?: IclockCsvSyncState | null;
  metadata: Record<string, number | string | null> | null;
  stale: boolean;
  stale_after_minutes: number;
  api_url: string;
};

export type IclockDevice = {
  id: number;
  serial: string;
  ip: string | null;
  alias: string | null;
  last_seen_at: string | null;
  last_punch_at: string | null;
  punches_last_24h?: number;
  quiet?: boolean;
};

export type IclockLog = {
  id: number;
  iclock_log_id: number;
  iclock_employee_code: string;
  punched_at: string;
  device_sn: string | null;
  punch_state: string | null;
  verify_method: string | null;
  status: number;
  attendance_id: number | null;
  error_message: string | null;
};

export type IclockUnmatchedPin = {
  pin: string;
  name: string | null;
  punch_count: number;
  last_punched_at: string | null;
  first_punched_at: string | null;
  devices: string[];
};

export type IclockIgnoredPin = {
  id: number;
  pin: string;
  note: string | null;
  created_at: string | null;
  created_by?: { id: number; name: string } | null;
};

export type IclockCsvSyncQueued = {
  run_id: string;
  status: string;
  from: string;
  to: string;
  tenant_id: number;
};
