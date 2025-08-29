// FileName: types.ts

import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { z } from "zod";

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeFormScheme>;

export const assignEmployeeFormScheme = z.object({
  name: z.string().min(1, "Employee name is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  jobLevel: z.string().min(1, "Job Level is required"),
  primaryDirectReport: z
    .array(z.string())
    .min(1, "At least one primary direct report is required"),
  additionalDirectReport: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),
});

export type NodeCardData = {
  employee: EmployeeNode;
  onAddChild?: (id: string, handle: "top" | "bottom") => void;
  onEdit?: (
    employee: EmployeeNode,
    employeeDetail: IEmployeeDetailsResponse | null
  ) => void;
  onDelete?: (id: string) => void; // Added for future delete functionality
};
export interface EmployeeNode {
  employeeId: string;
  name: string;
  title: string;
  image?: string;
  reportsTo?: {
    primary?: string[];
    additional?: string[];
  };
}

export const initialChartData: EmployeeNode[] = [];
