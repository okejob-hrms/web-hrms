export type StatusKey =
  | 'unknown'
  | 'approved'
  | 'waiting'
  | 'waitingForApproval'
  | 'rejected'
  | 'cancelled'
  | 'absent'
  | 'onTime'
  | 'early'
  | 'late'
  | 'draft'
  | 'final'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'active'
  | 'expired'
  | 'notStarted'
  | 'inProgress'
  | 'validated'
  | 'archived';

const ENGLISH_LABEL_TO_KEY: Record<string, StatusKey> = {
  Approved: 'approved',
  Waiting: 'waiting',
  'Waiting for Approval': 'waitingForApproval',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
  Absent: 'absent',
  'On Time': 'onTime',
  Early: 'early',
  Late: 'late',
  Draft: 'draft',
  Final: 'final',
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
  Active: 'active',
  Expired: 'expired',
  'Not Started': 'notStarted',
  'In Progress': 'inProgress',
  Validated: 'validated',
  Archived: 'archived',
  Unknown: 'unknown',
};

export function resolveStatusKey(
  value: string | number | null | undefined,
): StatusKey {
  if (value === null || value === undefined || value === '') {
    return 'unknown';
  }

  if (typeof value === 'number') {
    return resolveNumericStatusKey(value);
  }

  const trimmed = value.trim();
  if (ENGLISH_LABEL_TO_KEY[trimmed]) {
    return ENGLISH_LABEL_TO_KEY[trimmed];
  }

  const lower = trimmed.toLowerCase().replace(/\s+/g, '');
  const fromLower = Object.entries(ENGLISH_LABEL_TO_KEY).find(
    ([label]) => label.toLowerCase().replace(/\s+/g, '') === lower,
  );
  if (fromLower) {
    return fromLower[1];
  }

  return 'unknown';
}

function resolveNumericStatusKey(value: number): StatusKey {
  switch (value) {
    case 0:
      return 'waiting';
    case 1:
      return 'approved';
    case 2:
      return 'rejected';
    case 3:
      return 'cancelled';
    default:
      return 'unknown';
  }
}

export function resolveBusinessTripStatusKey(status?: number): StatusKey {
  switch (status) {
    case 0:
      return 'waiting';
    case 1:
      return 'approved';
    case 2:
      return 'rejected';
    case 3:
      return 'cancelled';
    default:
      return 'unknown';
  }
}

export function resolveOvertimeStatusKey(status?: number): StatusKey {
  switch (status) {
    case 1:
      return 'waitingForApproval';
    case 2:
      return 'approved';
    case 3:
      return 'rejected';
    default:
      return 'unknown';
  }
}

export function resolveSelfAssessmentStatusKey(status: number): StatusKey {
  switch (status) {
    case 1:
      return 'active';
    case 2:
      return 'completed';
    case 3:
      return 'expired';
    default:
      return 'unknown';
  }
}

export type OffboardingHandoverStatusKey =
  | 'pending'
  | 'waitingApproval'
  | 'received'
  | 'rejected'
  | 'awaitingReturn'
  | 'returned'
  | 'lost'
  | 'damaged'
  | 'cancelled';

const OFFBOARDING_HANDOVER_LABEL_TO_KEY: Record<
  string,
  OffboardingHandoverStatusKey
> = {
  Pending: 'pending',
  'Waiting Approval': 'waitingApproval',
  Received: 'received',
  Rejected: 'rejected',
  'Awaiting Return': 'awaitingReturn',
  Returned: 'returned',
  Lost: 'lost',
  Damaged: 'damaged',
  Cancelled: 'cancelled',
};

export function resolveOffboardingHandoverLabelKey(
  label: string,
): OffboardingHandoverStatusKey | null {
  return OFFBOARDING_HANDOVER_LABEL_TO_KEY[label] ?? null;
}

export function resolveOffboardingRecipientStatusKey(
  status: number,
): OffboardingHandoverStatusKey {
  switch (status) {
    case 1:
      return 'waitingApproval';
    case 2:
      return 'received';
    case 3:
      return 'rejected';
    default:
      return 'pending';
  }
}

export function resolveOffboardingEquipmentStatusKey(
  status: number,
): OffboardingHandoverStatusKey {
  switch (status) {
    case 1:
      return 'pending';
    case 2:
      return 'waitingApproval';
    case 3:
      return 'received';
    case 4:
      return 'rejected';
    case 5:
      return 'awaitingReturn';
    case 6:
      return 'returned';
    case 7:
      return 'lost';
    case 8:
      return 'damaged';
    case 9:
      return 'cancelled';
    default:
      return 'pending';
  }
}

export function translateOffboardingHandoverStatus(
  key: OffboardingHandoverStatusKey,
  t: (key: string) => string,
  tStatus: (key: string) => string,
): string {
  if (key === 'rejected') {
    return tStatus('rejected');
  }
  if (key === 'cancelled') {
    return tStatus('cancelled');
  }
  return t(key);
}

export function translateOffboardingHandoverStatusLabel(
  status: number | undefined,
  statusLabel: string | undefined,
  resolveKey: (status: number) => OffboardingHandoverStatusKey,
  t: (key: string) => string,
  tStatus: (key: string) => string,
): string {
  if (status !== undefined) {
    return translateOffboardingHandoverStatus(resolveKey(status), t, tStatus);
  }
  if (statusLabel) {
    const labelKey = resolveOffboardingHandoverLabelKey(statusLabel);
    if (labelKey) {
      return translateOffboardingHandoverStatus(labelKey, t, tStatus);
    }
    return statusLabel;
  }
  return '-';
}
