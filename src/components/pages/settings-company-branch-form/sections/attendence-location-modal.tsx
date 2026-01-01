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
import {
  getLocationName,
  searchLocation,
  LocationSearchResult,
} from "@/lib/geocode";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<
      LocationSearchResult[]
    >([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const [flyTo, setFlyTo] = React.useState<{
      lat: number;
      lng: number;
    } | null>(null);
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const searchContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        const results = await searchLocation(searchQuery);
        setSearchResults(results);
        setShowResults(results.length > 0);
        setIsSearching(false);
      }, 500);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [searchQuery]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          searchContainerRef.current &&
          !searchContainerRef.current.contains(event.target as Node)
        ) {
          setShowResults(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleSelectLocation = (result: LocationSearchResult) => {
      const newLocation = { lat: result.lat, lng: result.lng };
      setSelectedMap(newLocation);
      setFlyTo(newLocation);
      setLocation(result.display_name);
      setSearchQuery("");
      setShowResults(false);
    };

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

    React.useEffect(() => {
      if (flyTo) {
        const timer = setTimeout(() => setFlyTo(null), 2000);
        return () => clearTimeout(timer);
      }
    }, [flyTo]);

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

          <div ref={searchContainerRef} className="relative">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              icon={
                isSearching ? (
                  <Loader2 className="size-5 text-grayscale-20 animate-spin" />
                ) : (
                  <Search className="size-5 text-grayscale-20" />
                )
              }
              iconPosition="right"
              className="w-full"
            />

            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleSelectLocation(result)}
                  >
                    <span className="line-clamp-2">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-text-secondary text-sm">Selected Location</p>
            <p className="text-base">{location}</p>
          </div>
          <div className="flex flex-col items-center justify-center mb-4">
            <MapPicker
              location={selectedMap}
              setLocation={setSelectedMap}
              flyTo={flyTo}
            />
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
