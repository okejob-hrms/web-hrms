"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";
import { EmployeeNode } from "./types";
import { useOrgChart } from "./hook";
import { SelectEmployeeModal } from "./sections/select-employee";
import { EditEmployeeModal } from "./sections/edit-employee";
import { TreeNodeDatum } from "react-d3-tree";
import { useEffect } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const initialData: EmployeeNode[] = [
  {
    id: "1",
    name: "John Doe",
    title: "CEO",
    image: "/icons/user02.svg",
    children: [
      {
        id: "2",
        name: "Rihana",
        title: "CMO",
        image: "/icons/user02.svg",
        children: [],
      },
      {
        id: "3",
        name: "Irfan",
        title: "CTO",
        image: "/icons/user02.svg",
        children: [],
      },
      {
        id: "4",
        name: "Lado",
        title: "Head Finance",
        image: "/icons/user02.svg",
        children: [
          {
            id: "5",
            name: "Alvin",
            title: "Lead Finance",
            image: "/icons/user02.svg",
            children: [],
          },
        ],
      },
    ],
  },
];
// Extend tipe bawaan agar nodeDatum mengenal field custom kita
type EmployeeTreeNodeDatum = TreeNodeDatum & EmployeeNode;

export default function OrgChartPage() {
  const { data, setData, updateTree } = useOrgChart(initialData);
  const [selectedNode, setSelectedNode] = useState<EmployeeNode | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);

  const treeContainer = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // helper convert
  const mapToEmployeeNode = (
    nodeDatum: EmployeeTreeNodeDatum
  ): EmployeeNode => {
    return {
      id: nodeDatum.id || "",
      name: nodeDatum.name || "",
      title: nodeDatum.title || "",
      image: nodeDatum.image || "",
      children: (nodeDatum.children as EmployeeNode[]) ?? [],
    };
  };

  const handleAddClick = (nodeDatum: EmployeeTreeNodeDatum) => {
    setSelectedNode(mapToEmployeeNode(nodeDatum));
    setModalType("add");
  };

  const handleEditClick = (nodeDatum: EmployeeTreeNodeDatum) => {
    setSelectedNode(mapToEmployeeNode(nodeDatum));
    setModalType("edit");
  };

  useEffect(() => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 50,
      });
    }
  }, []);

  const IS_SAFARI =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
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
                alt="icon download"
              />
              <span>Last Update</span>
              <span className="text-primary">Jul 20, 2025</span>
              <span className="text-primary">16:00</span>
            </div>
            <Button
              onClick={() => {}}
              className="bg-white border border-primary text-primary whitespace-nowrap hover:bg-white/90"
            >
              <Image
                src="/icons/download.svg"
                width={18}
                height={18}
                alt="icon download"
              />
              Download
            </Button>
            <Button onClick={() => {}} className="whitespace-nowrap">
              <Image
                src="/icons/edit.svg"
                width={18}
                height={18}
                alt="icon search"
              />
              Edit Structure
            </Button>
          </div>
        </div>
      </div>
      <div
        ref={treeContainer}
        className="rounded-md bg-grayscale-10 border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4"
        style={{ width: "100%", height: "80vh" }}
      >
        <Tree
          data={data}
          orientation="vertical"
          pathFunc="elbow"
          zoom={0.8}
          nodeSize={{ x: 300, y: 200 }}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
          translate={translate}
          renderCustomNodeElement={({ nodeDatum }) => {
            const empNode = nodeDatum as EmployeeTreeNodeDatum;
            const width = 250;
            const height = 130;

            return (
              <g>
                <foreignObject
                  x={-width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                >
                  <div
                    className="bg-white rounded-lg shadow border p-3 relative"
                    style={
                      IS_SAFARI
                        ? {
                            position: "static", // Avoid blur in Safari
                            WebkitTransformStyle: "unset",
                            WebkitBackfaceVisibility: "unset",
                            transition: "none",
                            transform: "none",
                          }
                        : {}
                    }
                  >
                    {/* Menu */}
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-row justify-between">
                        {/* Image & Info */}
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              empNode.image || "https://via.placeholder.com/40"
                            }
                            alt={empNode.name ?? ""}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                            unoptimized
                          />
                          <div>
                            <h4 className="font-semibold">{empNode.name}</h4>
                            <p className="text-sm text-gray-500">
                              {empNode.title}
                            </p>
                          </div>
                        </div>
                        <div className="top-2 right-2">
                          <button onClick={() => handleEditClick(empNode)}>
                            ⋮
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-around mt-3">
                        <button>📞</button>
                        <button>✉️</button>
                        <button>👤</button>
                      </div>
                    </div>

                    {/* Add Button */}
                    <div
                      onClick={() => handleAddClick(empNode)}
                      className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 bg-primary text-white border rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          }}
        />
      </div>

      {/* Select Employee Modal */}
      {modalType === "add" && selectedNode && (
        <SelectEmployeeModal
          open
          onClose={() => setModalType(null)}
          onSelect={(employee) => {
            setSelectedNode({ ...employee, id: crypto.randomUUID() });
            setModalType("edit");
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {modalType === "edit" && selectedNode && (
        <EditEmployeeModal
          open
          onClose={() => setModalType(null)}
          employee={selectedNode}
          onSave={(updated) => {
            setData((prev) => updateTree(prev, updated));
          }}
        />
      )}
    </div>
  );
}
