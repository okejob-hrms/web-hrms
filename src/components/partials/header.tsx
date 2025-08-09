"use client";

import Image from "next/image";
import * as React from "react";
import { Status, StatusIndicator, StatusLabel } from "../ui/shadcn-io/status";
import { Profile } from "./profile";
import { Separator } from "../ui/separator";
import Link from "next/link";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  Cloud,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import useNetworkStatus from "@/hooks/use-network-status";

interface BreadcrumbProps {
  items?: {
    label: string;
    link: string;
  }[];
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

const ListItem = React.memo(function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

const HeaderMenu = React.memo(function HeaderMenu() {
  const navigationMenuTriggerStyle = cn(
    "primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-b-none rounded-t-sm bg-white",
    "data-[state=open]:hover:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:focus:bg-primary data-[state=open]:bg-primary/50",
    "flex gap-2",
  );
  return (
    <div className="w-full bg-white">
      <NavigationMenu viewport={false} className="w-full px-10 py-2">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/dashboard.svg"
                width={20}
                height={20}
                alt="icon-dashboard"
              />
              Dashboard
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mt-4 mb-2 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p className="text-muted-foreground text-sm leading-tight">
                        Beautifully designed components built with Tailwind CSS.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/primitives/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/employee.svg"
                width={20}
                height={20}
                alt="icon-employee"
              />
              Employee
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/storeReport.svg"
                width={20}
                height={20}
                alt="icon-performance"
              />
              Performance
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[300px] gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Components</div>
                      <div className="text-muted-foreground">
                        Browse all components in the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Documentation</div>
                      <div className="text-muted-foreground">
                        Learn how to use the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Blog</div>
                      <div className="text-muted-foreground">
                        Read our latest blog posts.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/recruitment.svg"
                width={20}
                height={20}
                alt="icon-recruitment"
              />
              Recruitment
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[300px] gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Components</div>
                      <div className="text-muted-foreground">
                        Browse all components in the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Documentation</div>
                      <div className="text-muted-foreground">
                        Learn how to use the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">
                      <div className="font-medium">Blog</div>
                      <div className="text-muted-foreground">
                        Read our latest blog posts.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/book.svg"
                width={20}
                height={20}
                alt="icon-book"
              />
              Training
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link href="#">Components</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">Documentation</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">Blocks</Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/cash.svg"
                width={20}
                height={20}
                alt="icon-cash"
              />
              Expenses
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleHelpIcon />
                      Backlog
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleIcon />
                      To Do
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleCheckIcon />
                      Done
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle}>
              <Image
                src="/icons/documentSolid.svg"
                width={20}
                height={20}
                alt="icon-document"
              />
              Document
            </NavigationMenuTrigger>
            {/* <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleHelpIcon />
                      Backlog
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleIcon />
                      To Do
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex-row items-center gap-2">
                      <CircleCheckIcon />
                      Done
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
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
      <header className="w-full flex flex-row justify-between px-10 py-2 items-center bg-white">
        <div className="flex flex-row items-center">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          <span className="font-semibold text-lg">KUBIK HRMS</span>
        </div>
        <div className="flex items-center justify-end gap-4 h-10">
          <Status status={isOnline ? "online" : "offline"}>
            <StatusIndicator />
            <StatusLabel className="text-xs text-text-disabled" />
          </Status>
          <Button
            variant="ghost"
            onClick={() => setOnline((prev) => !prev)}
            className="text-xs text-text-disabled"
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
      <Breadcrumb className="w-full px-14 py-2 bg-white">
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
