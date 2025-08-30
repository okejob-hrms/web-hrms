// FileName: index.tsx
"use client";

import Image from "next/image";
import { EmployeeNode, initialChartData, NodeCardData } from "./types";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  type Node,
  type Edge,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";

import { transformDataForFlow } from "./data-transformer";
import { CustomNode } from "./sections/custom-node";
import { CustomControls } from "./sections/custom-controls";
import { flattenOrgData } from "./utis";

import { getOrgChart } from "@/services/employees/organization-structure";
import { useRouter } from "next/navigation";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 220;
const nodeHeight = 140;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

const nodeTypes = {
  custom: CustomNode,
};

export default function OrganizationChart() {
  const router = useRouter();
  const [chartEmployees, setChartEmployees] =
    useState<EmployeeNode[]>(initialChartData);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeCardData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const fetchAndSetInitialChart = async () => {
      try {
        const response = await getOrgChart();
        const flattenedData = flattenOrgData(response.data);
        setChartEmployees(flattenedData);
      } catch (error) {
        console.error("Failed to fetch organization chart:", error);
      }
    };
    fetchAndSetInitialChart();
  }, []);

  useEffect(() => {
    if (chartEmployees.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const dataForNodes: NodeCardData[] = chartEmployees.map((emp) => ({
      employee: emp,
      isEditMode: false,
    }));

    const { nodes: transformedNodes, edges: transformedEdges } =
      transformDataForFlow(dataForNodes);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      transformedNodes,
      transformedEdges
    );

    setNodes(layoutedNodes as Node<NodeCardData>[]);
    setEdges(layoutedEdges);
  }, [chartEmployees]);

  const handleEditClick = () => {
    router.push("structure/edit");
  };
  return (
    <div className="font-sans min-h-screen">
      <div className="flex justify-between w-full items-center mb-3">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">Organization Structure</h2>
          </div>
          <div className="flex flex-row gap-2">
            <>
              <div className="flex flex-row text-[10px] align-middle gap-[5px] items-center">
                <Image
                  src="/icons/update.svg"
                  width={10}
                  height={10}
                  alt="update icon"
                />
                <span>Last Update</span>
                <span className="text-primary">Jul 20, 2025</span>
                <span className="text-primary">16:00</span>
              </div>
              <Button className="bg-white border border-primary text-primary whitespace-nowrap hover:bg-white/90">
                <Image
                  src="/icons/download.svg"
                  width={18}
                  height={18}
                  alt="download icon"
                />{" "}
                Download
              </Button>
              <Button onClick={handleEditClick} className="whitespace-nowrap">
                <Image
                  src="/icons/edit.svg"
                  width={18}
                  height={18}
                  alt="edit icon"
                />{" "}
                Edit Structure
              </Button>
            </>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: "80vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          style={{
            backgroundColor: "#EDEDED",
          }}
          className="bg-grayscale-10"
        >
          <Background />
          <CustomControls />
        </ReactFlow>
      </div>
    </div>
  );
}
