import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ObjectiveTab } from './objective-tab';
import { KeyResultTab } from './key-result-tab';
import OKRChartsSection from './dashboard';

export function OKRTab() {
  const tabs = [
    {
      name: 'Objective Key Result',
      value: '1',
      content: <ObjectiveTab />,
    },
    {
      name: 'Key Result',
      value: '2',
      content: <KeyResultTab />,
    },
    {
      name: 'Dashboard',
      value: '3',
      content: <OKRChartsSection />,
    },
  ];

  return (
    <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
      <TabsList className="p-1 w-full bg-secondary-background min-h-12 h-9">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'px-2.5 sm:px-3 text-secondary-hover',
              'data-[state=active]:bg-secondary data-[state=active]:text-white',
            )}
          >
            <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
              {tab.name}
            </code>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
