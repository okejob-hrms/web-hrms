"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Toolbar } from "./sections/toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { IEmployeeResponse } from "@/services/employees/types";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/services/employees";
import { Filters } from "./types";
import dayjs from "dayjs";

const employeesData: IEmployeeResponse[] = [
  // {
  //   firstName: "Alice",
  //   lastName: "Johnson",
  //   employeeId: "EMP001",
  //   position: "Software Engineer",
  //   department: "Engineering",
  //   email: "alice.johnson@example.com",
  //   phoneNo: "+62 812-3456-7890",
  //   status: "active",
  //   joinDate: "2022-03-15",
  //   image:
  //     "https://images.unsplash.com/photo-1550525811-e5869dd03032?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Bob",
  //   lastName: "Smith",
  //   employeeId: "EMP002",
  //   position: "Product Manager",
  //   department: "Product",
  //   email: "bob.smith@example.com",
  //   phoneNo: "+62 813-4567-8901",
  //   status: "on_leave",
  //   joinDate: "2021-11-01",
  //   image:
  //     "https://images.unsplash.com/photo-1544723495-432537d5a1a4?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Clara",
  //   lastName: "Tan",
  //   employeeId: "EMP003",
  //   position: "UX Designer",
  //   department: "Design",
  //   email: "clara.tan@example.com",
  //   phoneNo: "+62 814-5678-9012",
  //   status: "active",
  //   joinDate: "2023-01-20",
  //   image:
  //     "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Daniel",
  //   lastName: "Wirawan",
  //   employeeId: "EMP004",
  //   position: "Finance Analyst",
  //   department: "Finance",
  //   email: "daniel.wirawan@example.com",
  //   phoneNo: "+62 815-6789-0123",
  //   status: "inactive",
  //   joinDate: "2020-07-12",
  //   image:
  //     "https://images.unsplash.com/photo-1502767089025-6572583495b9?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Eva",
  //   lastName: "Lestari",
  //   employeeId: "EMP005",
  //   position: "HR Specialist",
  //   department: "Human Resources",
  //   email: "eva.lestari@example.com",
  //   phoneNo: "+62 816-7890-1234",
  //   status: "active",
  //   joinDate: "2024-04-30",
  //   image:
  //     "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Farhan",
  //   lastName: "Putra",
  //   employeeId: "EMP006",
  //   position: "Backend Developer",
  //   department: "Engineering",
  //   email: "farhan.putra@example.com",
  //   phoneNo: "+62 817-8901-2345",
  //   status: "active",
  //   joinDate: "2021-08-10",
  //   image:
  //     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Grace",
  //   lastName: "Lim",
  //   employeeId: "EMP007",
  //   position: "Marketing Executive",
  //   department: "Marketing",
  //   email: "grace.lim@example.com",
  //   phoneNo: "+62 818-9012-3456",
  //   status: "on_leave",
  //   joinDate: "2022-02-05",
  //   image:
  //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Hadi",
  //   lastName: "Santoso",
  //   employeeId: "EMP008",
  //   position: "Data Analyst",
  //   department: "Data",
  //   email: "hadi.santoso@example.com",
  //   phoneNo: "+62 819-0123-4567",
  //   status: "active",
  //   joinDate: "2020-09-17",
  //   image:
  //     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Irene",
  //   lastName: "Chandra",
  //   employeeId: "EMP009",
  //   position: "Business Analyst",
  //   department: "Business",
  //   email: "irene.chandra@example.com",
  //   phoneNo: "+62 820-1234-5678",
  //   status: "inactive",
  //   joinDate: "2019-06-23",
  //   image:
  //     "https://images.unsplash.com/photo-1502767089025-6572583495b9?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Jack",
  //   lastName: "Lee",
  //   employeeId: "EMP010",
  //   position: "Frontend Developer",
  //   department: "Engineering",
  //   email: "jack.lee@example.com",
  //   phoneNo: "+62 821-2345-6789",
  //   status: "active",
  //   joinDate: "2023-07-01",
  //   image:
  //     "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Karen",
  //   lastName: "Wong",
  //   employeeId: "EMP011",
  //   position: "UI Designer",
  //   department: "Design",
  //   email: "karen.wong@example.com",
  //   phoneNo: "+62 822-3456-7890",
  //   status: "active",
  //   joinDate: "2021-10-14",
  //   image:
  //     "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Lukman",
  //   lastName: "Hakim",
  //   employeeId: "EMP012",
  //   position: "IT Support",
  //   department: "IT",
  //   email: "lukman.hakim@example.com",
  //   phoneNo: "+62 823-4567-8901",
  //   status: "on_leave",
  //   joinDate: "2022-12-11",
  //   image:
  //     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Maria",
  //   lastName: "Sari",
  //   employeeId: "EMP013",
  //   position: "Recruiter",
  //   department: "Human Resources",
  //   email: "maria.sari@example.com",
  //   phoneNo: "+62 824-5678-9012",
  //   status: "active",
  //   joinDate: "2020-04-22",
  //   image:
  //     "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Nathan",
  //   lastName: "Kurniawan",
  //   employeeId: "EMP014",
  //   position: "Operations Manager",
  //   department: "Operations",
  //   email: "nathan.kurniawan@example.com",
  //   phoneNo: "+62 825-6789-0123",
  //   status: "inactive",
  //   joinDate: "2018-01-30",
  //   image:
  //     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Olivia",
  //   lastName: "Wijaya",
  //   employeeId: "EMP015",
  //   position: "Finance Manager",
  //   department: "Finance",
  //   email: "olivia.wijaya@example.com",
  //   phoneNo: "+62 826-7890-1234",
  //   status: "active",
  //   joinDate: "2023-05-18",
  //   image:
  //     "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Patrick",
  //   lastName: "Yap",
  //   employeeId: "EMP016",
  //   position: "Legal Counsel",
  //   department: "Legal",
  //   email: "patrick.yap@example.com",
  //   phoneNo: "+62 827-8901-2345",
  //   status: "active",
  //   joinDate: "2021-09-09",
  //   image:
  //     "https://images.unsplash.com/photo-1502767089025-6572583495b9?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Queenie",
  //   lastName: "Lim",
  //   employeeId: "EMP017",
  //   position: "Public Relations Officer",
  //   department: "PR",
  //   email: "queenie.lim@example.com",
  //   phoneNo: "+62 828-9012-3456",
  //   status: "on_leave",
  //   joinDate: "2020-02-02",
  //   image:
  //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Rizky",
  //   lastName: "Maulana",
  //   employeeId: "EMP018",
  //   position: "Customer Support",
  //   department: "Customer Service",
  //   email: "rizky.maulana@example.com",
  //   phoneNo: "+62 829-0123-4567",
  //   status: "active",
  //   joinDate: "2023-06-15",
  //   image:
  //     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Siti",
  //   lastName: "Nurhaliza",
  //   employeeId: "EMP019",
  //   position: "Procurement Officer",
  //   department: "Procurement",
  //   email: "siti.nurhaliza@example.com",
  //   phoneNo: "+62 830-1234-5678",
  //   status: "inactive",
  //   joinDate: "2019-11-27",
  //   image:
  //     "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Tommy",
  //   lastName: "Gunawan",
  //   employeeId: "EMP020",
  //   position: "QA Engineer",
  //   department: "Quality Assurance",
  //   email: "tommy.gunawan@example.com",
  //   phoneNo: "+62 831-2345-6789",
  //   status: "active",
  //   joinDate: "2021-04-04",
  //   image:
  //     "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Umi",
  //   lastName: "Hidayah",
  //   employeeId: "EMP021",
  //   position: "Content Writer",
  //   department: "Content",
  //   email: "umi.hidayah@example.com",
  //   phoneNo: "+62 832-3456-7890",
  //   status: "on_leave",
  //   joinDate: "2022-07-19",
  //   image:
  //     "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Victor",
  //   lastName: "Pratama",
  //   employeeId: "EMP022",
  //   position: "DevOps Engineer",
  //   department: "Engineering",
  //   email: "victor.pratama@example.com",
  //   phoneNo: "+62 833-4567-8901",
  //   status: "active",
  //   joinDate: "2020-10-29",
  //   image:
  //     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Wulan",
  //   lastName: "Syafitri",
  //   employeeId: "EMP023",
  //   position: "Accountant",
  //   department: "Finance",
  //   email: "wulan.syafitri@example.com",
  //   phoneNo: "+62 834-5678-9012",
  //   status: "active",
  //   joinDate: "2021-01-07",
  //   image:
  //     "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Xavier",
  //   lastName: "Lie",
  //   employeeId: "EMP024",
  //   position: "Research Scientist",
  //   department: "R&D",
  //   email: "xavier.lie@example.com",
  //   phoneNo: "+62 835-6789-0123",
  //   status: "inactive",
  //   joinDate: "2018-09-13",
  //   image:
  //     "https://images.unsplash.com/photo-1502767089025-6572583495b9?crop=faces&fit=crop&h=200&w=200",
  // },
  // {
  //   firstName: "Yani",
  //   lastName: "Setiawan",
  //   employeeId: "EMP025",
  //   position: "Training Coordinator",
  //   department: "Training",
  //   email: "yani.setiawan@example.com",
  //   phoneNo: "+62 836-7890-1234",
  //   status: "active",
  //   joinDate: "2023-08-21",
  //   image:
  //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&h=200&w=200",
  // },
];

