import { useState } from "react";
import { EmployeeNode } from "./types";

export function useOrgChart(initialData: EmployeeNode[]) {
  const [data, setData] = useState<EmployeeNode[]>(initialData);

  const updateTree = (
    tree: EmployeeNode[],
    updated: EmployeeNode,
  ): EmployeeNode[] => {
    return tree.map((node) =>
      node.id === updated.id
        ? { ...updated }
        : {
            ...node,
            children: node.children ? updateTree(node.children, updated) : [],
          },
    );
  };

  const addChildNode = (
    parentId: string,
    newNode: EmployeeNode,
  ): EmployeeNode[] => {
    return data.map((node) =>
      node.id === parentId
        ? { ...node, children: [...(node.children || []), newNode] }
        : {
            ...node,
            children: node.children
              ? addChildNodeRecursive(node.children, parentId, newNode)
              : [],
          },
    );
  };

  const addChildNodeRecursive = (
    nodes: EmployeeNode[],
    parentId: string,
    newNode: EmployeeNode,
  ): EmployeeNode[] => {
    return nodes.map((node) =>
      node.id === parentId
        ? { ...node, children: [...(node.children || []), newNode] }
        : {
            ...node,
            children: node.children
              ? addChildNodeRecursive(node.children, parentId, newNode)
              : [],
          },
    );
  };

  return { data, setData, updateTree, addChildNode };
}
