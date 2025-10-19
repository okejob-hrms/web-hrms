import * as React from "react";
import { useCompanyBranchForm } from "../hook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const AttendenceLocationModal = React.memo(
  function AttendenceLocationModal() {
    const {
      openAttendenceModal,
      setOpenAttendenceModal,
      handleOpenAttendenceModal,
    } = useCompanyBranchForm();
    return (
      <Dialog
        open={openAttendenceModal}
        onOpenChange={handleOpenAttendenceModal}
      >
        <DialogTrigger asChild>
          <Button className="w-fit" variant="outline">
            <Image
              src="/icons/Location.svg"
              alt="location"
              width={18}
              height={18}
            />{" "}
            Select Location
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Set Attendance Location</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  },
);
