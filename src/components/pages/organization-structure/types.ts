import { TreeNodeDatum } from "react-d3-tree";
import z from "zod";

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeFormScheme>;

export const assignEmployeeFormScheme = z.object({
  name: z.string().min(1, "Employee name is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  jobLevel: z.string().min(1, "Job Level is required"),
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
