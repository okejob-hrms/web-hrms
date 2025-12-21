import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
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
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleOpenChange = (jobLevelId: number, isOpen: boolean) => {
    setOpenStates((prev) => ({ ...prev, [jobLevelId]: isOpen }));
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
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold text-gray-800">Employee List</h3>
        <div className="relative">
          <Input
            placeholder="Search name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading || (isFetching && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-gray-500">Loading directory...</span>
          </div>
        ))}

        {isError && (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-lg">
            Failed to load employees.
          </div>
        )}

        {!isLoading && jobLevelGroups.map((group) => (
          <Collapsible
            key={group.job_level_id}
            open={openStates[group.job_level_id] ?? true}
            onOpenChange={(open) => handleOpenChange(group.job_level_id, open)}
            className="mb-2"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors group">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary uppercase tracking-wider">
                  {group.job_level_name}
                </span>
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {group.employees_count}
                </span>
              </div>
              {openStates[group.job_level_id] !== false ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 mt-1">
              {group.employees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => onEmployeeSelect(employee.employee_id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    employee.employee_id === selectedEmployeeId
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-gray-50"
                  }`}
                >
                  <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                    <AvatarImage src={employee.photo_profile_url ?? ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {employee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {employee.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {employee.job_position}
                    </span>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};