// FileName: sections/custom-node.tsx  (Corrected Version)

import React from "react";
// 1. Import Handle and Position
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeCard } from "./node-card";
import { EmployeeNode } from "../types";

type CustomNodeData = {
  employee: EmployeeNode;
  isTopLevel: boolean;
  isBottomLevel: boolean;
  onAddChild: (id: string, handle: "top" | "bottom") => void;
  onEdit: (employee: EmployeeNode) => void;
  onDelete: (id: string) => void;
  isEditMode: boolean;
};
// Use this new, more specific type in NodeProps.
export const CustomNode = ({ data }: { data: CustomNodeData }) => {
  console.log("DATA", data);
  return (
    // 2. Add the Handle components
    <>
      {/* This is the INCOMING connection point (from a manager) */}
      {!data.isTopLevel && <Handle type="target" position={Position.Top} />}

      {/* This is your existing NodeCard component */}
      <NodeCard
        data={{
          employee: data.employee,
          isTopLevel: data.isTopLevel,
          isBottomLevel: data.isBottomLevel,
          isEditMode: data.isEditMode,
          onAddChild: data.onAddChild,
          onDelete: data.onDelete,
          onEdit: data.onEdit,
        }}
      />

      {/* This is the OUTGOING connection point (to a report) */}
      {!data.isBottomLevel && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </>
  );
};
