/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "@/hooks/use-debounce";
import { ApiErrorResponse } from "@/lib/types";
import { getEmployees } from "@/services/employees";
import {
  createLeave,
  createLeaveEmployee,
  getDetailLeave,
  getUserLeaveBalance,
  updateLeave,
} from "@/services/employees/leave";
import { getLeaveTypes } from "@/services/employees/leave-types";
import { IMutateLeaveRequest } from "@/services/employees/leave/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


export const useLeaveRequestForm = (isEmployee?: boolean) => {
  const CreateLeaveRequestSchema = z.object({
    user_id: isEmployee ? z.string().optional() : z.string().min(1, "Employee name is required"),
    leave_type_id: z.string().min(1, "Leave type is required"),
    start_date: z.union([z.date(), z.string().min(1, "Start date is required")]),
    end_date: z.union([z.date(), z.string().min(1, "End date is required")]),
    reason: z.string().min(1, "Reason is required"),
    attachments: z
      .array(
        z.object({
          type: z.string(),
        }),
      )
      .optional(),
    approvers: isEmployee 
      ? z.array(
        z.object({
          id: z.number(),
          user_id: z.number(),
        }),
      ).optional()
      : z.array(
        z.object({
          id: z.number(),
          user_id: z.number(),
        }),
      ),
    // .min(1, "Approver is required"),
  });
  
  type ICreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;

  const form = useForm<z.infer<typeof CreateLeaveRequestSchema>>({
    resolver: zodResolver(CreateLeaveRequestSchema),
    defaultValues: {
      user_id: "",
      leave_type_id: "",
      start_date: dayjs(new Date()).format("YYYY-MM-DD").toString(),
      end_date: dayjs(new Date()).format("YYYY-MM-DD").toString(),
      // attachments: [],
      reason: "",
      approvers: [],
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  const [searchApprover, setSearchApprover] = React.useState("");
  const debouncedApprover = useDebounce(searchApprover, 300);
  const queryClient = useQueryClient();
  const selectedUserId = form.watch("user_id");

  const leaveId = React.useMemo(() => {
    const segments = pathname.split("/");
    const idSegment = segments[segments.length - 1];
    return idSegment && !isNaN(Number(idSegment)) ? Number(idSegment) : null;
  }, [pathname]);

  const isEditMode = leaveId !== null;

  const { data: detailLeave, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["leave-detail", leaveId],
    queryFn: () => getDetailLeave(leaveId!),
    enabled: isEditMode && leaveId !== null,
    retry: false,
  });

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

  React.useEffect(() => {
    if (detailLeave?.data && isEditMode) {
      const leaveData = detailLeave.data;
      requestAnimationFrame(() => {
        form.reset({
          user_id: leaveData.user_id.toString(),
          leave_type_id: leaveData.leave_type_id.toString(),
          start_date: leaveData.start_date,
          end_date: leaveData.end_date,
          reason: leaveData.reason,
          attachments: leaveData.attachment
            ? [{ type: leaveData.attachment }]
            : [],
          approvers: leaveData.approvers.map((approver) => ({
            id: approver.approver_id,
            user_id: approver.user_id,
          })),
        });
      });
    }
  }, [detailLeave, isEditMode, form]);

  const leaveTypeOptions = React.useMemo(() => {
    if (leaveTypes?.data) {
      return leaveTypes?.data.map((item) => ({
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

  const employeesMap = React.useMemo(() => {
    const map = new Map();
    if (employees?.data?.data) {
      employees.data.data.forEach((employee) => {
        map.set(employee.id.toString(), employee);
      });
    }
    return map;
  }, [employees?.data]);

  const valueTransformer = React.useCallback(
    (value: string) => {
      const employee = employeesMap.get(value);
      return {
        id: Number(value),
        user_id: employee ? employee.user_id : Number(value),
      };
    },
    [employeesMap],
  );

  const { mutate: createLeaveMutation, isPending: isPendingCreateLeave } =
    useMutation({
      mutationFn: (params: IMutateLeaveRequest) => createLeave(params),
      onSuccess: () => {
        toast.success("Create leave successfully!");
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        queryClient.invalidateQueries({ queryKey: ["leavesEmployee"] });
        router.push("/attendance/leave-request");
      },
      onError: (error: any) => {
        handleMutationError(error);
      },
    });

  const { mutate: updateLeaveMutation, isPending: isPendingUpdateLeave } =
    useMutation({
      mutationFn: (params: IMutateLeaveRequest) =>
        updateLeave(params, leaveId!),
      onSuccess: () => {
        toast.success("Update leave successfully!");
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        queryClient.invalidateQueries({ queryKey: ["leavesEmployee"] });
        queryClient.invalidateQueries({ queryKey: ["leave-detail", leaveId] });
        router.push("/attendance/leave-request");
      },
      onError: (error: any) => {
        handleMutationError(error);
      },
    });

  const handleMutationError = (error: any) => {
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
            toast.error(
              errorData.message ||
                `Failed to ${isEditMode ? "update" : "create"} leave`,
            );
          })
          .catch(() => {
            toast.error(
              `Failed to ${isEditMode ? "update" : "create"} leave: Server error`,
            );
          });
      } catch (parseError) {
        toast.error(
          `Failed to ${isEditMode ? "update" : "create"} leave: Server error`,
        );
      }
    } else {
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} leave: ${error.message || "Unknown error"}`,
      );
    }
  };

  const handleCancel = () => {
    router.push("/attendance/leave-request");
  };

   const { mutate: createLeaveMutationEmployee, isPending: isPendingCreateLeaveEmployee } =
    useMutation({
      mutationFn: (params: IMutateLeaveRequest) => createLeaveEmployee(params),
      onSuccess: () => {
        toast.success("Create leave successfully!");
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        router.push("/ess/leave");
      },
      onError: (error: any) => {
        handleMutationError(error);
      },
    });

  const onSubmit = (data: ICreateLeaveRequest) => {
    const requestPayload: IMutateLeaveRequest = {
      leave_type_id: Number(data.leave_type_id),
      start_date: dayjs(data.start_date).format("YYYY-MM-DD"),
      end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
      reason: data.reason,
      attachment: data.attachments?.[0]?.type || "",

      ...(!isEmployee && {
        user_id: Number(data.user_id),
        approvers: data.approvers?.map((approver) => ({
          id: Number(approver.id),
          user_id: Number(approver.user_id),
          approver_type: "Leave",
        })),
      }),
    };

    if (isEditMode) {
      updateLeaveMutation(requestPayload);
    } else {
      if(isEmployee){
        createLeaveMutationEmployee(requestPayload)
      }else{
        createLeaveMutation(requestPayload);
      }
    }
  };

  const isPending = isPendingCreateLeave || isPendingUpdateLeave;

  return {
    form,
    isLoadingEmployees,
    searchApprover,
    setSearchApprover,
    employeesOptions,
    leaveTypeOptions,
    isPending,
    handleCancel,
    onSubmit,
    leaveBalance,
    employeesMap,
    valueTransformer,
    detailLeave,
    isEditMode,
    isLoadingDetail,
    leaveId,
  };
};
