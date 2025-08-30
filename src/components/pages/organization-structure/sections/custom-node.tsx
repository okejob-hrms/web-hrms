// FileName: sections/custom-node.tsx  (Corrected Version)

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeCard } from "./node-card";
import { EmployeeNode } from "../types";

type CustomNodeData = {
  employee: EmployeeNode;
  onAddChild: (id: string, handle: "top" | "bottom") => void;
  onEdit: (employee: EmployeeNode) => void;
  onDelete: (id: string) => void;
  isEditMode: boolean;
};
export const CustomNode = ({ data }: { data: CustomNodeData }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />

      <NodeCard
        data={{
          employee: data.employee,
          isEditMode: data.isEditMode,
          onAddChild: data.onAddChild,
          onDelete: data.onDelete,
          onEdit: data.onEdit,
        }}
      />

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
