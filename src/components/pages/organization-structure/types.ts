import { TreeNodeDatum } from "react-d3-tree";
import z from "zod";

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeFormScheme>;

export const assignEmployeeFormScheme = z.object({
  // This field seems to be for searching/selecting an employee, not a text input.
  // If you are setting an employee object, the type might be different (e.g., z.object({...})).
  // For now, assuming it's a string ID or name.
  name: z.string().min(1, "Employee name is required"),

  // --- Existing Fields ---
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  jobLevel: z.string().min(1, "Job Level is required"),

  // --- ADDED FIELDS ---
  // For multi-select, the value is an array of strings.
  // .min(1) ensures the user must select at least one person.
  primaryDirectReport: z
    .array(z.string())
    .min(1, "Primary direct report is required"),

  // This is optional, so we use .optional()
  additionalDirectReport: z.array(z.string()).optional(),

  // Teams can also be optional
  teams: z.array(z.string()).optional(),
});

export interface EmployeeNode {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  image?: string;
  children?: EmployeeNode[];
}

export interface Props<TDatum extends EmployeeNode> {
  data: TDatum[];
}

export type EmployeeTreeNodeDatum = TreeNodeDatum & EmployeeNode;
