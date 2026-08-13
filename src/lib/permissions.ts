import type { MenuItem } from '@/lib/menu';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'assign'
  | 'deactivate'
  | 'delete'
  | 'export'
  | 'approval'
  | 'override_status';

/** Top-level header module → any of these view permissions grants access */
export const HEADER_MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: [
    'dashboard.pending_offboarding.view',
    'dashboard.pending_attendance.view',
    'dashboard.pending_leave.view',
    'dashboard.pending_overtime.view',
    'dashboard.pending_payslip.view',
  ],
  employee: [
    'employee_organization.employee_profile.view',
    'employee_organization.organization_structure.view',
    'employee_organization.employee_assignment.view',
    'employee_organization.job_leveling_dictionary.view',
    'employee_organization.offboarding.view',
    'time_attendance.attendance_records.view',
    'payroll_management.payruns_setup.view',
  ],
  performance: [
    'performance_self_assessment.assessment_cycle.view',
    'performance_supervisor_assessment.assessment_cycle.view',
    'performance_okr.okr_cycle.view',
    'performance_kpi.kpi_cycle.view',
  ],
  settings: [
    'rbac.role_management.view',
    'general_settings.company_profile.view',
    'general_settings.company_branch.view',
    'general_settings.form_template.view',
    'time_attendance.attendance_configuration.view',
    'time_attendance.overtime_configuration.view',
    'time_attendance.holiday_attendance.view',
    'time_attendance.leave_configuration.view',
    'payroll_management.employee_salary_structure.view',
    'payroll_management.allowances_config.view',
    'payroll_management.deductions_config.view',
    'performance_settings.performance_competencies.view',
    'performance_settings.assessment_score_threshold.view',
  ],
  ess: ['ess.ess_portal.view', 'ess.ess_attendance.view', 'ess.ess_leave.view'],
};

/**
 * Path prefix → required view permission.
 * Longer prefixes should be checked first (sorted by length desc at runtime).
 */
export const ROUTE_VIEW_PERMISSIONS: Array<{
  match: RegExp | string;
  permission: string;
}> = [
  {
    match: /^\/dashboard/,
    permission: 'dashboard.pending_offboarding.view',
  },
  {
    match: '/employee/employee-management',
    permission: 'employee_organization.employee_profile.view',
  },
  {
    match: '/employee/organization/structure',
    permission: 'employee_organization.organization_structure.view',
  },
  {
    match: '/employee/organization/position',
    permission: 'employee_organization.employee_assignment.view',
  },
  {
    match: '/employee/organization/teams',
    permission: 'employee_organization.employee_assignment.view',
  },
  {
    match: '/employee/organization/job-level',
    permission: 'employee_organization.job_leveling_dictionary.view',
  },
  {
    match: '/employee/organization/department-management',
    permission: 'employee_organization.employee_assignment.view',
  },
  {
    match: '/employee/off-boarding',
    permission: 'employee_organization.offboarding.view',
  },
  {
    match: '/attendance/attendance-tracker',
    permission: 'time_attendance.attendance_records.view',
  },
  {
    match: '/attendance/leave-request',
    permission: 'time_attendance.leave_requests.view',
  },
  {
    match: '/attendance/over-time',
    permission: 'time_attendance.overtime_requests.view',
  },
  {
    match: '/payroll/list',
    permission: 'payroll_management.payruns_setup.view',
  },
  {
    match: '/payroll/request',
    permission: 'payroll_management.payslip_access_request.view',
  },
  {
    match: '/performance/self-assessment',
    permission: 'performance_self_assessment.assessment_cycle.view',
  },
  {
    match: '/performance/supervisor-assessment',
    permission: 'performance_supervisor_assessment.assessment_cycle.view',
  },
  {
    match: '/performance/okr',
    permission: 'performance_okr.okr_cycle.view',
  },
  {
    match: '/performance/kpi',
    permission: 'performance_kpi.kpi_cycle.view',
  },
  {
    match: '/settings/access-control',
    permission: 'rbac.role_management.view',
  },
  {
    match: '/settings/company/company-profile',
    permission: 'general_settings.company_profile.view',
  },
  {
    match: '/settings/company/company-branch',
    permission: 'general_settings.company_branch.view',
  },
  {
    match: '/settings/time-attendance/attendance-configuration',
    permission: 'time_attendance.attendance_configuration.view',
  },
  {
    match: '/settings/time-attendance/overtime-configuration',
    permission: 'time_attendance.overtime_configuration.view',
  },
  {
    match: '/settings/time-attendance/holiday',
    permission: 'time_attendance.holiday_attendance.view',
  },
  {
    match: '/settings/time-attendance/attendance-rule',
    permission: 'time_attendance.attendance_configuration.view',
  },
  {
    match: '/settings/time-attendance/attendance-machines',
    permission: 'time_attendance.attendance_configuration.view',
  },
  {
    match: '/settings/leave-management',
    permission: 'time_attendance.leave_configuration.view',
  },
  {
    match: '/settings/form-template',
    permission: 'general_settings.form_template.view',
  },
  {
    match: '/settings/salary-management/base-salary',
    permission: 'payroll_management.employee_salary_structure.view',
  },
  {
    match: '/settings/salary-management/allowance',
    permission: 'payroll_management.allowances_config.view',
  },
  {
    match: '/settings/salary-management/deduction',
    permission: 'payroll_management.deductions_config.view',
  },
  {
    match: '/settings/competencies',
    permission: 'performance_settings.performance_competencies.view',
  },
  {
    match: '/settings/assessment-score',
    permission: 'performance_settings.assessment_score_threshold.view',
  },
  {
    match: /^\/ess/,
    permission: 'ess.ess_portal.view',
  },
];