export const columns: ColumnDef<IEmployeeResponse>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage src={row.original.photo_profile} />
        </Avatar>
        <div className="flex flex-col">
          <span>{row.original.name}</span>
          <span>{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "job_position",
    header: "Position",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="default"
          className={cn(
            "rounded-full",
            status === 1 ? "bg-success-focused " : "bg-error-focused ",
          )}
        >
          <div
            className={cn(
              "size-2 rounded-full",
              status === 1 ? "bg-success" : "bg-error",
            )}
          />
          <span className={cn(status === 1 ? "text-success" : "text-error")}>
            {status === 1 ? "Active" : "Inactive"}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Join Date",
    cell: ({ row }) => {
      const date = new Date(row.original.start_date);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "menu",
    header: "",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis className="text-grayscale-30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href="/employee/employee-management/detail"
                className="flex justify-between items-center"
              >
                <Icon name="eyeVisible" size={24} color="currentColor" />
                Employee Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="#" className="flex justify-between items-center">
                <Icon name="edit" size={24} color="currentColor" />
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
export default function EmployeeManagementList() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<Filters>({
    department: [""],
    position: [""],
    search: "",
    start_date: dayjs().format("DD-MM-YYYY"),
    end_date: dayjs().format("DD-MM-YYYY"),
  });
  const { data: employees } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => getEmployees(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const handleFiltersChange = React.useCallback((newFilters: Filters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
  }, []);
  return (
    <div className="flex flex-col justify-between gap-6 p-4">
      <Toolbar onFiltersChange={handleFiltersChange} />
      <Separator />
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4">
        <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold text-xl">Employee List</h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {employees?.data.data.length} Employee
            </Badge>
          </div>
          <Button
            onClick={() => router.push("/employee/employee-management/add")}
          >
            + New Employee
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={employees?.data.data}
          withPagination
        />
      </div>
    </div>
  );
}
