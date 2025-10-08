import { EmployeeNode } from "./types";
import { IEmployeeOrganizationStructure } from "@/services/employees/types";

export function flattenOrgData(
  apiNodes: IEmployeeOrganizationStructure[],
  visited = new Set<number>()
): EmployeeNode[] {
  const flatList: EmployeeNode[] = [];

  const traverse = (node: IEmployeeOrganizationStructure) => {
    if (!node || visited.has(node.id)) return;
    visited.add(node.id);

    const primaryReports = node.children
      ?.filter((child) => child.relationship_type === "primary")
      .map((child) => String(child.id)) ?? [];

    const additionalReports = node.children
      ?.filter((child) => child.relationship_type !== "primary")
      .map((child) => String(child.id)) ?? [];

    flatList.push({
      employeeId: String(node.id),
      ...node,
      image: "/icons/user02.svg",
      reportsTo: {
        primary: primaryReports,
        additional: additionalReports,
      },
    });

    node.children?.forEach(traverse);
  };

  apiNodes.forEach(traverse);
  return flatList;
}
