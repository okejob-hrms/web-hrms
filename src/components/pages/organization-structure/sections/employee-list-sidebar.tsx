// FileName: sections/employee-list-sidebar.tsx

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeGroupJobLevel } from "@/services/employees/group";

const dummyJobLevelGroups = {
  data: [
    {
      job_level_id: 1,
      job_level_name: "Founder",
      employees: [
        {
          id: 1,
          name: "Olivia Rhye",
          job_position: "CEO",
          photo_profile_url: "/images/avatar-1.png",
        },
      ],
      employees_count: 1,
    },
    {
      job_level_id: 2,
      job_level_name: "Managerial",
      employees: [
        {
          id: 2,
          name: "Phoenix Baker",
          job_position: "CTO",
          photo_profile_url: "/images/avatar-2.png",
        },
        {
          id: 3,
          name: "Lana Steiner",
          job_position: "COO",
          photo_profile_url: "/images/avatar-3.png",
        },
      ],
      employees_count: 2,
    },
    {
      job_level_id: 3,
      job_level_name: "Engineering",
      employees: [
        {
          id: 4,
          name: "Candice Wu",
          job_position: "Head of Engineering",
          photo_profile_url: "/images/avatar-4.png",
        },
        {
          id: 5,
          name: "Jane Cooper",
          job_position: "Frontend Engineer",
          photo_profile_url: "/images/avatar-5.png",
        },
        {
          id: 6,
          name: "Leslie Alexander",
          job_position: "Frontend Engineer",
          photo_profile_url: "/images/avatar-6.png",
        },
      ],
      employees_count: 3,
    },
  ],
};

export const EmployeeListSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Fetch the data using useQuery
  const {
    data: jobLevelGroups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employeeGroupsByJobLevel"],
    queryFn: getEmployeeGroupJobLevel,
  });

  // 3. Filter the live data from the API based on the search term
  const filteredGroups = useMemo(() => {
    const jobLevelGroups = dummyJobLevelGroups;
    if (!jobLevelGroups?.data) return [];

    // If there's no search term, return all groups
    if (!searchTerm) return jobLevelGroups.data;

    // Otherwise, filter employees within each group
    return jobLevelGroups.data
      .map((group) => ({
        ...group,
        employees: group.employees.filter((employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.employees.length > 0); // Only include groups that have matching employees
  }, [searchTerm]);

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-full bg-white border p-4 flex flex-col">
      <h3 className="font-semibold text-lg mb-2">Employee</h3>
      <Input
        placeholder="Search Employee..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="flex-1 overflow-y-auto">
        {/* 4. Handle loading and error states */}
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500">
            Failed to load employees.
          </div>
        )}

        {/* 5. Render the filtered groups from the API response */}
        {!isLoading &&
          !isError &&
          filteredGroups.map((group) => (
            <Collapsible key={group.job_level_id} defaultOpen>
              <CollapsibleTrigger className="w-full flex justify-between items-center py-2 font-medium text-sm text-gray-600">
                <span>
                  {group.job_level_name} ({group.employees_count})
                </span>
                <ChevronsUpDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 space-y-1 py-1">
                  {group.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.photo_profile_url ?? ""} />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {employee.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {employee.job_position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
      </div>
    </div>
  );
};
