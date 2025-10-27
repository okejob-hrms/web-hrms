import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import * as React from "react";
import { useLeaveTypeManagement } from "./hook";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LeaveTypeTable } from "./sections/leave-type-table";
import { LeaveBalanceTable } from "./sections/leave-balance-table";

export const SettingsLeaveTypeManagement = React.memo(
  function SettingsLeaveTypeManagement() {
    const { tabs } = useLeaveTypeManagement();

    return (
      <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
        <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
          <TabsList className="p-1 w-full bg-secondary-background min-h-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "px-2.5 sm:px-3 text-secondary-hover",
                  "data-[state=active]:bg-secondary data-[state=active]:text-white",
                )}
              >
                <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                  {tab.name}
                </code>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="w-full">
              {tab.value === "leave-type" ? (
                <LeaveTypeTable />
              ) : (
                <LeaveBalanceTable />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  },
);
