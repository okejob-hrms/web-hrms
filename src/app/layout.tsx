import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  Header,
  HeaderBreadcumb,
  HeaderMenu,
} from "@/components/partials/header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModuleSidebar } from "@/components/partials/module-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KUBIK HRMS",
  description: "Human Resource Management System",
};

const breadcrumbs = [
  {
    label: "Employee",
    link: "/employee",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FBF9F9]`}
      >
        <Header />
        <HeaderMenu />
        <HeaderBreadcumb items={breadcrumbs} />
        <SidebarProvider className="mx-auto w-full container md:py-10 flex flex-col md:flex-row md:gap-4">
          <SidebarTrigger className="md:hidden" />
          <ModuleSidebar defaultTitle="Employee" />
          <main className="w-full">{children}</main>
        </SidebarProvider>
      </body>
    </html>
  );
}
