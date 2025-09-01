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
    { name: "Offboarding", value: "employee/off-boarding" },
  ],

  settings: [
    { name: "Access Control", value: "settings/access-control" },
    { name: "Company Profile", value: "settings/company-profile" },
    { name: "Time & Attendence", value: "settings/time-attendence" },
    { name: "Leave Management", value: "settings/leave" },
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
    "/employee/organization/structure/edit",
  ];

  return hidePath.some((p) => path.startsWith(p));
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
