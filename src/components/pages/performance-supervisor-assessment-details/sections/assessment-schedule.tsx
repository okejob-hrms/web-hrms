import { Button } from "@/components/ui/button";
import { getInterviewSchedule } from "@/services/employees/offboardings/interview-schedule";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import * as React from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeDetailByUserId } from "@/services/employees";
import { AssessmentScheduleForm } from "./assessment-schedule-form";

dayjs.extend(customParseFormat);

interface Props {
  id: number;
}

const EmployeeProfile = React.memo(function EmployeeProfile({
  userId,
}: {
  userId: number;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee-detail", userId],
    queryFn: () => getEmployeeDetailByUserId(userId),
  });

  if (isLoading) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (isError || !data?.data?.user?.name) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex gap-1 items-center min-w-0">
      <Avatar className="h-5 w-5 flex-shrink-0">
        <AvatarImage
          className="size-5"
          src={`${process.env.NEXT_PUBLIC_FILE_URL}/${data.data.photo_profile}`}
          alt={data.data.user.name}
        />
        <AvatarFallback className="text-[10px] font-medium">
          {stringAvatar(data.data.user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
        <span className="text-black truncate text-sm sm:text-base">
          {data.data.user.name}
        </span>
        <span className="text-text-disabled text-xs sm:text-sm truncate">
          ({data.data.user.id}) {data.data.employment.job_position.name}
        </span>
      </div>
    </div>
  );
});

export const AssessmentSchedule = React.memo(function AssessmentSchedule({
  id,
}: Props) {
  const [openForm, setOpenForm] = React.useState(false);
  const { data } = useQuery({
    queryKey: ["assessment-schedule"],
    queryFn: () => getInterviewSchedule(id),
  });

  const handleEditClick = () => {
    setOpenForm(true);
  };

  const handleCancelEdit = () => {
    setOpenForm(false);
  };

  return (
    <>
      {data && data?.data ? (
        <div className="border border-grayscale-20 rounded-sm p-4 w-full">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-black">
              Interview Schedule
            </h3>
            <Button variant="outline" type="button" onClick={handleEditClick}>
              <Image
                src="/icons/editBlue.svg"
                width={20}
                height={20}
                alt="edit"
              />
              Edit Interview Schedule
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-text-disabled text-sm">Date</span>
              <span className="text-black text-base">
                {dayjs(data.data.date).format("MMMM D, YYYY")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-disabled text-sm">Time</span>
              <span className="text-black text-base">
                {dayjs(data.data.start_time, "HH:mm:ss").format("HH:mm A")} -{" "}
                {dayjs(data.data.end_time, "HH:mm:ss").format("HH:mm A")}
              </span>
            </div>
            <div className="flex flex-col gap-2 col-start-1 col-end-3">
              <span className="text-text-disabled text-sm">Participant</span>
              {data.data.participants
                ? data.data.participants.map((item) => (
                    <div key={item.user_id} className="block ml-4">
                      <EmployeeProfile userId={item.user_id} />
                    </div>
                  ))
                : "-"}
            </div>
            <div className="flex flex-col gap-1 col-start-1 col-end-3">
              <span className="text-text-disabled text-sm">Notes</span>
              <span className="text-black text-base">
                {data.data.notes ?? "-"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <AssessmentScheduleForm
          id={id}
          onCancelEdit={handleCancelEdit}
          open={openForm}
          setOpen={setOpenForm}
        />
      )}

      {data && data?.data && (
        <div className="hidden">
          <AssessmentScheduleForm
            id={id}
            isEditMode={true}
            existingData={data.data}
            onCancelEdit={handleCancelEdit}
            open={openForm}
            setOpen={setOpenForm}
          />
        </div>
      )}
    </>
  );
});
