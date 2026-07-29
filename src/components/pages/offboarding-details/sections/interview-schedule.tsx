import { Button } from "@/components/ui/button";
import { getInterviewSchedule } from "@/services/employees/offboardings/interview-schedule";
import { IInterviewScheduleParticipant } from "@/services/employees/offboardings/interview-schedule/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import * as React from "react";
import { InterviewScheduleForm } from "./interview-schedule-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";

dayjs.extend(customParseFormat);

interface Props {
  offboarding_id: number;
  readOnly?: boolean;
}

const ParticipantProfile = React.memo(function ParticipantProfile({
  participant,
}: {
  participant: IInterviewScheduleParticipant;
}) {
  if (!participant.name) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex gap-1 items-center min-w-0">
      <Avatar className="h-5 w-5 flex-shrink-0">
        <AvatarImage
          className="size-5"
          src={
            participant.photo_profile
              ? `${process.env.NEXT_PUBLIC_FILE_URL}/${participant.photo_profile}`
              : undefined
          }
          alt={participant.name}
        />
        <AvatarFallback className="text-[10px] font-medium">
          {stringAvatar(participant.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
        <span className="text-black truncate text-sm sm:text-base">
          {participant.name}
        </span>
        {(participant.employee_code || participant.job_position) && (
          <span className="text-text-disabled text-xs sm:text-sm truncate">
            {participant.employee_code ? `(${participant.employee_code})` : ""}
            {participant.job_position
              ? `${participant.employee_code ? " " : ""}${participant.job_position}`
              : ""}
          </span>
        )}
      </div>
    </div>
  );
});

export const InterviewSchedule = React.memo(function InterviewSchedule({
  offboarding_id,
  readOnly = false,
}: Props) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const [openForm, setOpenForm] = React.useState(false);
  const { data } = useQuery({
    queryKey: ["interview-schedule", offboarding_id],
    queryFn: () => getInterviewSchedule(offboarding_id),
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
              {t("tabInterviewSchedule")}
            </h3>
            {!readOnly && (
              <Button variant="outline" type="button" onClick={handleEditClick}>
                <Image
                  src="/icons/editBlue.svg"
                  width={20}
                  height={20}
                  alt={tCommon("edit")}
                />
                {t("editInterviewSchedule")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-text-disabled text-sm">{tCommon("date")}</span>
              <span className="text-black text-base">
                {dayjs(data.data.date).locale(locale).format("MMMM D, YYYY")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-disabled text-sm">{t("time")}</span>
              <span className="text-black text-base">
                {dayjs(data.data.start_time, "HH:mm:ss").format("HH:mm A")} -{" "}
                {dayjs(data.data.end_time, "HH:mm:ss").format("HH:mm A")}
              </span>
            </div>
            <div className="flex flex-col gap-2 col-start-1 col-end-3">
              <span className="text-text-disabled text-sm">{t("participant")}</span>
              {data.data.participants?.length
                ? data.data.participants.map((item) => (
                    <div key={item.user_id} className="block ml-4">
                      <ParticipantProfile participant={item} />
                    </div>
                  ))
                : "-"}
            </div>
            <div className="flex flex-col gap-1 col-start-1 col-end-3">
              <span className="text-text-disabled text-sm">{tCommon("notes")}</span>
              {data.data.notes ? (
                <div dangerouslySetInnerHTML={{ __html: data.data.notes }} />
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>
      ) : readOnly ? (
        <div className="border border-grayscale-20 rounded-sm p-4 w-full text-sm text-text-secondary">
          {t("noInterviewSchedule")}
        </div>
      ) : (
        <InterviewScheduleForm
          offboarding_id={offboarding_id}
          onCancelEdit={handleCancelEdit}
          open={openForm}
          setOpen={setOpenForm}
        />
      )}

      {data && data?.data && !readOnly && (
        <div className="hidden">
          <InterviewScheduleForm
            offboarding_id={offboarding_id}
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
