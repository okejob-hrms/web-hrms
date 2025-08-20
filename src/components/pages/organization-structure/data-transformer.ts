/* eslint-disable @typescript-eslint/no-explicit-any */
// FileName: src/utils/data-transformer.ts

import { type Edge, type Node } from "@xyflow/react";

const edgeStyles = {
  primary: { stroke: "#0F3C56", strokeWidth: 1.5 },
  additional: { stroke: "#ff0000", strokeWidth: 1, strokeDasharray: "5 5" },
};

// This function is now much simpler. It doesn't need complex generics.
export function transformDataForFlow(dataForNodes: any[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  dataForNodes.forEach((nodeData) => {
    // The actual employee data is now nested inside the 'employee' property
    const employee = nodeData.employee;

    nodes.push({
      id: employee.employeeId,
      position: { x: 0, y: 0 },
      // Pass the whole data object through to the CustomNode adapter
      data: nodeData,
      type: "custom",
    });

    if (employee.reportsTo) {
      if (employee.reportsTo.primary) {
        employee.reportsTo.primary.forEach((managerId: string) => {
          edges.push({
            id: `e-${managerId}-${employee.employeeId}`,
            source: managerId,
            target: employee.employeeId,
            type: "smoothstep",
            style: edgeStyles.primary,
          });
        });
      }

      if (employee.reportsTo.additional) {
        employee.reportsTo.additional.forEach((managerId: string) => {
          edges.push({
            id: `e-${managerId}-${employee.employeeId}-additional`,
            source: managerId,
            target: employee.employeeId,
            type: "smoothstep",
            animated: true,
            style: edgeStyles.additional,
          });
        });
      }
    }
  });

  return { nodes, edges };
}
