// src/config/menu.ts
interface MenuItem {
  name: string;
  value?: string;
  subItem?: MenuItem[];
}

export const menus: Record<string, MenuItem[]> = {
  dashboard: [],
  employee: [
    { name: "Employee Management", value: "employee/employee-management" },
    {
      name: "Organization",
      value: "employee/organization",
      subItem: [
        {
          name: "Org. Structure Chart",
          value: "employee/organization/structure",
        },
        { name: "Position", value: "employee/organization/position" },
        { name: "Teams", value: "employee/organization/teams" },
        { name: "Job Levels", value: "employee/organization/job-level" },
        {
          name: "Department",
          value: "employee/organization/department-management",
        },
      ],
    },
    {
      name: "Offboarding",
      value: "employee/off-boarding",
    },
  ],

  attendance: [
    { name: "Attandance Tracker", value: "attendance/attendance-tracker" },
    { name: "Leave Request", value: "attendance/leave-request" },
    { name: "Overtime", value: "attendance/over-time" },
  ],

  payroll: [
    { name: "Payrun Management", value: "payroll/list" },
    { name: "Request Access", value: "payroll/request" },
  ],

  settings: [
    { name: "Access Control", value: "settings/access-control" },
    {
      name: "Company",
      value: "settings/company",
      subItem: [
        { name: "Company Profile", value: "settings/company/company-profile" },
        { name: "Branch", value: "settings/company/company-branch" },
      ],
    },
    {
      name: "Time & Attendence",
      value: "settings/time-attendence",
      subItem: [
        {
          name: "Attendance Configuration",
          value: "settings/time-attendance/attendance-configuration",
        },
        {
          name: "Overtime Configuration",
          value: "settings/time-attendance/overtime-configuration",
        },
      ],
    },
    { name: "Leave Configuration", value: "settings/leave-management" },
    { name: "Form Template", value: "settings/form-template" },
    {
      name: "Salary Management",
      value: "settings/salary-management",
      subItem: [
        {
          name: "Base Salary Management",
          value: "settings/salary-management/base-salary",
        },
        {
          name: "Allowance Management",
          value: "settings/salary-management/allowance",
        },
        {
          name: "Salary Deduction Management",
          value: "settings/salary-management/deduction",
        },
      ],
    },
    {
      name: "Performance Management",
      value: "settings/competencies",
      subItem: [
        {
          name: "Performance Competencies",
          value: "settings/competencies",
        },
      ],
    },
    { name: "Mobile & ESS", value: "settings/mobile-ess" },
  ],
  performance: [
    { name: "Self Assessment", value: "performance/self-assessment" },
    {
      name: "Supervisor Assessment",
      value: "performance/supervisor-assessment",
    },
  ],
};

export const getGenerateTitle = (title: string) => {
  if (!title) return "";

  const segments = title.split("/").filter(Boolean); // buang string kosong

  if (segments.length === 0) return "";

  const firstSegment = segments[0];

  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
};

export const getHideSidebar = (path: string) => {
  const hidePath = [
    "/auth",
    "/dashboard",
    "/settings/access-control/",
    "/settings/company/company-profile/edit",
    "/employee/organization/structure/edit",
    "/attendance/attendance-tracker/",
    "/attendance/leave-request/add",
    "/settings/time-attendance/attendance-configuration/edit",
    "/settings/time-attendance/overtime-configuration/edit",
    "/settings/form-template/add",
    "/settings/form-template/edit",
    "/settings/company/company-branch/",
    "/payroll/list/",
    "/settings/leave-management/",
    "/performance/self-assessment/add",
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

  return false;
};

export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const link = "/" + segments.slice(0, index + 1).join("/");

    return {
      label: segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      link,
    };
  });
};

export const getLastPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : "";
};

export const toTitleCase = (str: string) => {
  return str
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
