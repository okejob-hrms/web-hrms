import type { StatusKey } from '@/lib/i18n/status';

/** Map known English API response messages to translation keys under `api` namespace */
const API_MESSAGE_MAP: Record<string, string> = {
  'Login failed': 'loginFailed',
  'Invalid credentials': 'invalidCredentials',
  'Password is incorrect': 'passwordIncorrect',
  'Self Assessment deleted successfully': 'selfAssessmentDeleted',
  'Self Assessment Created Successfully': 'selfAssessmentCreated',
  'Leave Approved Successfully': 'leaveApproved',
  'Print access requested successfully, wait until the admin process your request':
    'printAccessRequested',
  'You do not have access to view this payslip, please request for access':
    'payslipAccessDenied',
};

export function resolveApiMessageKey(message: string): string | null {
  const trimmed = message.trim();
  if (API_MESSAGE_MAP[trimmed]) {
    return API_MESSAGE_MAP[trimmed];
  }
  const lower = trimmed.toLowerCase();
  const match = Object.entries(API_MESSAGE_MAP).find(
    ([key]) => key.toLowerCase() === lower,
  );
  return match ? match[1] : null;
}

export function translateApiMessage(
  message: string,
  t: (key: string) => string,
): string {
  const key = resolveApiMessageKey(message);
  if (key) {
    try {
      return t(key);
    } catch {
      return message;
    }
  }
  return message;
}

export type { StatusKey };
