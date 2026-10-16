import * as React from "react";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { RecentAttendanceTable } from "./recent-attendance-table";

interface AttendanceDetailProps {
  data: IEmployeeDetailsResponse;
}

export const AttendanceDetail = React.memo(function AttendanceDetail({
  data,
}: AttendanceDetailProps) {
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <RecentAttendanceTable userId={data.user_id} />
    </div>
  );
});
