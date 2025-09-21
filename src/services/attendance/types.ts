export interface Attendance {
    approved_at:     null;
    attendance_date: string;
    clock_in_at:     string;
    clock_out_at:    string;
    created_at:      string;
    duration:        null;
    id:              number;
    location:        Location;
    metadata:        null;
    notes:           string;
    rejected_reason: null;
    remarks:         null;
    status:          Status;
    updated_at:      string;
    user:            User;
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
    id:          number;
    name:        string;
    position:    null;
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
