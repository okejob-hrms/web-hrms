"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  Header,
  HeaderBreadcumb,
  HeaderMenu,
} from "@/components/partials/header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModuleSidebar } from "@/components/partials/module-sidebar";
import AppSkeleton from "./app-skeleton";
import { useState } from "react";
import { useEffect } from "react";

const breadcrumbs = [
  {
    label: "Employee",
    link: "/employee",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const queryClient = new QueryClient();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
  
    return () => clearTimeout(timer);
  }, [pathname]);

  if (isAuthPage) {
    return <main className="w-full">{children}</main>;
  }


  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <HeaderMenu />
      <HeaderBreadcumb items={breadcrumbs} />
      <SidebarProvider className="mx-auto w-full container md:py-10 flex flex-col md:flex-row md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <ModuleSidebar defaultTitle="Employee" />
        <main className="w-full"> {loading ? <AppSkeleton /> : children} </main>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
