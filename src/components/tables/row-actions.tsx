import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye } from "lucide-react";
import { Can } from "@/components/auth/can";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  hideDelete?: boolean;
  onDetail?: () => void;
  editPermission?: string;
  deletePermission?: string;
  detailPermission?: string;
}

export function RowActions({
  onEdit,
  onDelete,
  hideDelete = false,
  onDetail,
  editPermission,
  deletePermission,
  detailPermission,
}: RowActionsProps) {
  const editItem = (
    <DropdownMenuItem
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
      onClick={onEdit}
    >
      <Edit3 className="w-4 h-4" />
      Edit
    </DropdownMenuItem>
  );

  const deleteItem = (
    <DropdownMenuItem
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
      onClick={onDelete}
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </DropdownMenuItem>
  );

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
          {onDetail &&
            (detailPermission ? (
              <Can permission={detailPermission}>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                  onClick={onDetail}
                >
                  <Eye className="w-4 h-4" />
                  Detail
                </DropdownMenuItem>
              </Can>
            ) : (
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
                onClick={onDetail}
              >
                <Eye className="w-4 h-4" />
                Detail
              </DropdownMenuItem>
            ))}
          {editPermission ? (
            <Can permission={editPermission}>{editItem}</Can>
          ) : (
            editItem
          )}
          {!hideDelete &&
            (deletePermission ? (
              <Can permission={deletePermission}>{deleteItem}</Can>
            ) : (
              deleteItem
            ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
