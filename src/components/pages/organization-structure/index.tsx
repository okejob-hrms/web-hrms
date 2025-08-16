/* eslint-disable @typescript-eslint/no-this-alias */

"use client";

import Image from "next/image";
import { AssignEmployeeFormValues, EmployeeNode } from "./types";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrgChart } from "d3-org-chart";
import { NodeCard } from "./sections/node-card";
import { createRoot } from "react-dom/client";
import AssignEmployeeModal from "./sections/assign-employee-modal";

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

  // This ref will hold the latest data and functions for our D3 callbacks
  const dataRef = useRef<{
    openAssignModal: (parentId?: string) => void;
  } | null>(null);

  const [nestedData, setNestedData] = useState<EmployeeNode[]>([]);
  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const openAssignModal = (parentId?: string) => {
    setCurrentParentId(parentId ?? null);
    setAssignEmployeeOpen(true);
  };

  // On every render, update the ref with the latest callback
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

    setNestedData((prev) => {
      if (currentParentId) {
        return addEmployeeToParent(prev, currentParentId, [newEmployee]);
      }
      return [...prev, newEmployee];
    });

    setAssignEmployeeOpen(false);
    setCurrentParentId(null);
  };

  useLayoutEffect(() => {
    if (nestedData.length === 0) {
      const container = document.getElementById(chartContainerId);
      if (container) {
        container.innerHTML = "";
      }
      chartRef.current = null;
      return;
    }

    if (!chartRef.current) {
      const chart = new OrgChart<EmployeeNode>()
        .container(`#${chartContainerId}`)
        .nodeWidth(() => 220)
        .nodeHeight(() => 100)
        .nodeContent(({ data }) => `<div id="node-${data.id}"></div>`)
        .linkUpdate(function (this: SVGPathElement) {
          const el = this;
          el.setAttribute("stroke", "#0F3C56");
          el.setAttribute("stroke-width", "1");
          if (el.parentNode) el.parentNode.appendChild(el);
        })
        // Use nodeUpdate to mount the React component
        .nodeUpdate(function (this: SVGGElement, node) {
          const el = this.querySelector(
            `#node-${node.data.id}`
          ) as HTMLElement | null;
          if (el && dataRef.current) {
            // Get the latest callback from the ref to avoid stale closures
            const { openAssignModal } = dataRef.current;
            createRoot(el).render(
              <NodeCard
                data={node.data}
                width={220}
                height={100}
                onAddChild={openAssignModal}
              />
            );
          }
        });
      chartRef.current = chart;
    }

    chartRef.current.data(flattenTree(nestedData)).render();
  }, [nestedData]);

  return (
    <div className="font-sans min-h-screen">
      {/* ...header code... */}
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
              />
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
            to start building your company’s organization structure by assigning
            employees.
          </p>
        </div>
      ) : (
        <div
          id={chartContainerId}
          className="rounded-md bg-grayscale-10 border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4"
          style={{ width: "100%", height: "80vh" }}
        />
      )}

      <AssignEmployeeModal
        open={assignEmployeeOpen}
        handleClose={() => setAssignEmployeeOpen(false)}
        handleSave={handleSave}
        onOpenChange={setAssignEmployeeOpen}
      />
    </div>
  );
}
