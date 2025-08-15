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

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const initialData: EmployeeNode[] = [
  {
    id: "1",
    name: "John Doe",
    title: "CEO",
    image: "https://via.placeholder.com/40",
    children: [
      {
        id: "2",
        name: "Rihana",
        title: "CMO",
        image: "https://via.placeholder.com/28",
        children: [],
      },
      {
        id: "3",
        name: "Irfan",
        title: "CTO",
        image: "https://via.placeholder.com/22",
        children: [],
      },
      {
        id: "4",
        name: "Lado",
        title: "Head Finance",
        image: "https://via.placeholder.com/2",
        children: [
          {
            id: "5",
            name: "Alvin",
            title: "Lead Finance",
            image: "https://via.placeholder.com/8",
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
    nodeDatum: EmployeeTreeNodeDatum,
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

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="flex justify-between w-full items-center mb-3">
        <div className="flex gap-2 items-center">
          <h2 className="font-semibold text-xl">Organization Structure</h2>
        </div>
      </div>
      <div
        ref={treeContainer}
        className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4"
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
                  x={-width / 2} // geser supaya center
                  y={-height / 2} // geser supaya center
                  width={width}
                  height={height}
                >
                  <div className="bg-white rounded-lg shadow border p-3 relative">
                    {/* Menu */}
                    <div className="absolute top-2 right-2">
                      <button onClick={() => handleEditClick(empNode)}>
                        ⋮
                      </button>
                    </div>

                    {/* Image & Info */}
                    <div className="flex items-center gap-3">
                      <Image
                        src={empNode.image || "https://via.placeholder.com/40"}
                        alt={empNode.name ?? ""}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        unoptimized
                      />
                      <div>
                        <h4 className="font-semibold">{empNode.name}</h4>
                        <p className="text-sm text-gray-500">{empNode.title}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-around mt-3">
                      <button>📞</button>
                      <button>✉️</button>
                      <button>👤</button>
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
