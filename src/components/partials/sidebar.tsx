import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Home, Settings, User } from "lucide-react";

interface SidebarProps {
  title: string;
}

const tabs = [
  {
    name: "Employee Management",
    value: "employee-management",
    icon: Home,
  },
  {
    name: "Organization Structure",
    value: "organization-structure",
    icon: User,
  },
  {
    name: "Offboarding",
    value: "offboarding",
    icon: Bot,
  },
];

export default function Sidebar({ title }: SidebarProps) {
  return (
    <div className="m-4">
      <Tabs
        orientation="vertical"
        defaultValue={tabs[0].value}
        className="max-w-md w-full flex items-start gap-4 justify-start p-4 rounded-sm border bg-white min-h-1/3"
      >
        <p className="font-semibold text-lg">{title}</p>
        <TabsList className="shrink-0 grid grid-cols-1 min-w-28 p-0 bg-background pl-0.5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="border-l-2 border-transparent justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary  py-1.5"
            >
              {/* <tab.icon className="h-5 w-5 me-2" />  */}
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* <div className="h-40 flex items-center justify-center max-w-xs w-full border rounded-md font-medium text-muted-foreground">
						{tabs.map((tab) => (
							<TabsContent key={tab.value} value={tab.value}>
								{tab.name} Content
							</TabsContent>
						))}
					</div> */}
      </Tabs>
    </div>
  );
}
