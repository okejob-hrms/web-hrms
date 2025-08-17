import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";

interface CardActionsProps {
  nodeId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardActions({ nodeId, onEdit, onDelete }: CardActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded node-action-btn"
          aria-label="Open row actions"
          type="button"
          data-node-id={nodeId}
          onClick={(e) => e.stopPropagation()} // important!
        >
          <MoreHorizontal className="h-[15px] w-[15px] text-grayscale-20" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          className="z-[9999]"
          style={{ width: 150 }} // custom width in pixels, adjust as needed
          align="end"
          sideOffset={-10}
          onClick={(e) => e.stopPropagation()} // prevents chart click events
        >
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
            onClick={onEdit}
          >
            <Edit3 className="w-4 h-4" />
            Edit Structure
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
