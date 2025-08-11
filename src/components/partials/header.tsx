"use client";

import Image from "next/image";
import * as React from "react";
import { Status, StatusIndicator, StatusLabel } from "../ui/shadcn-io/status";
import { Separator } from "../ui/separator";
import Link from "next/link";
import {
  // CircleCheckIcon,
  // CircleHelpIcon,
  // CircleIcon,
  Cloud,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  // NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  // NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  // BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import useNetworkStatus from "@/hooks/use-network-status";
import { Profile } from "../ui/profile";
import { usePathname } from "next/navigation";

interface BreadcrumbProps {
  items?: {
    label: string;
    link: string;
  }[];
}

// const components: { title: string; href: string; description: string }[] = [
//   {
//     title: "Alert Dialog",
//     href: "/docs/primitives/alert-dialog",
//     description:
//       "A modal dialog that interrupts the user with important content and expects a response.",
//   },
//   {
//     title: "Hover Card",
//     href: "/docs/primitives/hover-card",
//     description:
//       "For sighted users to preview content available behind a link.",
//   },
//   {
//     title: "Progress",
//     href: "/docs/primitives/progress",
//     description:
//       "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
//   },
//   {
//     title: "Scroll-area",
//     href: "/docs/primitives/scroll-area",
//     description: "Visually or semantically separates content.",
//   },
//   {
//     title: "Tabs",
//     href: "/docs/primitives/tabs",
//     description:
//       "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
//   },
//   {
//     title: "Tooltip",
//     href: "/docs/primitives/tooltip",
//     description:
//       "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
//   },
// ];

// const ListItem = React.memo(function ListItem({
//   title,
//   children,
//   href,
//   ...props
// }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
//   return (
//     <li {...props}>
//       <NavigationMenuLink asChild>
//         <Link href={href}>
//           <div className="text-sm leading-none font-medium">{title}</div>
//           <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
//             {children}
//           </p>
//         </Link>
//       </NavigationMenuLink>
//     </li>
//   );
// });

const menuItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: "/icons/dashboard.svg",
    path: "/dashboard",
    children: [],
  },
  {
    name: "employee",
    label: "Employee",
    icon: "/icons/employee.svg",
    path: "/employee",
    children: [
      { label: "Employee Management", desc: "Manage employee data, organization structure, and onboarding/offboarding processes", path: "/employee/employee-management" , icon: "/icons/user02.svg",},
      { label: "Employee Attendance", desc: "Track employee attendance, timesheets, leave requests, and balances.", path: "/employee/attendance/attendance-tracker", icon: "/icons/clock.svg", },
      { label: "Payroll", desc: "Streamline salary calculations, benefits, and monthly payroll processing.", path: "/employee/payroll", icon: "/icons/cash.svg", },
    ],
  },
  {
    name: "performance",
    label: "Performance",
    icon: "/icons/storeReport.svg",
    path: "/performance",
    children: [],
  },
  {
    name: "recruitment",
    label: "Recruitment",
    icon: "/icons/recruitment.svg",
    path: "/recruitment",
    children: [],
  },
  {
    name: "training",
    label: "Training",
    icon: "/icons/book.svg",
    path: "/training",
    children: [],
  },
  {
    name: "expenses",
    label: "Expenses",
    icon: "/icons/cash.svg",
    path: "/expenses",
    children: [],
  },
  {
    name: "document",
    label: "Document",
    icon: "/icons/documentSolid.svg",
    path: "/document",
    children: [],
  },
];

const HeaderMenu = React.memo(function HeaderMenu() {
  const pathname = usePathname();

  const navigationMenuTriggerStyle = (isActive: boolean) =>
    cn(
      "primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-b-none rounded-t-sm bg-white flex gap-2",
      "data-[state=open]:hover:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:focus:bg-primary data-[state=open]:bg-primary/50",
      isActive && "bg-primary text-primary-foreground"
    );

  return (
    <div className="w-full bg-white">
      <NavigationMenu viewport={false} className="w-full px-10 py-2">
        <NavigationMenuList>
          {menuItems.map((item) => {
            const isActive = pathname.includes(`/${item.name}`);
            return (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuTrigger
                  className={navigationMenuTriggerStyle(isActive)}
                >
                  <Image
                    src={item.icon}
                    width={20}
                    height={20}
                    alt={`icon-${item.name}`}
                  />
                  {item.label}
                </NavigationMenuTrigger>

                {item.children.length > 0 && (
                  <NavigationMenuContent className="bg-white opacity-100">
                    <ul className="grid gap-2 p-4 md:w-[300px]">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.path}
                              className={cn(
                                "block rounded px-3 py-2 text-sm hover:bg-muted hover:text-foreground",
                                pathname === child.path &&
                                  "bg-primary/20 opacity-100 text-primary"
                              )}
                            >
                              <div className="flex flex-row gap-3 items-start">
                                <Image
                                  src={child.icon}
                                  width={20}
                                  height={20}
                                  alt={`icon-${child.label}`}
                                />
                                <div className="space-y-2">
                                  <div className="font-bold text-gray-800 text-base">{child.label}</div>
                                  <div className="text-gray-400 text-sm">{child.desc}</div>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <Separator />
    </div>
  );
});

const Header = React.memo(function Header() {
  const { isOnline, setOnline } = useNetworkStatus();
  return (
    <React.Fragment>
      <header className="w-full flex flex-row justify-between md:px-10 py-2 items-center bg-white">
        <div className="flex flex-row items-center">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="logo" fill className="object-cover" />
          </div>
          <span className="font-semibold md:text-lg text-base">KUBIK HRMS</span>
        </div>
        <div className="items-center justify-end gap-4 h-10 flex">
          <Status
            status={isOnline ? "online" : "offline"}
            className="hidden md:flex"
          >
            <StatusIndicator />
            <StatusLabel className="text-xs text-text-disabled" />
          </Status>
          <Button
            variant="ghost"
            onClick={() => setOnline((prev) => !prev)}
            className="text-xs text-text-disabled md:flex hidden"
          >
            {isOnline ? (
              <Image
                src="/icons/offline.svg"
                alt="icon-notification"
                width={20}
                height={20}
              />
            ) : (
              <Cloud size={20} />
            )}
            {isOnline ? "Offline" : "Online"} Mode
          </Button>
          <Button className="bg-background rounded-full size-8 p-0">
            <Image
              src="/icons/notification.svg"
              alt="icon-notification"
              width={20}
              height={20}
            />
          </Button>
          <Separator orientation="vertical" />
          <Profile />
        </div>
      </header>
      <Separator />
    </React.Fragment>
  );
});

const HeaderBreadcumb = React.memo(function BreadcrumbWithCustomSeparator({
  items,
}: BreadcrumbProps) {
  return (
    <React.Fragment>
      <Breadcrumb className="w-full md:px-10 px-2 py-2 bg-white">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Image
                  src="/icons/home.svg"
                  alt="Logo"
                  width={16}
                  height={16}
                />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items && items.length > 0 && (
            <BreadcrumbSeparator>
              <span className="text-xs">/</span>
            </BreadcrumbSeparator>
          )}
          {items?.map((item, index) => (
            <div key={item.link} className="flex gap-2">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.link}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index != items.length - 1 && (
                <BreadcrumbSeparator>
                  <span className="text-xs">/</span>
                </BreadcrumbSeparator>
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Separator />
    </React.Fragment>
  );
});

export { Header, HeaderMenu, HeaderBreadcumb };
