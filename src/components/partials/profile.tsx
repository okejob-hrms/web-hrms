"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const Profile = React.memo(function Profile() {
  return (
    <div className="flex gap-3 items-center">
      <Avatar>
        <AvatarImage
          className="size-10"
          src="https://github.com/shadcn.png"
          alt="@shadcn"
        />
        <AvatarFallback className="size-10">CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="font-semibold tracking-tight text-base">shadcn</span>
        <span className="leading-none text-xs text-muted-foreground">
          Human Resource
        </span>
      </div>
      <Popover>
        <PopoverTrigger>
          <ChevronDown />
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover>
    </div>
  );
});

export { Profile };
