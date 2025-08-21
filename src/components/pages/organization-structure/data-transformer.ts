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

  // 3. Create the lookup map from the nested employee objects
  const employeeMap = new Map(
    dataForNodes.map((d) => [d.employee.employeeId, d.employee])
  );

  // 4. Calculate job levels from the nested employee objects
  const topLevel = 1;
  const bottomLevel = 4;

  console.log("top level", topLevel);
  console.log("bot level", bottomLevel);

  dataForNodes.forEach((nodeData) => {
    // 5. Destructure the employee object from the wrapper
    const { employee } = nodeData;
    console.log("test", employee.jobLevel === topLevel);

    // --- Node Creation ---
    nodes.push({
      id: employee.employeeId,
      position: { x: 0, y: 0 },
      // 6. Pass the enriched data through, now including level info
      data: {
        ...nodeData,
        isTopLevel: employee.jobLevel === topLevel,
        isBottomLevel: employee.jobLevel === bottomLevel,
      },
      type: "custom",
    });

    // --- Intelligent Edge Creation (this logic was already mostly correct) ---
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

      const senior = employee.jobLevel < manager.jobLevel ? employee : manager;
      const junior = employee.jobLevel < manager.jobLevel ? manager : employee;

      const edgeKey = [senior.employeeId, junior.employeeId].sort().join("-");
      if (createdEdges.has(edgeKey)) return;

      createdEdges.add(edgeKey);
      edges.push({
        id: `e-${edgeKey}`,
        source: senior.employeeId,
        target: junior.employeeId,
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
