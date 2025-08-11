import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import * as React from "react";

interface AppSidebarProps {
  title: string;
}

const tabs = [
  {
    name: "Employee Management",
    value: "employee-management",
  },
  {
    name: "Organization",
    value: "organization",
    subItem: [
      {
        name: "Org. Structure Chart",
        value: "organization/structure",
      },
      {
        name: "Position",
        value: "organization/position",
      },
      {
        name: "Teams",
        value: "organization/teams",
      },
      {
        name: "Job Levels",
        value: "organization/job-levels",
      },
      {
        name: "Department",
        value: "organization/department",
      },
    ],
  },
  {
    name: "Offboarding",
    value: "offboarding",
  },
];

export function AppSidebar({ title }: AppSidebarProps) {
  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <Tabs
          orientation="vertical"
          defaultValue={tabs[0].value}
          className="flex items-start gap-4 justify-start min-h-85 p-4"
        >
          <p className="font-semibold text-lg">{title}</p>
          <TabsList className="shrink-0 grid grid-cols-1 min-w-28 p-0 bg-transparent pl-0.5">
            {tabs.map((tab) => (
              <React.Fragment key={tab.value}>
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="border-0 justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary py-1.5 flex flex-col items-start text-primary"
                >
                  {/* <tab.icon className="h-5 w-5 me-2" />  */}
                  {tab.name}
                </TabsTrigger>
                {tab.subItem &&
                  tab.subItem.map((sub) => (
                    <TabsTrigger
                      key={sub.value}
                      value={sub.value}
                      className="border-l-2 border-0 justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary py-1.5 ml-4"
                    >
                      {/* <tab.icon className="h-5 w-5 me-2" />  */}
                      {sub.name}
                    </TabsTrigger>
                  ))}
              </React.Fragment>
            ))}
          </TabsList>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  );
}

// export default function Sidebar({ title }: AppSidebarProps) {
//   return (
//     <div className="m-4">
//       <Tabs
//         orientation="vertical"
//         defaultValue={tabs[0].value}
//         className="max-w-md w-full flex items-start gap-4 justify-start p-4 rounded-sm border bg-white h-80"
//       >
//         <p className="font-semibold text-lg">{title}</p>
//         <TabsList className="shrink-0 grid grid-cols-1 min-w-28 p-0 bg-background pl-0.5">
//           {tabs.map((tab) => (
//             <TabsTrigger
//               key={tab.value}
//               value={tab.value}
//               className="border-l-2 border-0 justify-start rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary py-1.5"
//             >
//               {/* <tab.icon className="h-5 w-5 me-2" />  */}
//               {tab.name}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {/* <div className="h-40 flex items-center justify-center max-w-xs w-full border rounded-md font-medium text-muted-foreground">
// 						{tabs.map((tab) => (
// 							<TabsContent key={tab.value} value={tab.value}>
// 								{tab.name} Content
// 							</TabsContent>
// 						))}
// 					</div> */}
//       </Tabs>
//     </div>
//   );
// }
