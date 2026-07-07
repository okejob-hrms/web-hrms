"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";
import dayjs from "dayjs";
import { CircleX } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDateRange,
  formatDayDifference,
  getStatusBusinessTrip,
} from "@/lib/helpers";
import { stringAvatar } from "@/lib/utils";
import { IBusinessTripResponse } from "@/services/business-trips/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: IBusinessTripResponse;
  loading?: boolean;
  onCancel: () => void;
}

export default function EssBusinessTripDetailModal({
  isOpen,
  onClose,
  data,
  loading,
  onCancel,
}: Props) {
  const locale = resolveLocale(useLocale());
  const renderStatus = (status?: number) => {
    const { variant, className, key } = getStatusBusinessTrip(status);
    return (
      <StatusBadge statusKey={key} variant={variant} className={className} />
    );
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const isWaiting = data?.status === 0;
  const isRejected = data?.status === 2;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md min-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-lg text-left font-semibold text-black mb-2">
            Business Trip Details
          </AlertDialogTitle>
        </AlertDialogHeader>

        {loading || !data ? (
          <div className="flex flex-col gap-4 py-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-2">
            <div>
              <div className="text-sm text-gray-500">Trip ID</div>
              <div>#{data.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div>{renderStatus(data.status)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Destination</div>
              <div>{data.destination || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div>
                <span className="text-base">
                  {formatDateRange(data.start_date, data.end_date, locale)}
                </span>{" "}
                <span className="text-base text-text-disabled">
                  ({formatDayDifference(data.start_date, data.end_date, locale)})
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {isRejected ? "Rejected At" : "Approved At"}
              </div>
              <div>
                {data.approved_at
                  ? dayjs(data.approved_at).format("MMMM D, YYYY HH:mm")
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Submitted At</div>
              <div>
                {data.created_at
                  ? dayjs(data.created_at).format("MMMM D, YYYY HH:mm")
                  : "-"}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Reason</div>
              <div>{data.reason || "-"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Notes</div>
              <div>{data.notes || "-"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">
                {isRejected ? "Rejector" : "Approver"}
              </div>
              {data.approver ? (
                <div className="flex items-center gap-2 py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={data.approver.photo_profile_url ?? ""} />
                    <AvatarFallback className="text-primary-hover bg-primary-background text-xs font-medium">
                      {stringAvatar(data.approver.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {data.approver.name}
                    </span>
                    <span className="text-xs text-text-disabled">
                      {data.approver.email}
                    </span>
                  </div>
                </div>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter className="grid grid-cols-3 justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 text-primary border-0 justify-start bg-white hover:bg-white rounded-md py-2 font-medium col-span-2"
          >
            Close
          </AlertDialogCancel>
          {isWaiting && (
            <AlertDialogCancel
              onClick={handleCancel}
              className="flex-1 bg-white text-red-500 hover:text-red-500 hover:opacity-50 rounded-md py-2 font-medium border-red-500 px-4"
            >
              <CircleX />
              Cancel Request
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
