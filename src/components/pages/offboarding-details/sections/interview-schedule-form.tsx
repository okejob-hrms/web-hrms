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
import { TextAreaForm } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
      <Alert className="flex items-center border border-primary-border bg-primary-background">
        <div>
          <AlertTitle className="text-primary font-semibold text-lg">
            Set Up Exit Interview Schedule
          </AlertTitle>
          <AlertDescription>
            You haven&apos;t scheduled this exit interview yet. Please complete
            the meeting details so the employee and other participants can join.
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

export const ModalForm = React.memo(function ModalForm({
  offboarding_id,
  existingData,
  onCancelEdit,
  open,
  setOpen,
}: ModalFormProps) {
  const isEditMode = !!existingData;

  const defaultValues: IInterviewScheduleRequest = {
    date: existingData?.date || "",
    start_time: existingData?.start_time || "",
    end_time: existingData?.end_time || "",
    participants:
      existingData?.participants.map((participant) => ({
        user_id: participant.user_id,
      })) || [],
    notes: existingData?.notes || "",
  };

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
  }, [existingData, open, form]);

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
        `Schedule ${isEditMode ? "updated" : "created"} successfully`,
      );
      form.reset();
      setOpen(false);
      if (onCancelEdit) {
        onCancelEdit();
      }
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message ||
                  `Failed to ${isEditMode ? "update" : "create"} schedule`,
              );
            })
            .catch(() => {
              toast.error(
                `Failed to ${isEditMode ? "update" : "create"} schedule: Server error`,
              );
            });
        } catch (parseError) {
          toast.error(
            `Failed to ${isEditMode ? "update" : "create"} schedule: Server error : ${parseError}`,
          );
        }
      } else {
        toast.error(
          `Failed to ${isEditMode ? "update" : "create"} schedule: ${error.message || "Unknown error"}`,
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
            Set Interview Schedule
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
                  ? "Edit Interview Schedule"
                  : "Set Interview Schedule"}
              </DialogTitle>
            </DialogHeader>
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <DatePicker name="date" label="Date" />
              <div className="grid grid-cols-2 gap-2">
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="start_time"
                  label="Start Time"
                  required
                />
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="end_time"
                  label="End Time"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-text-secondary">
                  Participant<span className="text-error">*</span>
                </label>
                <MultiSelectForm
                  options={employeesOptions}
                  name="participants"
                  maxCount={3}
                  searchPlaceholder="Search Employee"
                  hideSelectAll
                  disabled={isLoadingEmployees}
                  valueTransformer={(value) => Number(value)}
                  searchValue={searchApprover}
                  onSearchChange={setSearchApprover}
                />
              </div>
              <TextAreaForm name="notes" label="Notes" className="col-span-2" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
