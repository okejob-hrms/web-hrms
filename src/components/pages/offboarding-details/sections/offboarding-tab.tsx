import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import { ExitInterviewForm } from "./exit-interview-form";
import { WorkingAndAssets } from "./working-and-assets";
import { FinalSalaryBenefits } from "./final-salary-benefits";
import { InterviewSchedule } from "./interview-schedule";

interface Props {
  offboarding_id: number;
}

export const OffboardingTab = React.memo(function OffboardingTab({
  offboarding_id,
}: Props) {
  const tabs = [
    {
      name: "Interview Schedule",
      value: "interview-schedule",
      children: <InterviewSchedule offboarding_id={offboarding_id} />,
    },
    {
      name: "Exit Interview Form",
      value: "exit-interview-form",
      children: <ExitInterviewForm offboarding_id={offboarding_id} />,
    },
    {
      name: "Work Handover & Asset Return",
      value: "work-and-assets",
      children: <WorkingAndAssets />,
    },
    {
      name: "Final Salary & Benefits",
      value: "completion",
      children: <FinalSalaryBenefits offboarding_id={offboarding_id} />,
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
              className="border-l-2 border-t-0 border-b-0 border-r-0 border-transparent justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary py-1.5"
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
});
