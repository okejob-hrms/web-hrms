// src/lib/menu.ts
export interface MenuItem {
  key: string;
  value?: string;
  subItem?: MenuItem[];
}

export const menus: Record<string, MenuItem[]> = {
  dashboard: [
    {
      key: 'offboarding',
      value: 'offboarding',
      subItem: [
        {
          key: 'activeOffboarding',
          value: 'dashboard?overview=offboarding-active',
        },
        {
          key: 'waitingOffboarding',
          value: 'dashboard?overview=offboarding-waiting',
        },
      ],
    },
    { key: 'attendanceApproval', value: 'dashboard?overview=attendance' },
    { key: 'leaveRequest', value: 'dashboard?overview=leave' },
    { key: 'overtimeRequest', value: 'dashboard?overview=overtime' },
    { key: 'payslipRequest', value: 'dashboard?overview=payslip' },
  ],
  employee: [
    { key: 'employeeManagement', value: 'employee/employee-management' },
    {
      key: 'organization',
      value: 'employee/organization',
      subItem: [
        {
          key: 'orgStructureChart',
          value: 'employee/organization/structure',
        },
        { key: 'position', value: 'employee/organization/position' },
        { key: 'teams', value: 'employee/organization/teams' },
        { key: 'jobLevels', value: 'employee/organization/job-level' },
        {
          key: 'department',
          value: 'employee/organization/department-management',
        },
      ],
    },
    {
      key: 'offboarding',
      value: 'employee/off-boarding',
    },
  ],

  attendance: [
    { key: 'attendanceTracker', value: 'attendance/attendance-tracker' },
    { key: 'leaveRequest', value: 'attendance/leave-request' },
    { key: 'overtime', value: 'attendance/over-time' },
    { key: 'businessTrip', value: 'attendance/business-trip' },
  ],

  payroll: [
    { key: 'payrunManagement', value: 'payroll/list' },
    { key: 'requestAccess', value: 'payroll/request' },
  ],

  settings: [
    { key: 'accessControl', value: 'settings/access-control' },
    {
      key: 'company',
      value: 'settings/company',
      subItem: [
        { key: 'companyProfile', value: 'settings/company/company-profile' },
        { key: 'branch', value: 'settings/company/company-branch' },
      ],
    },
    {
      key: 'timeAttendance',
      value: 'settings/time-attendence',
      subItem: [
        {
          key: 'attendanceConfiguration',
          value: 'settings/time-attendance/attendance-configuration',
        },
        {
          key: 'overtimeConfiguration',
          value: 'settings/time-attendance/overtime-configuration',
        },
        {
          key: 'holidayAttendance',
          value: 'settings/time-attendance/holiday',
        },
        {
          key: 'attendanceRule',
          value: 'settings/time-attendance/attendance-rule',
        },
      ],
    },
    { key: 'leaveConfiguration', value: 'settings/leave-management' },
    { key: 'formTemplate', value: 'settings/form-template' },
    {
      key: 'salaryManagement',
      value: 'settings/salary-management',
      subItem: [
        {
          key: 'baseSalaryManagement',
          value: 'settings/salary-management/base-salary',
        },
        {
          key: 'allowanceManagement',
          value: 'settings/salary-management/allowance',
        },
        {
          key: 'salaryDeductionManagement',
          value: 'settings/salary-management/deduction',
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
        },
        {
          key: 'assessmentScoreThreshold',
          value: 'settings/assessment-score',
        },
      ],
    },
  ],
  performance: [
    { key: 'selfAssessment', value: 'performance/self-assessment' },
    {
      key: 'supervisorAssessment',
      value: 'performance/supervisor-assessment',
    },
    {
      key: 'okr',
      value: 'performance/okr',
    },
    {
      key: 'kpi',
      value: 'performance/kpi',
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

  return segments.map((segment, index) => {
    const link = '/' + segments.slice(0, index + 1).join('/');
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
