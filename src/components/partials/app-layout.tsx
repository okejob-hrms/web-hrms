"use client";

import { usePathname } from "next/navigation";
import {
  Header,
  HeaderBreadcumb,
  HeaderMenu,
} from "@/components/partials/header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModuleSidebar } from "@/components/partials/module-sidebar";

const breadcrumbs = [
  {
    label: "Employee",
    link: "/employee",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <HeaderMenu />
      <HeaderBreadcumb items={breadcrumbs} />
      <SidebarProvider className="mx-auto w-full container md:py-10 flex flex-col md:flex-row md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <ModuleSidebar defaultTitle="Employee" />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </>
  );
}
