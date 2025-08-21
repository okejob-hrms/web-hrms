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
  onAddChild: (id: string, handle: "top" | "bottom") => void;
  onEdit: (employee: EmployeeNode) => void;
  onDelete: (id: string) => void; // Added for future delete functionality
};

// CHANGE: `primary` is now an array of strings
export interface EmployeeNode {
  employeeId: string;
  name: string;
  title: string;
  jobLevel: number; // Use a number for easy comparison
  image?: string;
  // This will be populated when an employee is assigned via the modal
  reportsTo?: {
    primary?: string[];
    additional?: string[];
  };
}

// This represents every employee in your company database
export const allEmployees: EmployeeNode[] = [
  {
    employeeId: "1",
    name: "Olivia Rhye",
    title: "CEO",
    jobLevel: 1,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "2",
    name: "Phoenix Baker",
    title: "CTO",
    jobLevel: 2,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "3",
    name: "Lana Steiner",
    title: "COO",
    jobLevel: 2,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "4",
    name: "Candice Wu",
    title: "Head of Engineering",
    jobLevel: 3,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "5",
    name: "Demi Wilkinson",
    title: "Head of Product Design",
    jobLevel: 3,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "6",
    name: "Drew Cano",
    title: "Head of Production",
    jobLevel: 3,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "7",
    name: "Andi Lane",
    title: "Warehouse Manager",
    jobLevel: 4,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "8",
    name: "Natali Craig",
    title: "Product Manager",
    jobLevel: 4,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "9",
    name: "Orlando Diggs",
    title: "Frontend Engineer",
    jobLevel: 5,
    image: "/icons/user02.svg",
  },
  {
    employeeId: "10",
    name: "Kate Morrison",
    title: "Backend Engineer",
    jobLevel: 5,
    image: "/icons/user02.svg",
  },
];

export const initialChartData: EmployeeNode[] = [];
