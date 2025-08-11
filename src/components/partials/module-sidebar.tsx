"use client";

import { usePathname } from "next/navigation";
import { menus } from "@/lib/menu";
import { AppSidebar } from "@/components/partials/app-sidebar";

interface ModuleSidebarProps {
  defaultTitle?: string;
}

export function ModuleSidebar({ defaultTitle = "Module" }: ModuleSidebarProps) {
  const pathname = usePathname();
  const moduleName = pathname.split("/")[1]; // ambil segment pertama
  const menuItems = menus[moduleName] || [];

  return <AppSidebar title={defaultTitle} menuItems={menuItems} />;
}
