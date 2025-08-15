import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Ellipsis } from "lucide-react";
import * as React from "react";

const CardItem = React.memo(function CardItem() {
  return (
    <div className="bg-primary-background rounded-md">
      <div className="min-h-36"></div>
      <div className="p-4 bg-white rounded-b-md">
        <div className="flex justify-between gap-2">
          <p className="text-text-secondary text-sm">Title.ppf</p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis size={12} className="text-text-disabled" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Icon size={12} name="openNewTab" color="#8E8E8E" /> Open
                Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="edit" color="#8E8E8E" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="download" color="#8E8E8E" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="delete" color="#8E8E8E" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-text-disabled">2021/4/15 16:29</p>
        <p className="text-text-disabled text-xs">
          uploaded by <span className="text-text-secondary">Samantha</span>
        </p>
      </div>
    </div>
  );
});

export const DocumentDetail = React.memo(function DocumentDetail() {
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-semibold text-lg">Employee Document</h1>
        <Button>+ Upload Document</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
      </div>
    </div>
  );
});
