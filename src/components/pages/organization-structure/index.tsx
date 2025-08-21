// FileName: index.tsx
"use client";

import Image from "next/image";
import {
  AssignEmployeeFormValues,
  allEmployees,
  EmployeeNode,
  initialChartData,
  NodeCardData,
} from "./types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AssignEmployeeModal from "./sections/assign-employee-modal";
import EmployeeProfileModal from "./sections/employee-profile-modal";

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
  const [chartEmployees, setChartEmployees] =
    useState<EmployeeNode[]>(initialChartData);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeCardData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeNode | null>(
    null
  );
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<EmployeeNode[] | null>(null);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    const isSafariBrowser =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      !/CriOS/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  const unassignedEmployees = useMemo(() => {
    const assignedIds = new Set(chartEmployees.map((e) => e.employeeId));
    return allEmployees.filter((e) => !assignedIds.has(e.employeeId));
  }, [chartEmployees]);

  useEffect(() => {
    const onAddChild = (employeeId: string, handle: "top" | "bottom") => {
      console.log(`Add child for ${employeeId} via ${handle} handle`);
      setCurrentParentId(employeeId);
      setAssignEmployeeOpen(true);
    };
    const onEdit = (employee: EmployeeNode) => {
      setSelectedEmployee(employee);
      setIsProfileModalOpen(true);
    };
    const onDelete = (employeeId: string) => {
      console.log("Delete employee:", employeeId);
      alert(`Delete employee: ${employeeId}`);
    };

    if (chartEmployees.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // This part correctly enriches the data with handler functions.
    const dataForNodes: NodeCardData[] = chartEmployees.map((emp) => ({
      employee: emp,
      onAddChild,
      onEdit,
      onDelete,
      isEditMode,
      isSafari,
    }));

    const { nodes: transformedNodes, edges: transformedEdges } =
      transformDataForFlow(dataForNodes);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      transformedNodes,
      transformedEdges
    );

    // Fix: Ensure layoutedNodes is typed as Node<NodeCardData>[]
    setNodes(layoutedNodes as Node<NodeCardData>[]);
    setEdges(layoutedEdges);
  }, [chartEmployees, isEditMode, isSafari]);

  const handleModalSave = (
    employeeToAdd: EmployeeNode,
    formValues: AssignEmployeeFormValues
  ) => {
    const newEmployeeWithReports: EmployeeNode = {
      ...employeeToAdd,
      reportsTo: {
        primary: formValues.primaryDirectReport,
        additional: formValues.additionalDirectReport,
      },
    };
    setChartEmployees((prev) => [...prev, newEmployeeWithReports]);
    setAssignEmployeeOpen(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    setIsEditMode(false);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
  };

  const openAssignModal = (parentId?: string) => {
    setCurrentParentId(parentId ?? null);
    setAssignEmployeeOpen(true);
  };

  // const handleSave = (formValues: AssignEmployeeFormValues) => {
  //   // FIX: Use `employeeId` instead of `id` to match your EmployeeNode type
  //   const newEmployee: EmployeeNode = {
  //     employeeId: Date.now().toString(),
  //     name: formValues.name,
  //     title: "New Hire",
  //     image: "/icons/user02.svg",
  //     reportsTo: currentParentId ? { primary: [currentParentId] } : {},
  //   };
  //   setEmployeeData((prevData) => [...prevData, newEmployee]);
  //   setAssignEmployeeOpen(false);
  //   setCurrentParentId(null);
  // };

  // const handleEditSave = (formValues: AssignEmployeeFormValues) => {
  //   console.log("Saving edited employee data:", formValues);
  //   setEmployeeData((prevData) =>
  //     prevData.map((emp) => {
  //       // FIX: Use `employeeId` for comparison
  //       if (emp.employeeId === selectedEmployee?.employeeId) {
  //         return {
  //           ...emp,
  //           name: formValues.name,
  //           reportsTo: {
  //             primary: formValues.primaryDirectReport,
  //             additional: formValues.additionalDirectReport,
  //           },
  //         };
  //       }
  //       return emp;
  //     })
  //   );
  //   setIsProfileModalOpen(false);
  // };

  const handleModalEditSave = (formValues: AssignEmployeeFormValues) => {};
  return (
    <div className="font-sans min-h-screen">
      <div className="flex justify-between w-full items-center mb-3">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">Organization Structure</h2>
          </div>
          <div className="flex flex-row gap-2">
            {isEditMode ? (
              // --- EDIT MODE BUTTONS ---
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelClick}
                  className="whitespace-nowrap"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveClick} className="whitespace-nowrap">
                  Save Changes
                </Button>
              </>
            ) : (
              // --- VIEW MODE BUTTONS ---
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
            )}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: "80vh" }}>
        {chartEmployees.length === 0 ? (
          <div
            className="rounded-md bg-grayscale-10 border shadow-sm border-grayscale-20 p-12 flex flex-col items-center justify-center gap-2 cursor-pointer h-full"
            onClick={() => openAssignModal()}
          >
            <Image
              src="/icons/user-grey.svg"
              alt="no employees"
              width={40}
              height={40}
              className="opacity-60"
            />
            <p className="font-medium text-gray-700">No Employees Assigned</p>
            <p className="text-gray-500 text-sm text-center">
              <span className="text-primary cursor-pointer underline">
                Click
              </span>{" "}
              to start building your company’s organization structure.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      <AssignEmployeeModal
        open={assignEmployeeOpen}
        // handleClose={() => setAssignEmployeeOpen(false)}
        handleSave={handleModalSave}
        onOpenChange={setAssignEmployeeOpen}
        unassignedEmployees={unassignedEmployees} // FIX: Pass the correct props
        chartEmployees={chartEmployees}
      />

      {selectedEmployee && (
        <EmployeeProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          handleClose={() => setIsProfileModalOpen(false)}
          employeeData={selectedEmployee}
          handleSave={handleModalEditSave}
        />
      )}
    </div>
  );
}
