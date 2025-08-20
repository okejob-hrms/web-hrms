// FileName: types.ts

import { z } from "zod";

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeFormScheme>;

export const assignEmployeeFormScheme = z.object({
  name: z.string().min(1, "Employee name is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  jobLevel: z.string().min(1, "Job Level is required"),
  // This was already correct in your code, it should be an array.
  primaryDirectReport: z
    .array(z.string())
    .min(1, "At least one primary direct report is required"),
  additionalDirectReport: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),
});

export type NodeCardData = {
  employee: EmployeeNode;
  isEditMode: boolean;
  isSafari: boolean;
  onAddChild: (id: string) => void;
  onEdit: (employee: EmployeeNode) => void;
  onDelete: (id: string) => void; // Added for future delete functionality
};

// CHANGE: `primary` is now an array of strings
export interface EmployeeNode {
  employeeId: string;
  reportsTo?: {
    primary?: string[];
    additional?: string[];
  };
  name: string;
  title: string;
  email?: string;
  phone?: string;
  image?: string;
}

export const dummyEmployeeData: EmployeeNode[] = [
  {
    employeeId: "1",
    name: "Alex Chen",
    title: "CEO",
    image: "/icons/user02.svg",
  },
  {
    employeeId: "2",
    name: "Ben Carter",
    title: "VP of Engineering",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["1"],
    },
  },
  {
    employeeId: "3",
    name: "Chloe Davis",
    title: "VP of Product",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["1"],
    },
  },
  {
    employeeId: "4",
    name: "David Evans",
    title: "Engineering Manager",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["2"],
    },
  },
  {
    employeeId: "5",
    name: "Eva Foster",
    title: "Product Manager",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["3"],
    },
  },
  {
    // --- EXAMPLE 1: MULTIPLE PRIMARY REPORTS ---
    // This employee reports to both the Engineering and Product managers.
    employeeId: "6",
    name: "Frank Green",
    title: "Senior UX Engineer",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["4", "5"],
    },
  },
  {
    // --- EXAMPLE 2: MULTIPLE ADDITIONAL REPORTS ---
    // This employee has one primary and two additional (dotted-line) managers.
    employeeId: "7",
    name: "Grace Hall",
    title: "Data Scientist",
    image: "/icons/user02.svg",
    reportsTo: {
      primary: ["4"],
      additional: ["3", "5"],
    },
  },
];
