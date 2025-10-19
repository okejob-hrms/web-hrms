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
    { name: "Leave Management", value: "settings/leave" },
    { name: "Form Template", value: "settings/form-template" },
    { name: "Payroll Management", value: "settings/payroll" },
    { name: "Performance Management", value: "settings/performance" },
    { name: "Mobile & ESS", value: "settings/mobile-ess" },
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
    "/settings/access-control/add",
    "/settings/access-control/",
    "/settings/company/company-profile/edit",
    "/employee/organization/structure/edit",
    "/attendance/attendance-tracker/",
    "/settings/time-attendance/attendance-configuration/edit",
    "/settings/time-attendance/overtime-configuration/edit",
    "/settings/form-template/add",
    "/settings/form-template/edit",
    "/settings/company/company-branch/add",
    "/settings/company/company-branch/edit",
  ];

  const employeeDetailPattern = /^\/employee\/employee-management\/\d+$/;
  const offboardingDetailPattern = /^\/employee\/off-boarding\/\d+$/;
  const salaryAdjustmentPattern =
    /^\/employee\/off-boarding\/\d+\/salary-adjustment$/;

  if (employeeDetailPattern.test(path)) {
    return true;
  }

  if (offboardingDetailPattern.test(path)) {
    return true;
  }

  if (salaryAdjustmentPattern.test(path)) {
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
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
