//  sections/employee-detail-modal.tsx
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmployeeNode } from "../types";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleClose: () => void;
  employeeData: EmployeeNode;
}

export default function EmployeeDetailModal({
  open,
  onOpenChange,
  handleClose,
}: EmployeeDetailModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Employee</AlertDialogTitle>
        </AlertDialogHeader>
        <div className={cn("overflow-y-auto pr-2 mt-4", "max-h-[500px]")}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/images/olivia-rhye.png" />
                <AvatarFallback>O</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Olivia</p>
                <p className="text-xs text-gray-500">CEO</p>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">Email</label>
                <label className="text-sm text-text-secondary">
                  test@mail.com
                </label>
              </div>
              <div className="flex flex-col gap-2 pr-30">
                <label className="text-sm text-text-secondary">
                  Phone Number
                </label>
                <label className="text-sm text-text-secondary">
                  +62902930190
                </label>
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Department</label>
              <label className="text-sm text-text-secondary">Managerial</label>
            </div>

            {/* Position */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Position</label>
              <label className="text-sm text-text-secondary">CEO</label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Job Level</label>
              <label className="text-sm text-text-secondary">Founder</label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Primary Direct Report
              </label>
              <label className="text-sm text-text-secondary">
                Phoenix Baker (CEO)
              </label>
            </div>

            {/* Team Multi-select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Additional Direct Report
              </label>
              <label className="text-sm text-text-secondary">
                Phoenix Baker (CEO); Demi Wilkinson (Head of Product Designer)
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">Teams</label>
              <div className="flex flex-row gap-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Team Creative
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Team Marketing
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Team Production
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex justify-center gap-4 mt-4">
          <Button
            className="min-w-[100px] shadow-none text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-w-[100px] border border-[#18618B] bg-white hover:bg-[#e6f1f7] text-[#18618B] font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
