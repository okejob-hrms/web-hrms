// src/lib/menu.ts
export interface MenuItem {
  key: string;
  value?: string;
  /** Required view permission; omit to always show when parent is visible */
  permission?: string;
  subItem?: MenuItem[];
}

export const menus: Record<string, MenuItem[]> = {
  dashboard: [
    {
      key: 'offboarding',
      value: 'offboarding',
      permission: 'dashboard.pending_offboarding.view',
      subItem: [
        {
          key: 'activeOffboarding',
          value: 'dashboard?overview=offboarding-active',
          permission: 'dashboard.pending_offboarding.view',
        },
        {
          key: 'waitingOffboarding',
          value: 'dashboard?overview=offboarding-waiting',
          permission: 'dashboard.pending_offboarding.view',
        },
      ],
    },
    {
      key: 'attendanceApproval',
      value: 'dashboard?overview=attendance',
      permission: 'dashboard.pending_attendance.view',
    },
    {
      key: 'leaveRequest',
      value: 'dashboard?overview=leave',
      permission: 'dashboard.pending_leave.view',
    },
    {
      key: 'overtimeRequest',
      value: 'dashboard?overview=overtime',
      permission: 'dashboard.pending_overtime.view',
    },
    {
      key: 'payslipRequest',
      value: 'dashboard?overview=payslip',
      permission: 'dashboard.pending_payslip.view',
    },
  ],
  employee: [
    {
      key: 'employeeManagement',
      value: 'employee/employee-management',
      permission: 'employee_organization.employee_profile.view',
    },
    {
      key: 'organization',
      value: 'employee/organization',
      subItem: [
        {
          key: 'orgStructureChart',
          value: 'employee/organization/structure',
          permission: 'employee_organization.organization_structure.view',
        },
        {
          key: 'position',
          value: 'employee/organization/position',
          permission: 'employee_organization.employee_assignment.view',
        },
        {
          key: 'teams',
          value: 'employee/organization/teams',
          permission: 'employee_organization.employee_assignment.view',
        },
        {
          key: 'jobLevels',
          value: 'employee/organization/job-level',
          permission: 'employee_organization.job_leveling_dictionary.view',
        },
        {
          key: 'department',
          value: 'employee/organization/department-management',
          permission: 'employee_organization.employee_assignment.view',
        },
      ],
    },
    {
      key: 'offboarding',
      value: 'employee/off-boarding',
      permission: 'employee_organization.offboarding.view',
    },
  ],

  attendance: [
    {
      key: 'attendanceTracker',
      value: 'attendance/attendance-tracker',
      permission: 'time_attendance.attendance_records.view',
    },
    {
      key: 'leaveRequest',
      value: 'attendance/leave-request',
      permission: 'time_attendance.leave_requests.view',
    },
    {
      key: 'overtime',
      value: 'attendance/over-time',
      permission: 'time_attendance.overtime_requests.view',
    },
    {
      key: 'businessTrip',
      value: 'attendance/business-trip',
    },
  ],

  payroll: [
    {
      key: 'payrunManagement',
      value: 'payroll/list',
      permission: 'payroll_management.payruns_setup.view',
    },
    {
      key: 'requestAccess',
      value: 'payroll/request',
      permission: 'payroll_management.payslip_access_request.view',
    },
  ],

  settings: [
    {
      key: 'accessControl',
      value: 'settings/access-control',
      permission: 'rbac.role_management.view',
    },
    {
      key: 'company',
      value: 'settings/company',
      subItem: [
        {
          key: 'companyProfile',
          value: 'settings/company/company-profile',
          permission: 'general_settings.company_profile.view',
        },
        {
          key: 'branch',
          value: 'settings/company/company-branch',
          permission: 'general_settings.company_branch.view',
        },
      ],
    },
    {
      key: 'timeAttendance',
      value: 'settings/time-attendence',
      subItem: [
        {
          key: 'attendanceConfiguration',
          value: 'settings/time-attendance/attendance-configuration',
          permission: 'time_attendance.attendance_configuration.view',
        },
        {
          key: 'overtimeConfiguration',
          value: 'settings/time-attendance/overtime-configuration',
          permission: 'time_attendance.overtime_configuration.view',
        },
        {
          key: 'holidayAttendance',
          value: 'settings/time-attendance/holiday',
          permission: 'time_attendance.holiday_attendance.view',
        },
        {
          key: 'attendanceRule',
          value: 'settings/time-attendance/attendance-rule',
          permission: 'time_attendance.attendance_configuration.view',
        },
      ],
    },
    {
      key: 'leaveConfiguration',
      value: 'settings/leave-management',
      permission: 'time_attendance.leave_configuration.view',
    },
    {
      key: 'formTemplate',
      value: 'settings/form-template',
      permission: 'general_settings.form_template.view',
    },
    {
      key: 'salaryManagement',
      value: 'settings/salary-management',
      subItem: [
        {
          key: 'baseSalaryManagement',
          value: 'settings/salary-management/base-salary',
          permission: 'payroll_management.employee_salary_structure.view',
        },
        {
          key: 'allowanceManagement',
          value: 'settings/salary-management/allowance',
          permission: 'payroll_management.allowances_config.view',
        },
        {
          key: 'salaryDeductionManagement',
          value: 'settings/salary-management/deduction',
          permission: 'payroll_management.deductions_config.view',
        },
      ],
    },
    {
      key: 'performanceManagement',
      value: 'settings/competencies',
      subItem: [
        {
          key: 'performanceCompetencies',
          value: 'settings/competencies',
          permission: 'performance_settings.performance_competencies.view',
        },
        {
          key: 'assessmentScoreThreshold',
          value: 'settings/assessment-score',
          permission: 'performance_settings.assessment_score_threshold.view',
        },
      ],
    },
  ],
  performance: [
    {
      key: 'selfAssessment',
      value: 'performance/self-assessment',
      permission: 'performance_self_assessment.assessment_cycle.view',
    },
    {
      key: 'supervisorAssessment',
      value: 'performance/supervisor-assessment',
      permission: 'performance_supervisor_assessment.assessment_cycle.view',
    },
    {
      key: 'okr',
      value: 'performance/okr',
      permission: 'performance_okr.okr_cycle.view',
    },
    {
      key: 'kpi',
      value: 'performance/kpi',
      permission: 'performance_kpi.kpi_cycle.view',
    },
  ],
};

