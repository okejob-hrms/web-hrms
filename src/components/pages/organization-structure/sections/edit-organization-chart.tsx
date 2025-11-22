/* eslint-disable react-hooks/exhaustive-deps */
// FileName: index.tsx
"use client";

import Image from "next/image";
import {
  AssignEmployeeFormValues,
  EditEmployeeFormValues,
  EmployeeNode,
  initialChartData,
  NodeCardData,
} from "../types";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AssignEmployeeModal from "./assign-employee-modal";
import EmployeeProfileModal from "./employee-profile-modal";

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";

import { transformDataForFlow } from "../data-transformer";
import { CustomNode } from "./custom-node";
import { CustomControls } from "./custom-controls";
import { flattenOrgData } from "../utils";

import {
  getOrgChart,
  postAssignEmployee,
  postEditEmployee,
} from "@/services/employees/organization-structure";
import { useRouter } from "next/navigation";
import { EmployeeListSidebar } from "./employee-list-sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const nodeWidth = 220;
const nodeHeight = 140;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
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

export default function OrganizationChartEdit() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [chartEmployees, setChartEmployees] =
    useState<EmployeeNode[]>(initialChartData);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeCardData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );

  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] =
    useState<EmployeeNode | null>(null);
    const [selectedParentEmployee, setselectedParentEmployee] =
    useState<EmployeeNode | null>(null);
  const {
    data: fetchedEmployees,
    isLoading,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ["organizationChart", selectedEmployeeId],
    queryFn: () => getOrgChart(selectedEmployeeId ? `${selectedEmployeeId}` : ''),
    select: (apiResponse) => flattenOrgData(apiResponse.data),
  });

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    queryClient.invalidateQueries({
      queryKey: ["organizationChart", employeeId]
    });
  };

  useEffect(() => {
    if (fetchedEmployees) {
      setChartEmployees(fetchedEmployees);
    }
  }, [fetchedEmployees]);

  console.log("Chart employee", chartEmployees)
  useEffect(() => {
    const onAddChild = (employee: EmployeeNode) => {
      setselectedParentEmployee(employee);
      setAssignEmployeeOpen(true);
    };
    const onEdit = async (employee: EmployeeNode) => {
      setIsProfileModalOpen(true);
      setSelectedEmployeeDetails(employee);
    };
    const onDelete = (employee: EmployeeNode) => {
      assignManager({
        employee_id: employee.employeeId,
        department_id: employee.department_id,
        job_level_id: String(employee.job_level_id),
        job_position_id: String(employee.job_position_id),
        primary_direct_report: "",
        additional_direct_report: "",
        team_id: employee.team_members.map((team) => String(team.id)),
      });
    };

    if (chartEmployees.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const dataForNodes: NodeCardData[] = chartEmployees.map((emp) => ({
      employee: emp,
      onAddChild,
      onEdit,
      onDelete,
      isEditMode: true,
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

  const handleModalSave = (formValues: AssignEmployeeFormValues) => {
    assignManager(formValues);
  };

  const handleCancelClick = () => {
    router.back();
  };

  const openAssignModal = () => {
    setAssignEmployeeOpen(true);
  };

  const handleModalEditSave = (formValues: EditEmployeeFormValues) => {
    editManager(formValues);
  };

  const { mutate: assignManager } = useMutation({
    mutationFn: postAssignEmployee,
    onSuccess: () => {
      toast.success("Assign Manager Successfully Updated!");
      queryClient.invalidateQueries({ queryKey: ["organizationChart"] });
    },
    onError: (error) => {
      toast.error(`Failed to create/edit employee: ${error.message}`);
    },
  });

  const { mutate: editManager } = useMutation({
    mutationFn: postEditEmployee,
    onSuccess: () => {
      toast.success("Assign Manager Successfully Updated!");
      queryClient.invalidateQueries({ queryKey: ["organizationChart"] });
    },
    onError: (error) => {
      toast.error(`Failed to create/edit employee: ${error.message}`);
    },
  });

  useEffect(() => {
    if (isError) {
      setChartEmployees(initialChartData);
      toast.error("Error Fetching Organization Structure");
    }
  }, [isError]);

  return (
  <ReactFlowProvider>
    <div className="font-sans flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancelClick}>
            <Image
              src="/icons/chevronLeft.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </Button>
          <h2 className="font-semibold text-xl">Organization Structure</h2>
        </div>
      </div>
      <div className="flex flex-row" style={{ height: "100vh" }}>
        <EmployeeListSidebar
          onEmployeeSelect={handleEmployeeSelect}
          selectedEmployeeId={selectedEmployeeId}
        />
        <div className="flex-1 h-full">
          {isLoading || isRefetching ? (
            <div className="flex flex-col gap-4 items-center w-full h-full">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2 w-full h-full">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          ) : chartEmployees.length === 0 ? (
            <div
              className="bg-grayscale-10 border shadow-sm border-grayscale-20 p-12 flex flex-col items-center justify-center gap-2 cursor-pointer h-full"
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
      </div>

      <AssignEmployeeModal
        open={assignEmployeeOpen}
        handleSave={handleModalSave}
        onOpenChange={setAssignEmployeeOpen}
        chartEmployees={chartEmployees}
        parentEmployee={selectedParentEmployee}
      />

      {selectedEmployeeDetails && (
        <EmployeeProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          handleClose={() => setIsProfileModalOpen(false)}
          employeeData={selectedEmployeeDetails}
          handleSave={handleModalEditSave}
          chartEmployees={chartEmployees}
        />
      )}
    </div>
  </ReactFlowProvider>
  );
}
