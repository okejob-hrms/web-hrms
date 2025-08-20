// FileName: sections/custom-node.tsx  (Corrected Version)

import React from "react";
// 1. Import Handle and Position
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeCard } from "./node-card";
import { EmployeeNode } from "../types";

type NodeCardData = {
  employee: EmployeeNode;
  isEditMode: boolean;
  isSafari: boolean;
  onAddChild: (id: string) => void;
  onEdit: () => void;
};
// Use this new, more specific type in NodeProps.
export const CustomNode = ({ data }: { data: NodeCardData }) => {
  return (
    // 2. Add the Handle components
    <>
      {/* This is the INCOMING connection point (from a manager) */}
      <Handle type="target" position={Position.Top} />

      {/* This is your existing NodeCard component */}
      <NodeCard
        data={{
          employee: data.employee,
          isEditMode: data.isEditMode,
          isSafari: data.isSafari,
          onAddChild: data.onAddChild,
          onEdit: data.onEdit,
        }}
      />

      {/* This is the OUTGOING connection point (to a report) */}
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
