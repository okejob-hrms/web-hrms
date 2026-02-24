import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import dayjs from "dayjs";
import { OvertimeListItem, RequestOvertime } from "@/services/overtime/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  data: OvertimeListItem | undefined;
  formData: RequestOvertime;
  setFormData: React.Dispatch<React.SetStateAction<RequestOvertime>>;
}

export default function OvertimeEditModal({
  onUpdate,
  isOpen,
  setIsOpen,
  data,
  formData,
  setFormData,
}: Props) {
  const handleUpdate = async (e: React.MouseEvent) => {
    console.log("Employee data updated");
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              Edit Leave Request
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-18 w-18">
              <AvatarImage src={`${data?.employee?.avatar_url}`} />
              <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                {stringAvatar(data?.employee?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <div className="font-medium">{data?.employee?.name}</div>
              <div className="font-medium text-gray-600">
                (#{data?.employee?.id})
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 space-y-2 mb-4">
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Overtime Date</div>
              <Input
                type="date"
                value={formData.overtime_date}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    overtime_date: e
                      ? dayjs(e.target.value).format("YYYY-MM-DD")
                      : "",
                  }));
                }}
              />
            </div>
            <div></div>
            <div className="col-span-1">
              <div className="text-sm text-gray-500">Start Time</div>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    start_time: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-span-1">
              <div className="text-sm text-gray-500">End Time</div>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    end_time: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-span-3">
              <div className="text-sm text-gray-500">Notes</div>
              <Textarea
                rows={5}
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
