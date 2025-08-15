/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { EmployeeNode } from "./types";
import { useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrgChart } from "d3-org-chart";
import { NodeCard } from "./sections/node-card";
import { createRoot } from "react-dom/client";

// Flatten tree
function flattenTree(nodes: EmployeeNode[], parentId?: string): EmployeeNode[] {
  return nodes.flatMap((node) => {
    const { children, ...rest } = node;
    const flatNode = { ...rest, parentId };
    return [flatNode, ...flattenTree(children || [], node.id)];
  });
}

const nestedData: EmployeeNode[] = [
  {
    id: "1",
    name: "Olivia Rhye",
    title: "CEO",
    image: "/icons/user02.svg",
    children: [
      {
        id: "2",
        name: "Phoenix Baker",
        title: "CTO",
        image: "/icons/user02.svg",
        children: [
          {
            id: "3",
            name: "Candice Wu",
            title: "Head of Engineer",
            image: "/icons/user02.svg",
            children: [],
          },
          {
            id: "4",
            name: "Demi Wilkinson",
            title: "Head of Product Designer",
            image: "/icons/user02.svg",
            children: [],
          },
        ],
      },
      {
        id: "5",
        name: "Lana Steiner",
        title: "COO",
        image: "/icons/user02.svg",
        children: [
          {
            id: "6",
            name: "Drew Cano",
            title: "Head of Production",
            image: "/icons/user02.svg",
            children: [
              {
                id: "7",
                name: "Andi Lane",
                title: "Warehouse Manager",
                image: "/icons/user02.svg",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function OrganizationChart() {
  const chartContainerId = "orgchart-container";

  useLayoutEffect(() => {
    const flatData = flattenTree(nestedData);

    const chart = new OrgChart<EmployeeNode>()
      .container(`#${chartContainerId}`)
      .data(flatData as any)
      .nodeWidth(() => 220)
      .nodeHeight(() => 100)
      .nodeContent(({ data }) => `<div id="node-${data.id}"></div>`)
      .linkUpdate(function (this: SVGPathElement) {
        const el = this;
        el.setAttribute("stroke", "#0F3C56");
        el.setAttribute("stroke-width", "1");
        if (el.parentNode) el.parentNode.appendChild(el);
      })
      .render();

    // Render React NodeCard for each node
    flatData.forEach((node) => {
      const el = document.getElementById(`node-${node.id}`);
      if (el)
        createRoot(el).render(
          <NodeCard data={node} width={220} height={100} />
        );
    });

    // Re-render NodeCards after expand/collapse
    chart.onExpandOrCollapse(() => {
      flatData.forEach((node) => {
        const el = document.getElementById(`node-${node.id}`);
        if (el && !el.hasChildNodes()) {
          createRoot(el).render(
            <NodeCard data={node} width={220} height={100} />
          );
        }
      });
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Header */}
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

      {/* Chart container */}
      <div
        id={chartContainerId}
        className="rounded-md bg-grayscale-10 border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4"
        style={{ width: "100%", height: "80vh" }}
      />
    </div>
  );
}