const BREADCRUMB_SEGMENT_KEYS: Record<string, string> = {
  dashboard: 'dashboard',
  employee: 'employee',
  'employee-management': 'employeeManagement',
  organization: 'organization',
  structure: 'structure',
  position: 'position',
  teams: 'teams',
  'job-level': 'jobLevel',
  'department-management': 'departmentManagement',
  'off-boarding': 'offBoarding',
  attendance: 'attendance',
  'attendance-tracker': 'attendanceTracker',
  'leave-request': 'leaveRequest',
  'over-time': 'overTime',
  'business-trip': 'businessTrip',
  payroll: 'payroll',
  list: 'list',
  request: 'request',
  performance: 'performance',
  'self-assessment': 'selfAssessment',
  'supervisor-assessment': 'supervisorAssessment',
  okr: 'okr',
  kpi: 'kpi',
  settings: 'settings',
  'access-control': 'accessControl',
  company: 'company',
  'company-profile': 'companyProfile',
  'company-branch': 'companyBranch',
  'time-attendance': 'timeAttendance',
  'attendance-configuration': 'attendanceConfiguration',
  'overtime-configuration': 'overtimeConfiguration',
  holiday: 'holiday',
  'attendance-rule': 'attendanceRule',
  'leave-management': 'leaveManagement',
  'form-template': 'formTemplate',
  'salary-management': 'salaryManagement',
  'base-salary': 'baseSalary',
  allowance: 'allowance',
  deduction: 'deduction',
  competencies: 'competencies',
  'assessment-score': 'assessmentScore',
  ess: 'ess',
  auth: 'auth',
  login: 'login',
  'reset-password': 'resetPassword',
  'change-password': 'changePassword',
  'mail-confirm': 'mailConfirm',
  add: 'add',
  edit: 'edit',
};

