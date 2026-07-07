/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { useDebounce } from "@/hooks/use-debounce";
import { ApiErrorResponse } from "@/lib/types";
import { getEmployees } from "@/services/employees";
import {
  postInterviewSchedule,
  putInterviewSchedule,
} from "@/services/employees/offboardings/interview-schedule";
import {
  IInterviewScheduleRequest,
  IInterviewScheduleResponse,
} from "@/services/employees/offboardings/interview-schedule/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Calendar, Clock } from "lucide-react";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useTranslations } from "next-intl";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface InterviewScheduleFormProps {
  offboarding_id: number;
  isEditMode?: boolean;
  existingData?: IInterviewScheduleResponse;
  onCancelEdit?: () => void;
  open: boolean;
  setOpen: any;
}

export const InterviewScheduleForm = React.memo(function InterviewScheduleForm({
  offboarding_id,
  isEditMode = false,
  existingData,
  onCancelEdit,
  open,
  setOpen,
}: InterviewScheduleFormProps) {
  const t = useTranslations("offboarding");

  if (isEditMode) {
    return (
      <ModalForm
        offboarding_id={offboarding_id}
        existingData={existingData}
        onCancelEdit={onCancelEdit}
        open={open}
        setOpen={setOpen}
      />
    );
  }

  return (
    <div className="grid items-start w-full gap-4">
      <Alert className="flex flex-col md:flex-row items-center border border-primary-border bg-primary-background">
        <div>
          <AlertTitle className="text-primary font-semibold text-lg">
            {t("setupInterviewScheduleTitle")}
          </AlertTitle>
          <AlertDescription>
            {t("setupInterviewScheduleDesc")}
          </AlertDescription>
        </div>
        <ModalForm
          offboarding_id={offboarding_id}
          open={open}
          setOpen={setOpen}
        />
      </Alert>
    </div>
  );
});

interface ModalFormProps {
  offboarding_id: number;
  existingData?: IInterviewScheduleResponse;
  onCancelEdit?: () => void;
  open: boolean;
  setOpen: any;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "indent",
  "link",
];

export const ModalForm = React.memo(function ModalForm({
  offboarding_id,
  existingData,
  onCancelEdit,
  open,
  setOpen,
}: ModalFormProps) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const tEmployee = useTranslations("employee");
  const isEditMode = !!existingData;

  const getDefaultValues = () => {
    if (existingData) {
      return {
        date: existingData.date || "",
        start_time:
          dayjs(existingData.start_time, "HH:mm:ss").format("HH:mm") || "",
        end_time:
          dayjs(existingData.end_time, "HH:mm:ss").format("HH:mm") || "",
        participants:
          existingData.participants?.map((participant) => ({
            user_id: participant.user_id,
          })) || [],
        notes: existingData.notes || "",
      };
    }

    return {
      date: "",
      start_time: "",
      end_time: "",
      participants: [],
      notes: "",
    };
  };

  const form = useForm<IInterviewScheduleRequest>({
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    if (open) {
      const values = getDefaultValues();
      form.reset(values);
    }
  }, [existingData, open]);

  const queryClient = useQueryClient();
  const [searchApprover, setSearchApprover] = React.useState("");
  const debouncedApprover = useDebounce(searchApprover, 300);
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["offboarding-employees", debouncedApprover],
    queryFn: () =>
      getEmployees(debouncedApprover ? { search: debouncedApprover } : {}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (data: IInterviewScheduleRequest) =>
      isEditMode
        ? putInterviewSchedule(offboarding_id, data)
        : postInterviewSchedule(offboarding_id, data),
    onSuccess: () => {
      toast.success(
        isEditMode ? t("scheduleUpdatedSuccess") : t("scheduleCreatedSuccess"),
      );
      form.reset();
      setOpen(false);
      if (onCancelEdit) {
        onCancelEdit();
      }
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
    },
    onError: (error: any) => {
      const action = isEditMode ? t("scheduleUpdateFailed") : t("scheduleCreateFailed");
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || action);
            })
            .catch(() => {
              toast.error(
                t("scheduleServerError", {
                  action: isEditMode ? "update" : "create",
                }),
              );
            });
        } catch (parseError) {
          toast.error(
            `${action}: ${t("serverError")} : ${parseError}`,
          );
        }
      } else {
        toast.error(
          `${action}: ${error.message || t("unknownError")}`,
        );
      }
    },
  });

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [employees?.data]);

  const handleSubmit = (values: any) => {
    const submitData = {
      ...values,
      participants: Array.isArray(values.participants)
        ? values.participants.map((p: any) => {
            if (typeof p === "object" && p !== null) {
              return { user_id: p.user_id };
            }
            return { user_id: Number(p) };
          })
        : [],
    };

    mutation.mutate(submitData);
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="w-fit">
            <Calendar />
            {t("setInterviewSchedule")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>
                {isEditMode
                  ? t("editInterviewSchedule")
                  : t("setInterviewSchedule")}
              </DialogTitle>
            </DialogHeader>
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <DatePicker name="date" label={tCommon("date")} />
              <div className="grid grid-cols-2 gap-2">
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="start_time"
                  label={t("startTime")}
                  required
                />
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="end_time"
                  label={t("endTime")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-text-secondary">
                  {t("participant")}<span className="text-error">*</span>
                </label>
                <MultiSelectForm
                  options={employeesOptions}
                  name="participants"
                  maxCount={3}
                  searchPlaceholder={tEmployee("searchEmployee")}
                  hideSelectAll
                  disabled={isLoadingEmployees}
                  valueTransformer={(value) => Number(value)}
                  searchValue={searchApprover}
                  onSearchChange={setSearchApprover}
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm text-text-secondary">{tCommon("notes")}</label>
                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder={t("writeNotesPlaceholder")}
                        className="bg-white rounded-md border border-input"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? tCommon("saving")
                  : isEditMode
                    ? tCommon("saveChanges")
                    : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
