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
import { getEmployees } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

export const InterviewScheduleForm = React.memo(
  function InterviewScheduleForm() {
    return (
      <div className="grid items-start w-full gap-4">
        <Alert className="flex items-center border border-primary-border bg-primary-background">
          <div>
            <AlertTitle className="text-primary font-semibold text-lg">
              Set Up Exit Interview Schedule
            </AlertTitle>
            <AlertDescription>
              You haven’t scheduled this exit interview yet. Please complete the
              meeting details so the employee and other participants can join.
            </AlertDescription>
          </div>
          <ModalForm />
        </Alert>
      </div>
    );
  },
);

export const ModalForm = React.memo(function InitiateOffboardingEmployee() {
  const form = useForm();
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

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [employees?.data]);
  return (
    <Dialog>
      <Form {...form}>
        <form>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Calendar />
              Set Interview Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Set Interview Schedule</DialogTitle>
            </DialogHeader>
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <DatePicker name="date" label="Date" />
              <div className="grid grid-cols-2 gap-2">
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="start_time"
                  label="Time"
                  required
                />
                <InputForm
                  icon={<Clock />}
                  iconPosition="right"
                  name="end_time"
                  label="Time"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-text-secondary">
                  Participant<span className="text-error">*</span>
                </label>
                <MultiSelectForm
                  options={employeesOptions}
                  name="participant"
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
});
