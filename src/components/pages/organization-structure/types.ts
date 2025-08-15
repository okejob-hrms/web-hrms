import { TreeNodeDatum } from "react-d3-tree";

export interface EmployeeNode {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  image?: string;
  children?: EmployeeNode[];
}

export type EmployeeTreeNodeDatum = TreeNodeDatum & EmployeeNode;