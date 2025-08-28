// FileName: src/utils/data-transformer.ts

import { type Edge, type Node } from "@xyflow/react";
// 1. Import the shared NodeCardData type for the function's input
import { type NodeCardData } from "./types";

const edgeStyles = {
  primary: { stroke: "#0F3C56", strokeWidth: 1.5 },
  additional: { stroke: "#0F3C56", strokeWidth: 1, strokeDasharray: "5 5" },
};

// 2. The function now correctly accepts an array of NodeCardData
export function transformDataForFlow(dataForNodes: NodeCardData[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const createdEdges = new Set<string>();

  const employeeMap = new Map(
    dataForNodes.map((d) => [d.employee.employeeId, d.employee])
  );

  dataForNodes.forEach((nodeData) => {
    const { employee } = nodeData;

    // --- Node Creation ---
    nodes.push({
      id: employee.employeeId,
      position: { x: 0, y: 0 },
      data: {
        ...nodeData,
      },
      type: "custom",
    });

    const allReports = [
      ...(employee.reportsTo?.primary?.map((id) => ({ id, type: "primary" })) ||
        []),
      ...(employee.reportsTo?.additional?.map((id) => ({
        id,
        type: "additional",
      })) || []),
    ];

    allReports.forEach((report) => {
      const manager = employeeMap.get(report.id);
      if (!manager) return;

      const edgeKey = [employee.employeeId, manager.employeeId]
        .sort()
        .join("-");
      if (createdEdges.has(edgeKey)) return;

      createdEdges.add(edgeKey);
      edges.push({
        id: `e-${edgeKey}`,
        source: employee.employeeId,
        target: manager.employeeId,
        type: "smoothstep",
        animated: report.type === "additional",
        style:
          report.type === "primary"
            ? edgeStyles.primary
            : edgeStyles.additional,
      });
    });
  });

  return { nodes, edges };
}
