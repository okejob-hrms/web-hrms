import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Ellipsis, FileDown, Trash } from "lucide-react";
import * as React from "react";
import { getStatusSelfAssessment } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { OKRTab } from "./sections/tab";
import { CircularProgress } from "@/components/ui/progress";

export const PerformanceOKRDetails = () => {
  const status = getStatusSelfAssessment(1);
  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="font-semibold text-4xl">Q4 2025</h1>
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Ellipsis className="text-grayscale-30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    // handleDetail();
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <FileDown className="w-4 h-4" />
                  Export OKR
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    // handleEdit();
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit OKR
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    // handleDelete();
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <Trash className="w-4 h-4" />
                  Delete OKR
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">-</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">End Date</span>
          <span className="text-base">-</span>
        </div>
        <div className="border border-grayscale-10 rounded-xs px-4 py-2 flex justify-between items-center col-span-2 md:col-span-1">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-black">
              Overall Achievement
            </span>
            <span className="text-text-secondary text-xs">
              Average progres from overall achievement
            </span>
          </div>
          <CircularProgress
            value={50}
            size={120}
            strokeWidth={10}
            showLabel
            labelClassName="text-xl font-bold"
            renderLabel={(progress) => `${progress}%`}
          />
        </div>
        <div className="border border-grayscale-10 rounded-xs p-4 grid grid-cols-3 gap-4 col-span-2 md:col-span-1 items-center">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-primary-border rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                142
              </span>
              <span className="text-text-disabled text-sm">
                Total Key Result
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-warning rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                142
              </span>
              <span className="text-text-disabled text-sm">
                Open Key Result
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-success rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                142
              </span>
              <span className="text-text-disabled text-sm">
                Completed Key Result
              </span>
            </div>
          </div>
        </div>
      </div>
      <OKRTab />
    </div>
  );
};
