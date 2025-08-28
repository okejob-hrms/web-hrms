// In a file like `utils/data-helpers.ts` or at the top of `index.tsx`

import { EmployeeNode } from "./types";
import { IEmployeeOrganizationStructure } from "@/services/employees/types";

export function flattenOrgData(
  apiNodes: IEmployeeOrganizationStructure[]
): EmployeeNode[] {
  let flatList: EmployeeNode[] = [];

  apiNodes.forEach((apiNode) => {
    const primaryReports = apiNode.children
      .filter((child) => child.relationship_type === "primary")
      .map((child) => String(child.id));

    const additionalReports = apiNode.children
      .filter((child) => child.relationship_type !== "primary")
      .map((child) => String(child.id));

    flatList.push({
      employeeId: String(apiNode.id),
      name: apiNode.name,
      title: apiNode.title,
      image: "/icons/user02.svg",
      reportsTo: {
        primary: primaryReports,
        additional: additionalReports,
      },
    });
    if (apiNode.children && apiNode.children.length > 0) {
      flatList = flatList.concat(flattenOrgData(apiNode.children));
    }
  });

  return flatList;
}
