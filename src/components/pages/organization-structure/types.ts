// FileName: types.ts

import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { z } from "zod";

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeFormScheme>;

export const assignEmployeeFormScheme = z.object({
  employee_id: z.string().min(1, "Employee name is required"),
  department_id: z.string().min(1, "Department is required"),
  job_position_id: z.string().min(1, "Position is required"),
  job_level_id: z.string().min(1, "Job Level is required"),
  primary_direct_report: z
    .array(z.string())
    .min(1, "At least one primary direct report is required"),
  additional_direct_report: z.array(z.string()).optional(),
  team_id: z.array(z.string()).optional(),
  start_date: z.string().optional(),
});

export type NodeCardData = {
  employee: EmployeeNode;
  isEditMode: boolean;
  onAddChild?: (id: string, handle: "top" | "bottom") => void;
  onEdit?: (
    employee: EmployeeNode,
    employeeDetail: IEmployeeDetailsResponse | null
  ) => void;
  onDelete?: (id: string) => void; // Added for future delete functionality
};
export interface EmployeeNode {
  employeeId: string;
  id: number;
  name: string;
  email: string;
  phone_number: string;
  photo_profile: string;
  department_id: string;
  department: string;
  job_position_id: number;
  job_position: string;
  job_level_id: number;
  job_level: string;
  primary_direct_report: {
    id: number;
    name: string;
  }[];
  secondary_direct_report: {
    id: number;
    name: string;
  }[];
  team_members: {
    id: number;
    name: string;
    description: string;
    deleted_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  }[];
  relationship_type: string | null;
  image?: string;
  reportsTo?: {
    primary?: string[];
    additional?: string[];
  };
}

export const initialChartData: EmployeeNode[] = [];
