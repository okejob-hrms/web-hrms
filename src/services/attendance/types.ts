export interface Attendance {
  id: number;
  name: string;
  email: string;
  id_number: string;
  avatar: string;
  latest_attendance: LatestAttendance | null;
  has_attendance: boolean;
  created_at: string;
  updated_at: string;
}

export interface LatestAttendance {
  id: number;
  attendance_date: string;
  clock: {
    in_at: string | null;
    out_at: string | null;
    duration: string | null;
  };
  duration: string | null;
  location: {
    latitude: string;
    longitude: string;
  } | null;
  shift_id: number | null;
  status: number;
  clock_in_status: number;
  clock_out_status: number;
  status_label: string;
  clock_in_status_label: string;
  clock_out_status_label: string;
  notes: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  remarks: string | null;
  metadata: {
    created_via: string;
    created_at: string;
    shift_id: number;
    shift_name: string;
    day_of_week: number;
    tolerance_minutes: number;
    work_schedule_id: number;
  } | null;
  created_at: string;
  updated_at: string;
}


export interface Location {
    latitude:  string;
    longitude: string;
}

export interface Status {
    label: string;
    value: number;
}

export interface User {
    employee_id: null;
    id: number;
    name: string;
    position: null;
    photo_profile: string;
}

export interface Links {
    first: string;
    last:  string;
    next:  null;
    prev:  null;
}

export interface Meta {
    current_page: number;
    from:         number;
    last_page:    number;
    links:        Link[];
    path:         string;
    per_page:     number;
    to:           number;
    total:        number;
}

export interface Link {
    active: boolean;
    label:  string;
    url:    null | string;
}

export interface RequestAttendance {
    attendance_date?: string;
    clock_in_at: string;
    clock_out_at?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    shift_id: number;
    user_id: number;
}

interface AttendanceStat {
  current: number;
  change: number;
}

export interface AttendanceSummary {
  data: {
    on_time: AttendanceStat;
    late_clock_in: AttendanceStat;
    early_clock_in: AttendanceStat;
    early_clock_out: AttendanceStat;
    overtime: AttendanceStat;
    absent: AttendanceStat;
    day_off: AttendanceStat;
  }
}

export interface AttendanceSummaryDetail {
  data: {
    period: {
        start: string;
        end: string;
        days: number;
    };
    attended: number;
    absent: number;
    status: {
        waiting: number;
        approved: number;
        rejected: number;
    };
    clock_in: {
        late: number;
        early: number;
        on_time: number;
    };
    clock_out: {
        late: number;
        early: number;
        on_time: number;
    };
    overtime: number;
    day_off: {
        used: number;
        quota: number;
    };
  }
}


export interface AttendanceDetail {
  id: number;
  attendance_date: string;
  clock: {
    in_at: string | null;
    out_at: string | null;
    duration: string | null;
  };
  duration: string | null;
  location: {
    latitude: string;
    longitude: string;
  };
  shift_id: number | null;
  status: number;
  clock_in_status: number;
  clock_out_status: number;
  status_label: string;
  clock_in_status_label: string;
  clock_out_status_label: string;
  notes: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  remarks: string | null;
  metadata: {
    created_via: string;
    created_at: string;
    shift_id: number;
    shift_name: string;
    day_of_week: number;
    tolerance_minutes: number;
    work_schedule_id: number;
  };
  created_at: string;
  updated_at: string;
}

export interface RequestAttendanceStatus {
    status: number;
}