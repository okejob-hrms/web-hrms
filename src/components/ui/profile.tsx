"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
}

const Profile = React.memo(function Profile({ className }: Props) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  }

  return (
    <div className={cn("flex gap-3 items-center", className)}>
      <Avatar>
        <AvatarImage
          className="size-10"
          src="https://github.com/shadcn.png"
          alt="@shadcn"
        />
        <AvatarFallback className="size-10">CN</AvatarFallback>
      </Avatar>
      <div className="md:flex flex-col gap-1 hidden">
        <span className="font-semibold tracking-tight text-base">shadcn</span>
        <span className="leading-none text-xs text-muted-foreground">
          Human Resource
        </span>
      </div>
      <Popover>
        <PopoverTrigger>
          <ChevronDown />
        </PopoverTrigger>
        <PopoverContent>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export { Profile };
