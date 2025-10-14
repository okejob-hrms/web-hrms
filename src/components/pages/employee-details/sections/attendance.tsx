import * as React from "react";
import { AttendanceTrackerList } from "../../attendance-tracker-list";
import { IEmployeeDetailsResponse } from "@/services/employees/types";

interface AttendanceDetailProps {
  data: IEmployeeDetailsResponse;
}

export const AttendanceDetail = React.memo(function AttendanceDetail({
  data,
}: AttendanceDetailProps) {
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <AttendanceTrackerList hidePannel relativeUser={data.user.name} />
    </div>
  );
});
