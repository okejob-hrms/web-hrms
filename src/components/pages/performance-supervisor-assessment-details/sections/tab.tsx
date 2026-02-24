import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import { AssessmentSchedule } from "./assessment-schedule";
import SupervisorAssessmentResult from "./performance-assessment";

interface Props {
  id: number;
}

export const SupervisorAssessmentTab = React.memo(
  function SupervisorAssessmentTab({ id }: Props) {
    const tabs = [
      {
        name: "Assessment Schedule",
        value: "assessment-schedule",
        children: <AssessmentSchedule id={id} />,
      },
      {
        name: "Performance Assessment",
        value: "performance-assessment",
        children: <SupervisorAssessmentResult id={id} />,
      },
    ];
    return (
      <Tabs
        orientation="vertical"
        defaultValue={tabs[0].value}
        className="w-full flex flex-row items-start gap-4 justify-center"
      >
        <div className="flex flex-col gap-4 border border-grayscale-10 rounded-b-sm rounded-md p-4 min-w-fit">
          <p className="font-semibold text-gray-900 text-xs">Completion</p>
          <TabsList className="grid grid-cols-1 p-0 bg-transparent h-fit">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="border-l-2 border-t-0 border-b-0 border-r-0 border-transparent justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary py-1.5 text-ellipsis"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="flex items-center justify-center w-full">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="flex items-center justify-center h-full"
            >
              {tab.children}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  },
);
