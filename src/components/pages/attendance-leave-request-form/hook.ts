/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "@/hooks/use-debounce";
import { ApiErrorResponse } from "@/lib/types";
import { getEmployees } from "@/services/employees";
import { createLeave, getUserLeaveBalance } from "@/services/employees/leave";
import { getLeaveTypes } from "@/services/employees/leave-types";
import { IMutateLeaveRequest } from "@/services/employees/leave/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export const CreateLeaveRequestSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  leave_type_id: z.number().min(1, "Leave type ID is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  attachment: z.string().min(1, "Attachment is required"),
  approvers: z
    .array(
      z.object({
        id: z.number(),
      }),
    )
    .min(1, "Approver is required"),
});

export type ICreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;

// export const defaultCreateLeaveRequest: ICreateLeaveRequest = {
//   user_id: 0,
//   leave_type_id: 0,
//   start_date: "",
//   end_date: "",
//   reason: "",
//   attachment: "",
//   approvers: [],
// };

export const useLeaveRequestForm = () => {
  const form = useForm<z.infer<typeof CreateLeaveRequestSchema>>({
    resolver: zodResolver(CreateLeaveRequestSchema),
    // defaultValues: defaultCreateLeaveRequest,
  });
  const router = useRouter();
  const [searchApprover, setSearchApprover] = React.useState("");
  const debouncedApprover = useDebounce(searchApprover, 300);
  const queryClient = useQueryClient();
  const selectedUserId = form.watch("user_id");

  const { data: leaveBalance, error: leaveBalanceError } = useQuery({
    queryKey: ["leave-balance", selectedUserId],
    queryFn: () => getUserLeaveBalance(Number(selectedUserId)),
    enabled:
      !!selectedUserId &&
      selectedUserId !== "" &&
      !isNaN(Number(selectedUserId)),
    retry: false,
  });

  React.useEffect(() => {
    if (leaveBalanceError) {
      const error = leaveBalanceError as any;
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to fetch leave balance");
            })
            .catch(() => {
              toast.error("Failed to fetch leave balance");
            });
        } catch {
          toast.error("Failed to fetch leave balance");
        }
      } else {
        toast.error(error.message || "Failed to fetch leave balance");
      }
    }
  }, [leaveBalanceError]);

  const { data: leaveTypes } = useQuery({
    queryKey: ["leave-types"],
    queryFn: () => getLeaveTypes(),
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

  const leaveTypeOptions = React.useMemo(() => {
    if (leaveTypes?.data.data) {
      return leaveTypes?.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [leaveTypes?.data]);

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

  const { mutate: createLeaveMutation, isPending: isPendingCreateLeave } =
    useMutation({
      mutationFn: (params: IMutateLeaveRequest) => createLeave(params),
      onSuccess: () => {
        toast.success("Create leave successfully!");
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        router.push("/");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                if (errorData.errors) {
                  Object.entries(errorData.errors).forEach(
                    ([fieldName, messages]) => {
                      form.setError(fieldName as any, {
                        type: "server",
                        message: messages[0],
                      });
                    },
                  );
                }
                toast.error(errorData.message || "Failed to create leave");
              })
              .catch(() => {
                toast.error("Failed to create leave: Server error");
              });
          } catch (parseError) {
            toast.error("Failed to create leave: Server error");
          }
        } else {
          toast.error(
            `Failed to create leave: ${error.message || "Unknown error"}`,
          );
        }
      },
    });

  const handleCancel = () => {
    router.push("/attendance/leave-request");
  };

  const onSubmit = (data: ICreateLeaveRequest) => {
    const requestPayload: IMutateLeaveRequest = {
      user_id: Number(data.user_id),
      leave_type_id: data.leave_type_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
      attachment: data.attachment,
      approvers: data.approvers.map((approver) => ({
        id: approver.id,
      })),
    };

    createLeaveMutation(requestPayload);
  };

  return {
    form,
    isLoadingEmployees,
    searchApprover,
    setSearchApprover,
    employeesOptions,
    leaveTypeOptions,
    createLeaveMutation,
    isPendingCreateLeave,
    handleCancel,
    onSubmit,
    leaveBalance,
  };
};
