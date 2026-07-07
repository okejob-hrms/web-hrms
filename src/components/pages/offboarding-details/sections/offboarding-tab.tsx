import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("offboarding");

  const tabs = React.useMemo(
    () => [
      {
        name: t("tabInterviewSchedule"),
        value: "interview-schedule",
        children: <InterviewSchedule offboarding_id={offboarding_id} />,
      },
      {
        name: t("tabExitInterviewForm"),
        value: "exit-interview-form",
        children: <ExitInterviewForm offboarding_id={offboarding_id} />,
      },
      {
        name: t("tabWorkHandoverAssetReturn"),
        value: "work-and-assets",
        children: <WorkingAndAssets />,
      },
      {
        name: t("tabFinalSalaryBenefits"),
        value: "completion",
        children: <FinalSalaryBenefits offboarding_id={offboarding_id} />,
      },
    ],
    [offboarding_id, t],
  );

  return (
    <Tabs
      orientation="vertical"
      defaultValue={tabs[0].value}
      className="w-full flex flex-col md:flex-row items-start gap-4 justify-center"
    >
      <div className="flex flex-col gap-4 border border-grayscale-10 rounded-b-sm rounded-md p-4 w-full md:min-w-fit md:w-auto">
        <p className="font-semibold text-gray-900 text-xs">{t("completion")}</p>
        <TabsList className="grid grid-cols-1 p-0 bg-transparent h-fit w-full">
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
      <div className="flex items-start md:items-center justify-center w-full overflow-x-auto">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="flex items-start md:items-center justify-center h-full w-full"
          >
            {tab.children}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
});
