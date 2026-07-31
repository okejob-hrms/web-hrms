/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { MultiSelectForm } from "@/components/ui/multi-select";
import { SelectEmployeeForm, SelectForm } from "@/components/ui/select-form";
import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { createInitiateOffboarding } from "@/services/employees/offboardings";
import {
  IMutateOffboardingRequests,
  MutateOffboardingRequestsSchema,
} from "@/services/employees/offboardings/types";
import { getAllForm } from "@/services/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Can } from "@/components/auth/can";
import { HTTPError } from "ky";

/** Must match Form::TYPE_EXIT_INTERVIEW on the backend. */
const EXIT_INTERVIEW_FORM_TYPE = 1;

export const InitiateOffboardingEmployee = React.memo(
  function InitiateOffboardingEmployee() {
    const t = useTranslations("offboarding");
    const tCommon = useTranslations("common");
    const tEmployee = useTranslations("employee");
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchApprover, setSearchApprover] = React.useState("");
    const debouncedApprover = useDebounce(searchApprover, 300);
    const queryClient = useQueryClient();

    const form = useForm<IMutateOffboardingRequests>({
      resolver: zodResolver(MutateOffboardingRequestsSchema),
      defaultValues: {
        user_id: 0,
        approvers: [],
        form_id: undefined as unknown as number,
        effective_resignation_date: "",
        last_working_date: "",
      },
    });

    const { data: employees, isLoading: isLoadingEmployees } = useQuery({
      queryKey: ["offboarding-employees", debouncedApprover],
      queryFn: () =>
        getEmployees(
          debouncedApprover
            ? { search: debouncedApprover, per_page: 10000 }
            : { per_page: 10000 },
        ),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const { data: forms } = useQuery({
      queryKey: ["forms", "exit-interview"],
      queryFn: () => getAllForm({ type: EXIT_INTERVIEW_FORM_TYPE }),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const formOptions = React.useMemo(() => {
      if (forms?.data) {
        return forms.data.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [forms?.data]);

    const employeesOptions = React.useMemo(() => {
      if (employees?.data?.data) {
        return employees.data.data.map((item) => ({
          label: item.name,
          value: item.user_id.toString(),
          subtitle: item.job_position,
          image: item.photo_profile,
        }));
      }
      return [];
    }, [employees?.data]);

    const mutation = useMutation({
      mutationFn: (params: IMutateOffboardingRequests) =>
        createInitiateOffboarding(params),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["offboardings"] });
        toast.success(t("initiateSuccess"));
        form.reset();
        setIsOpen(false);
      },
      onError: async (error: unknown) => {
        console.error("Mutation error:", error);
        if (error instanceof HTTPError) {
          try {
            const errorData = (await error.response.json()) as {
              message?: string;
              errors?: Record<string, string[]>;
            };
            const firstFieldError = errorData.errors
              ? Object.values(errorData.errors).flat()[0]
              : undefined;
            toast.error(
              firstFieldError || errorData.message || t("initiateFailed"),
            );
            return;
          } catch {
            // fall through
          }
        }
        toast.error(
          error instanceof Error && error.message
            ? `${t("initiateFailed")}: ${error.message}`
            : t("initiateFailed"),
        );
      },
    });

    const onSubmit = React.useCallback(
      (values: IMutateOffboardingRequests) => {
        mutation.mutate({
          user_id: Number(values.user_id),
          form_id: Number(values.form_id),
          approvers: values.approvers.map(Number),
          effective_resignation_date: dayjs(
            values.effective_resignation_date,
          ).format("YYYY-MM-DD"),
          last_working_date: dayjs(values.last_working_date).format(
            "YYYY-MM-DD",
          ),
        });
      },
      [mutation],
    );

    const handleDialogOpenChange = React.useCallback(
      (open: boolean) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
          setSearchApprover("");
        }
      },
      [form],
    );

    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <Can permission="employee_organization.offboarding.create">
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              {t("newOffboardingProcess")}
            </Button>
          </DialogTrigger>
        </Can>

        <DialogContent className="bg-white md:min-w-5xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("newOffboardingProcess")}</DialogTitle>
            <DialogDescription>
              {t("newOffboardingProcessDesc")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <SelectEmployeeForm
                name="user_id"
                label={t("employeeName")}
                required
                options={employeesOptions}
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("assignedApprover")}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <MultiSelectForm
                  options={employeesOptions}
                  name="approvers"
                  maxCount={3}
                  searchPlaceholder={tEmployee("searchEmployee")}
                  hideSelectAll
                  disabled={isLoadingEmployees}
                  valueTransformer={(value) => Number(value)}
                  searchValue={searchApprover}
                  onSearchChange={setSearchApprover}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  name="effective_resignation_date"
                  label={t("effectiveResignationDate")}
                />
                <DatePicker
                  name="last_working_date"
                  label={tEmployee("lastWorkingDate")}
                />
              </div>

              <SelectForm
                name="form_id"
                label={t("exitInterviewForm")}
                required
                options={formOptions}
              />

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={mutation.isPending}
                  >
                    {tCommon("cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="min-w-[100px]"
                >
                  {mutation.isPending ? tCommon("saving") : tCommon("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
