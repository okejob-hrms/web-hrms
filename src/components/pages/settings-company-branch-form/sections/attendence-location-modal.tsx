/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getLocationName } from "@/lib/geocode";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("@/components/ui/map"), { ssr: false });

interface AttendenceLocationModalProps {
  openAttendenceModal: boolean;
  setOpenAttendenceModal: (open: boolean) => void;
  handleOpenAttendenceModal: (open: boolean) => void;
  selectedMap: { lat: number; lng: number };
  setSelectedMap: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number }>
  >;
  handleSetMap: () => void;
  loading: boolean;
  defaultMap: { lat: number; lng: number };
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
}

export const AttendenceLocationModal = React.memo(
  function AttendenceLocationModal({
    openAttendenceModal,
    setOpenAttendenceModal,
    handleOpenAttendenceModal,
    selectedMap,
    setSelectedMap,
    handleSetMap,
    loading,
    defaultMap,
    location,
    setLocation,
  }: AttendenceLocationModalProps) {
    React.useEffect(() => {
      if (!selectedMap.lat || !selectedMap.lat) {
        setLocation("Unknown");
        return;
      }

      if (
        selectedMap.lat !== defaultMap.lat &&
        selectedMap.lng !== defaultMap.lng
      ) {
        getLocationName(selectedMap.lat, selectedMap.lng).then((name) => {
          setLocation(name);
        });
      }
    }, [selectedMap.lat, selectedMap.lng]);

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
          <div>
            <p className="text-text-secondary text-sm">Selected Location</p>
            <p className="text-base">{location}</p>
          </div>
          <div className="flex flex-col items-center justify-center mb-4">
            <MapPicker location={selectedMap} setLocation={setSelectedMap} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenAttendenceModal(false)}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSetMap()}
              className="min-w-[100px]"
              isLoading={loading}
            >
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
