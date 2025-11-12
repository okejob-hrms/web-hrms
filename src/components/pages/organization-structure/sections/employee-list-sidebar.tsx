// FileName: sections/employee-list-sidebar.tsx

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeGroupJobLevel } from "@/services/employees/group";

interface EmployeeListSidebarProps {
  onEmployeeSelect: (employeeId: number) => void;
  selectedEmployeeId: number | null;
}

export const EmployeeListSidebar = ({
  onEmployeeSelect,
  selectedEmployeeId,
}: EmployeeListSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleOpenChange = (jobLevelId: number, isOpen: boolean) => {
    setOpenStates((prev) => ({ ...prev, [jobLevelId]: isOpen }));
  };

  const isCollapsibleOpen = (jobLevelId: number) => {
    return openStates[jobLevelId] ?? true;
  };
  const {
    data: fetchJobLevelGroups,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["employeeGroupsByJobLevel", debouncedSearchTerm],
    queryFn: () => getEmployeeGroupJobLevel({ search: debouncedSearchTerm }),
  });

  const jobLevelGroups = fetchJobLevelGroups?.data ?? [];

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-full bg-white border p-4 flex flex-col">
      <h3 className="font-semibold text-lg mb-2">Employee</h3>
      <Input
        placeholder="Search Employee..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading || isFetching && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500">
            Failed to load employees.
          </div>
        )}

        {!isLoading &&
          !isError &&
          jobLevelGroups.map((group) => (
            <Collapsible
              key={group.job_level_id}
              open={isCollapsibleOpen(group.job_level_id)}
              onOpenChange={(isOpen) =>
                handleOpenChange(group.job_level_id, isOpen)
              }
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                  <span className="text-primary">{group.job_level_name}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-background text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                      {group.employees_count}
                    </div>
                  </div>
                </div>
                <CollapsibleTrigger asChild>
                  <button className="IconButton">
                    {isCollapsibleOpen(group.job_level_id) ? (
                      <ChevronUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="pl-2 space-y-1 py-1">
                  {group.employees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => onEmployeeSelect(employee.employee_id)}
                      className={`flex items-center gap-3 p-1 rounded-md hover:bg-gray-100 cursor-pointer ${
                        employee.employee_id === selectedEmployeeId
                          ? "bg-primary-background"
                          : ""
                      }`}
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
