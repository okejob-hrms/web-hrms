import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import * as React from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { AssessmentScheduleForm } from "./assessment-schedule-form";
import { getScheduleDetail } from "@/services/performances/supervisor-assessment";

dayjs.extend(customParseFormat);

interface Props {
  id: number;
}

interface IParticipant {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employee_id: number;
  employee_code: string;
  avatar_url: string | null;
}

const EmployeeProfile = React.memo(function EmployeeProfile({
  data,
}: {
  data: IParticipant;
}) {
  return (
    <div className="flex gap-1 items-center min-w-0">
      <Avatar className="h-5 w-5 flex-shrink-0">
        <AvatarImage
          className="size-5"
          src={`${process.env.NEXT_PUBLIC_FILE_URL}/${data.avatar_url}`}
          alt={data.name}
        />
        <AvatarFallback className="text-[10px] font-medium">
          {stringAvatar(data.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
        <span className="text-black truncate text-sm sm:text-base">
          {data.name}
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
    queryFn: () => getScheduleDetail(id),
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
                    <div key={item.employee_id} className="block ml-4">
                      <EmployeeProfile data={item} />
                    </div>
                  ))
                : "-"}
            </div>
            <div className="flex flex-col gap-1 col-start-1 col-end-3">
              <span className="text-text-disabled text-sm">Notes</span>
              {data.data.notes ? (
                <div dangerouslySetInnerHTML={{ __html: data.data.notes }} />
              ) : (
                "-"
              )}
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
