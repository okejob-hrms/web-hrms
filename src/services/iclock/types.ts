export type IclockHealth = {
  last_tid: number;
  last_did: number;
  last_synced_at: string | null;
  last_run_status: string | null;
  last_error: string | null;
  metadata: Record<string, number> | null;
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
  iclock_employee_code: string;
  punch_count: number;
  last_punched_at: string | null;
  first_punched_at: string | null;
};

export type IclockReconcileReport = {
  from: string;
  to: string;
  adms_count: number;
  hrms_count: number;
  missing_count: number;
  missing: Array<{
    iclock_log_id: number;
    pin: string | null;
    time: string | null;
    device: string | null;
    state: string | null;
  }>;
};

export type IclockBackfillResult = {
  stored: number;
  processed_days: number;
  created: number;
  updated: number;
  unmatched: number;
  skipped: number;
  failed: number;
  missing_before: number;
  dry_run: boolean;
};
