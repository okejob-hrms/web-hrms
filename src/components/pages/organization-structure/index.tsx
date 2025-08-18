"use client";

import Image from "next/image";
import { AssignEmployeeFormValues, EmployeeNode } from "./types";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrgChart } from "d3-org-chart";
import { NodeCard } from "./sections/node-card";
import { createRoot } from "react-dom/client";
import AssignEmployeeModal from "./sections/assign-employee-modal";
import EmployeeProfileModal from "./sections/employee-profile-modal";

function flattenTree(nodes: EmployeeNode[], parentId?: string): EmployeeNode[] {
  return nodes.flatMap((node) => {
    const { children, ...rest } = node;
    const flatNode = { ...rest, parentId };
    return [flatNode, ...flattenTree(children || [], node.id)];
  });
}

export default function OrganizationChart() {
  const chartContainerId = "orgchart-container";
  const chartRef = useRef<OrgChart<EmployeeNode> | null>(null);
  const dataRef = useRef<{
    openAssignModal: (parentId?: string) => void;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoom = (direction: "in" | "out") => {
    if (chartRef.current) {
      if (direction === "in") {
        chartRef.current.zoomIn();
      } else {
        chartRef.current.zoomOut();
      }
      // Update the state with the new zoom level after the action
      const newScale = chartRef.current.getChartState().lastTransform.k;
      setZoomLevel(newScale);
    }
  };

  // Safari detection logic now lives in the parent component
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    const isSafariBrowser =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
      !/CriOS/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  const [nestedData, setNestedData] = useState<EmployeeNode[]>([]);
  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeNode | null>(
    null
  );

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const openAssignModal = (parentId?: string) => {
    setCurrentParentId(parentId ?? null);
    setAssignEmployeeOpen(true);
  };

  const handleOpenProfileModal = (employeeData: EmployeeNode) => {
    setSelectedEmployee(employeeData);
    setIsProfileModalOpen(true);
  };

  const handleEditSave = (data: AssignEmployeeFormValues) => {
    // Add your logic here to update the employee data in your main `nestedData` state
    console.log("Saving edited employee data:", data);
    setIsProfileModalOpen(false); // Close modal on save
  };

  dataRef.current = { openAssignModal };

  function addEmployeeToParent(
    nodes: EmployeeNode[],
    parentId: string,
    newEmployee: EmployeeNode[]
  ): EmployeeNode[] {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), ...newEmployee],
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: addEmployeeToParent(node.children, parentId, newEmployee),
        };
      }
      return node;
    });
  }

  const handleSave = (data: AssignEmployeeFormValues) => {
    const newEmployee: EmployeeNode = {
      id: Date.now().toString(),
      name: data.name,
      title: "New Hire",
      image: "/icons/user02.svg",
      children: [],
    };
    setNestedData((prev) =>
      currentParentId
        ? addEmployeeToParent(prev, currentParentId, [newEmployee])
        : [...prev, newEmployee]
    );
    setAssignEmployeeOpen(false);
    setCurrentParentId(null);
  };

  useLayoutEffect(() => {
    if (nestedData.length === 0) {
      const container = document.getElementById(chartContainerId);
      if (container) container.innerHTML = "";
      chartRef.current = null;
      return;
    }

    if (!chartRef.current) {
      const chart = new OrgChart<EmployeeNode>()
        .container(`#${chartContainerId}`)
        // Set fixed node dimensions for layout calculation
        .nodeWidth(() => 220)
        .nodeHeight(() => (isSafari ? 140 : 140)) // Increased to account for plus button
        .nodeContent(({ data }) => `<div id="node-${data.id}"></div>`)
        .linkUpdate(function (this: SVGPathElement) {
          this.setAttribute("stroke", "#0F3C56");
          this.setAttribute("stroke-width", "1");
        })
        .nodeUpdate(function (this: SVGGElement, node) {
          const el = this.querySelector(
            `#node-${node.data.id}`
          ) as HTMLElement | null;
          if (el && dataRef.current) {
            const { openAssignModal } = dataRef.current;
            createRoot(el).render(
              <NodeCard
                data={node.data}
                onAddChild={openAssignModal}
                isSafari={isSafari} // Pass the isSafari state as a prop
                onEdit={() => handleOpenProfileModal(node.data)}
              />
            );
          }
        });
      chartRef.current = chart;
    }

    chartRef.current.data(flattenTree(nestedData)).render();
  }, [nestedData, isSafari]);

  return (
    <div className="font-sans min-h-screen">
      {/* Your header code here */}
      <div className="flex justify-between w-full items-center mb-3">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">Organization Structure</h2>
          </div>
          <div className="flex flex-row gap-2">
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
            <Button className="whitespace-nowrap">
              <Image
                src="/icons/edit.svg"
                width={18}
                height={18}
                alt="edit icon"
              />{" "}
              Edit Structure
            </Button>
          </div>
        </div>
      </div>

      {nestedData.length === 0 ? (
        <div
          className="rounded-md bg-grayscale-10 border shadow-sm border-grayscale-20 p-12 flex flex-col items-center justify-center gap-2 cursor-pointer"
          style={{ width: "100%", height: "80vh" }}
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
            <span className="text-primary cursor-pointer underline">Click</span>{" "}
            to start building your company’s organization structure.
          </p>
        </div>
      ) : (
        <div className="relative rounded-md bg-grayscale-10 border-grayscale-20">
          {/* 2. The zoom controls are now inside the wrapper, positioned absolutely */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pl-2 pr-2 pt-1 pb-1 bg-white rounded-lg border">
            <span className="text-sm font-medium">Zoom</span>
            <span className="text-sm text-gray-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom("out")}
              className=""
              aria-label="Zoom out"
            >
              <Image
                src="/icons/zoomOut.svg"
                width={16}
                height={16}
                alt="zoomOut"
              />
            </button>
            <button
              onClick={() => handleZoom("in")}
              className="border-l-1 pl-1.5"
              aria-label="Zoom in"
            >
              <Image
                src="/icons/zoomIn.svg"
                width={16}
                height={16}
                alt="zoomIn"
              />
            </button>
          </div>

          {/* 3. The chart container itself now sits inside the relative wrapper */}
          <div
            id={chartContainerId}
            style={{ width: "100%", height: "80vh" }}
          />
        </div>
      )}

      <AssignEmployeeModal
        open={assignEmployeeOpen}
        handleClose={() => setAssignEmployeeOpen(false)}
        handleSave={handleSave}
        onOpenChange={setAssignEmployeeOpen}
      />

      {selectedEmployee && (
        <EmployeeProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          handleClose={() => setIsProfileModalOpen(false)}
          employeeData={selectedEmployee}
          handleSave={handleEditSave}
        />
      )}
    </div>
  );
}
