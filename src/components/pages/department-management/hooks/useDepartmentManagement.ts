import { useState } from "react";

export type Department = {
  name: string;
  description: string;
};

export function useDepartmentManagement() {
  type Department = {
    departmentId: number;
    departmentName: string;
    description?: string;
    lastUpdateDate: string;
    lastUpdateHour: string;
  };

  const dummyDepartments: Department[] = [
    {
      departmentId: 0,
      departmentName: "Managerial",
      description:
        "Oversees strategic planning, decision-making, and cross-department coordination.",
      lastUpdateDate: "December 2, 2018",
      lastUpdateHour: "12:00",
    },
    // {
    //   departmentId: 1,
    //   departmentName: "Manufacturing Operations",
    //   description:
    //     "Handles daily production activities to ensure efficient and timely output.",
    //   lastUpdateDate: "February 9, 2015",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 2,
    //   departmentName: "Quality Control (QC)",
    //   description:
    //     "Inspects finished products to ensure they meet required quality standards.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 3,
    //   departmentName: "Quality Assurance (QA)",
    //   description:
    //     "Establishes and monitors systems to maintain consistent product quality.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 4,
    //   departmentName: "Maintenance & Engineering",
    //   description:
    //     "Maintains machinery and infrastructure to minimize downtime and optimize performance.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 5,
    //   departmentName: "Process Improvement",
    //   description:
    //     "Analyzes workflows and implements improvements to boost productivity and efficiency.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 6,
    //   departmentName: "Plant Operations",
    //   description:
    //     "Manages overall plant activities, including staffing, safety, and performance.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 7,
    //   departmentName: "Procurement",
    //   description:
    //     "Sources and purchases materials and components needed for production.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 8,
    //   departmentName: "Warehouse",
    //   description:
    //     "Stores and manages raw materials, components, and finished goods inventory.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
    // {
    //   departmentId: 9,
    //   departmentName: "Supply Chain Management",
    //   description:
    //     "Coordinates the flow of goods, information, and resources across the production cycle.",
    //   lastUpdateDate: "March 23, 2013",
    //   lastUpdateHour: "12:00",
    // },
  ];

  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] =
    useState<Department[]>(dummyDepartments);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  console.log("Departments", departments);

  const handleSave = () => {
    if (editIndex !== null) {
      setDepartments((departments) =>
        departments.map((dept, idx) =>
          idx === editIndex
            ? {
                departmentName: departmentName,
                description,
                departmentId: idx,
                lastUpdateDate: "March 23, 2013",
                lastUpdateHour: "12:00",
              }
            : dept,
        ),
      );
    } else {
      setDepartments([
        ...departments,
        {
          departmentName: departmentName,
          description,
          departmentId: departments.length,
          lastUpdateDate: "March 23, 2013",
          lastUpdateHour: "12:00",
        },
      ]);
    }
    setDepartmentName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (idx: number) => {
    console.log("IDD", idx, departments[idx].departmentName);
    setDepartmentName(departments[idx].departmentName);
    setDescription(departments[idx].description ?? "");
    setEditIndex(idx);
    setOpen(true);
  };

  const handleClose = () => {
    setDepartmentName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      setDepartments((departments) =>
        departments.filter((_, idx) => idx !== deleteIndex),
      );
      setDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  return {
    departmentName,
    setDepartmentName,
    description,
    setDescription,
    open,
    setOpen,
    departments,
    setDepartments,
    editIndex,
    setEditIndex,
    deleteIndex,
    setDeleteIndex,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleSave,
    handleEdit,
    handleClose,
    handleDelete,
  };
}
