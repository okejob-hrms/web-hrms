import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye } from "lucide-react";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  hideDelete?: boolean;
  onDetail?: () => void;
}

export function RowActions({
  onEdit,
  onDelete,
  hideDelete = false,
  onDetail,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded"
          aria-label="Open row actions"
          type="button"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          className="z-[9999]"
          style={{ width: 50 }} // custom width in pixels, adjust as needed
          align="end"
          sideOffset={-10}
        >
          {onDetail && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
              onClick={onDetail}
            >
              <Eye className="w-4 h-4" />
              Detail
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
            onClick={onEdit}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          {!hideDelete && (
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
