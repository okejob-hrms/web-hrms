"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";
import dayjs from "dayjs";
import { CircleX, ClockCheck } from "lucide-react";

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
  onApprove: () => void;
  onReject: () => void;
}

export default function BusinessTripDetailModal({
  isOpen,
  onClose,
  data,
  loading,
  onApprove,
  onReject,
}: Props) {
  const locale = resolveLocale(useLocale());
  const renderStatus = (status?: number) => {
    const { variant, className, key } = getStatusBusinessTrip(status);
    return (
      <StatusBadge statusKey={key} variant={variant} className={className} />
    );
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReject();
  };

  const isWaiting = data?.status === 0;

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
          <>
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-18 w-18">
                <AvatarImage src={data.user?.photo_profile_url ?? ""} />
                <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                  {stringAvatar(data.user?.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center">
                <div className="font-medium">
                  <span>{data.user?.name}</span>{" "}
                  {data.user?.employee_code && (
                    <span className="text-text-disabled">
                      ({data.user.employee_code})
                    </span>
                  )}
                </div>
                <div className="font-medium text-grayscale-100 text-sm">
                  <span>{data.user?.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 space-y-2 mb-2">
              <div>
                <div className="text-sm text-gray-500">Business Trip ID</div>
                <div>#{data.id}</div>
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
                <div className="text-sm text-gray-500">Status</div>
                <div>{renderStatus(data.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Approved At</div>
                <div>
                  {data.approved_at
                    ? dayjs(data.approved_at).format("MMMM D, YYYY HH:mm")
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
                <div className="text-sm text-gray-500">Approver</div>
                {data.approver ? (
                  <div className="flex items-center gap-2 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={data.approver.photo_profile_url ?? ""}
                      />
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
          </>
        )}

        <AlertDialogFooter className="grid grid-cols-4 justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 text-primary border-0 justify-start bg-white hover:bg-white rounded-md py-2 font-medium col-span-2"
          >
            Cancel
          </AlertDialogCancel>
          {isWaiting && (
            <>
              <AlertDialogCancel
                onClick={handleReject}
                className="flex-1 bg-white text-red-500 hover:text-red-500 hover:opacity-50 rounded-md py-2 font-medium border-red-500 px-4"
              >
                <CircleX />
                Reject
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="flex-1 bg-primary text-white rounded-md py-2 font-medium px-5"
              >
                <ClockCheck />
                Approve
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
