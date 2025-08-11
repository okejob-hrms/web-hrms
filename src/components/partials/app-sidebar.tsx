"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface MenuItem {
  name: string;
  value?: string;
  subItem?: MenuItem[];
}

interface AppSidebarProps {
  title: string;
  menuItems: MenuItem[];
}

export function AppSidebar({ title, menuItems }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <div className="flex flex-col gap-4 min-h-85 p-4">
          <p className="font-semibold text-lg">{title}</p>
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <React.Fragment key={item.value}>
                {item.subItem ? (
                  <div
                    className={`py-1.5 px-2 rounded-none flex flex-row justify-between items-center text-left text-sm ${
                      pathname.includes(`${item.value}`)
                        ? "text-primary border-l-2 border-primary font-bold"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    {item.name}
                    <ChevronDown size={16} />
                  </div>
                ) : (
                  <Link
                    href={`/${item.value}`}
                    className={`py-1.5 px-2 rounded-none justify-start text-left text-sm ${
                      pathname.includes(`${item.value}`)
                        ? "text-primary border-l-2 border-primary font-bold"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}

                {item.subItem &&
                  item.subItem.map((sub) => (
                    <Link
                      key={sub.value}
                      href={`/${sub.value}`}
                      className={`py-1.5 px-2 ml-4 rounded-none justify-start text-left text-sm ${
                        pathname === `/${sub.value}`
                          ? "text-primary"
                          : "text-gray-600 hover:text-primary"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