const DASHBOARD_OVERVIEW_PERMISSIONS: Record<string, string> = {
  'offboarding-active': 'dashboard.pending_offboarding.view',
  'offboarding-waiting': 'dashboard.pending_offboarding.view',
  attendance: 'dashboard.pending_attendance.view',
  leave: 'dashboard.pending_leave.view',
  overtime: 'dashboard.pending_overtime.view',
  payslip: 'dashboard.pending_payslip.view',
};

export function getRequiredViewPermission(
  pathname: string,
  searchParams?: URLSearchParams | null,
): string | null {
  if (pathname.startsWith('/auth') || pathname.startsWith('/docs')) {
    return null;
  }

  if (pathname.startsWith('/dashboard')) {
    const overview = searchParams?.get('overview') ?? 'offboarding-active';
    return (
      DASHBOARD_OVERVIEW_PERMISSIONS[overview] ??
      'dashboard.pending_offboarding.view'
    );
  }

  const sorted = [...ROUTE_VIEW_PERMISSIONS].sort((a, b) => {
    const aLen = typeof a.match === 'string' ? a.match.length : 0;
    const bLen = typeof b.match === 'string' ? b.match.length : 0;
    return bLen - aLen;
  });

  for (const rule of sorted) {
    if (typeof rule.match === 'string') {
      if (pathname.startsWith(rule.match)) {
        return rule.permission;
      }
    } else if (rule.match.test(pathname)) {
      return rule.permission;
    }
  }

  return null;
}

export function filterMenuItemsByPermission(
  items: MenuItem[],
  can: (permission: string) => boolean,
): MenuItem[] {
  return items
    .map((item) => {
      if (item.subItem?.length) {
        const filteredSub = filterMenuItemsByPermission(item.subItem, can);
        if (filteredSub.length === 0) {
          return null;
        }
        return { ...item, subItem: filteredSub };
      }

      if (!item.permission) {
        return item;
      }

      return can(item.permission) ? item : null;
    })
    .filter((item): item is MenuItem => item !== null);
}

export function canAccessHeaderModule(
  moduleName: string,
  canAny: (permissions: string[]) => boolean,
): boolean {
  const permissions = HEADER_MODULE_PERMISSIONS[moduleName];
  if (!permissions) {
    return true;
  }
  return canAny(permissions);
}

function normalizeRoleName(role: string): string {
  return role
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Matches Spatie role `Super Admin` and common variants. */
export function hasSuperAdminRole(roles: string[]): boolean {
  return roles.some((role) => {
    const normalized = normalizeRoleName(role);
    return normalized === 'super admin' || normalized === 'superadmin';
  });
}

function getStoredUserEmail(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return typeof user?.email === 'string' ? user.email : '';
  } catch {
    return '';
  }
}

/**
 * Full frontend RBAC bypass:
 * 1. User has Super Admin role → allow all
 * 2. Otherwise, email contains "superadmin" → allow all
 */
export function hasFullRbacAccess(roles: string[]): boolean {
  if (hasSuperAdminRole(roles)) {
    return true;
  }

  return getStoredUserEmail().toLowerCase().includes('superadmin');
}

/** Employee-only UX should not apply to Super Admin / email-based full access. */
export function isEmployeeOnlyAccess(roles: string[]): boolean {
  if (hasFullRbacAccess(roles)) {
    return false;
  }

  return roles.length === 1 && String(roles[0]).toLowerCase() === 'employee';
}
