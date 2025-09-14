"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

export const InitiateOffboardingEmployee = React.memo(
  function InitiateOffboardingEmployee() {
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
              <Button variant="default">
                <Plus /> New Offboarding Process
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>New Offboarding Process</DialogTitle>
                <DialogDescription>
                  Select an employee to begin the offboarding procedure and
                  manage their exit smoothly
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <InputForm name="name" label="Employee Name" required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-secondary">
                    Assigned Approver<span className="text-error">*</span>
                  </label>
                  <MultiSelectForm
                    options={employeesOptions}
                    name="assigned_approver"
                    maxCount={3}
                    searchPlaceholder="Search Employee"
                    hideSelectAll
                    disabled={isLoadingEmployees}
                    valueTransformer={(value) => Number(value)}
                    searchValue={searchApprover}
                    onSearchChange={setSearchApprover}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <DatePicker
                    name="resign_date"
                    label="Effective Resignation Date"
                  />
                  <DatePicker name="last_date" label="Last Working Date" />
                </div>
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
  },
);
