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
        { name: "Job Levels", value: "employee/organization/job-levels" },
        {
          name: "Department",
          value: "employee/organization/department-management",
        },
      ],
    },
    { name: "Offboarding", value: "employee/off-boarding" },
  ],

  finance: [
    { name: "Dashboard", value: "finance/dashboard" },
    { name: "Transactions", value: "finance/transactions" },
    { name: "Reports", value: "finance/reports" },
  ],

  // Module lain tinggal tambah di sini...
};