export function getBreadcrumbKey(segment: string): string | null {
  return BREADCRUMB_SEGMENT_KEYS[segment] ?? null;
}

export const getGenerateTitle = (title: string) => {
  if (!title) return '';

  const segments = title.split('/').filter(Boolean);

  if (segments.length === 0) return '';

  const firstSegment = segments[0];

  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
};

export const getHideSidebar = (path: string) => {
  const hidePath = [
    '/auth',
    '/dashboard',
    '/settings/access-control/',
    '/settings/company/company-profile/edit',
    '/employee/organization/structure/edit',
    '/attendance/attendance-tracker/',
    '/attendance/leave-request/add',
    '/settings/time-attendance/attendance-configuration/edit',
    '/settings/time-attendance/overtime-configuration/edit',
    '/settings/form-template/add',
    '/settings/form-template/edit',
    '/settings/company/company-branch/',
    '/payroll/list/',
    '/settings/leave-management/',
    '/performance/self-assessment/add',
    '/ess/',
    '/ess',
  ];

  const employeeDetailPattern = /^\/employee\/employee-management\/\d+$/;
  const offboardingDetailPattern = /^\/employee\/off-boarding\/\d+$/;
  const salaryAdjustmentPattern =
    /^\/employee\/off-boarding\/\d+\/salary-adjustment$/;
  const leaveRequestEditPattern = /^\/attendance\/leave-request\/edit\/\d+$/;
  const selfAssessmentEmployeeDetailsPattern =
    /^\/performance\/self-assessment\/[^/]+/;
  const selfAssessmentPeriodDetailsPattern =
    /^\/performance\/self-assessment\/[^/]+\/\d+$/;
  const supervisorAssessmentDetailPattern =
    /^\/performance\/supervisor-assessment\/\d+$/;
  const competenciesDetailsPattern = /^\/settings\/competencies\/\d+$/;
  const formTemplateDetailsPattern = /^\/settings\/form-template\/\d+$/;
  const performanceOKRDetailsPattern = /^\/performance\/okr\/\d+$/;

  if (employeeDetailPattern.test(path)) {
    return true;
  }

  if (offboardingDetailPattern.test(path)) {
    return true;
  }

  if (salaryAdjustmentPattern.test(path)) {
    return true;
  }

  if (leaveRequestEditPattern.test(path)) {
    return true;
  }

  if (selfAssessmentEmployeeDetailsPattern.test(path)) {
    return true;
  }

  if (selfAssessmentPeriodDetailsPattern.test(path)) {
    return true;
  }

  if (competenciesDetailsPattern.test(path)) {
    return true;
  }

  if (formTemplateDetailsPattern.test(path)) {
    return true;
  }

  if (supervisorAssessmentDetailPattern.test(path)) {
    return true;
  }

  const matchedHidePath = hidePath.find((p) => path.startsWith(p));
  if (matchedHidePath) {
    return true;
  }

  if (performanceOKRDetailsPattern.test(path)) {
    return true;
  }

  return false;
};

export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  // Parent segments that have no index route — link to the primary child page.
  const linkOverrides: Record<string, string> = {
    '/payroll': '/payroll/list',
  };

  return segments.map((segment, index) => {
    const rawLink = '/' + segments.slice(0, index + 1).join('/');
    const link = linkOverrides[rawLink] ?? rawLink;
    const key = getBreadcrumbKey(segment);

    return {
      segment,
      key,
      link,
    };
  });
};

export const getLastPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : '';
};

export const toTitleCase = (str: string) => {
  return str
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
