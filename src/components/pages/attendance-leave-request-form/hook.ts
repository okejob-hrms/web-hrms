/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "@/hooks/use-debounce";
import { ApiErrorResponse } from "@/lib/types";
import { uploadAttachment } from "@/services/attachments";
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
import { useTranslations } from "next-intl";
import { z } from "zod";


export const useLeaveRequestForm = (isEmployee?: boolean) => {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const CreateLeaveRequestSchema = React.useMemo(
    () =>
      z
        .object({
          user_id: isEmployee
            ? z.string().optional()
            : z.string().min(1, t('employeeNameRequired')),
          leave_type_id: z.string().min(1, t('leaveTypeRequired')),
          start_date: z.union([
            z.date(),
            z.string().min(1, t('startDateRequired')),
          ]),
          end_date: z.union([
            z.date(),
            z.string().min(1, t('endDateRequired')),
          ]),
          reason: z.string().min(1, t('reasonRequired')),
          attachments: z.string().optional(),
          is_half_day: z.boolean().optional(),
          approvers: isEmployee
            ? z
                .array(
                  z.object({
                    id: z.number(),
                    user_id: z.number(),
                  }),
                )
                .optional()
            : z.array(
                z.object({
                  id: z.number(),
                  user_id: z.number(),
                }),
              ),
        })
        .superRefine((data, ctx) => {
          if (data.start_date && data.end_date) {
            if (new Date(data.end_date) < new Date(data.start_date)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('endDateAfterStart'),
                path: ['end_date'],
              });
            }
          }

          const start = dayjs(data.start_date).format('YYYY-MM-DD');
          const end = dayjs(data.end_date).format('YYYY-MM-DD');
          if (data.is_half_day && start !== end) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('halfDaySingleDateOnly'),
              path: ['is_half_day'],
            });
          }
        }),
    [isEmployee, t],
  );

  type ICreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;

  const form = useForm<ICreateLeaveRequest>({
    resolver: zodResolver(CreateLeaveRequestSchema),
    defaultValues: {
      user_id: "",
      leave_type_id: "",
      start_date: dayjs(new Date()).format("YYYY-MM-DD").toString(),
      end_date: dayjs(new Date()).format("YYYY-MM-DD").toString(),
      attachments: "",
      reason: "",
      is_half_day: false,
      approvers: [],
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  const [searchApprover, setSearchApprover] = React.useState("");
  const debouncedApprover = useDebounce(searchApprover, 300);
  const queryClient = useQueryClient();
  const selectedUserId = form.watch("user_id");
  const watchedStartDate = form.watch("start_date");
  const watchedEndDate = form.watch("end_date");

  const isSingleDate = React.useMemo(() => {
    if (!watchedStartDate || !watchedEndDate) return false;
    return (
      dayjs(watchedStartDate).format("YYYY-MM-DD") ===
      dayjs(watchedEndDate).format("YYYY-MM-DD")
    );
  }, [watchedStartDate, watchedEndDate]);

  React.useEffect(() => {
    if (!isSingleDate && form.getValues("is_half_day")) {
      form.setValue("is_half_day", false, { shouldValidate: true });
    }
  }, [isSingleDate, form]);

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
              toast.error(errorData.message || t('fetchLeaveBalanceFailed'));
            })
            .catch(() => {
              toast.error(t('fetchLeaveBalanceFailed'));
            });
        } catch {
          toast.error(t('fetchLeaveBalanceFailed'));
        }
      } else {
        toast.error(error.message || t('fetchLeaveBalanceFailed'));
      }
    }
  }, [leaveBalanceError, t]);

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
          attachments: leaveData.attachment ?? '',
          is_half_day: Boolean(leaveData.is_half_day),
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
        toast.success(t('createLeaveSuccess'));
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
        toast.success(t('updateLeaveSuccess'));
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
                (isEditMode ? t('failedUpdateLeave') : t('failedCreateLeave')),
            );
          })
          .catch(() => {
            toast.error(
              `${isEditMode ? t('failedUpdateLeave') : t('failedCreateLeave')}: ${tCommon('errorLoading')}`,
            );
          });
      } catch {
        toast.error(
          `${isEditMode ? t('failedUpdateLeave') : t('failedCreateLeave')}: ${tCommon('errorLoading')}`,
        );
      }
    } else {
      toast.error(
        `${isEditMode ? t('failedUpdateLeave') : t('failedCreateLeave')}: ${error.message || tCommon('errorLoading')}`,
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

   const { mutate: createLeaveMutationEmployee, isPending: isPendingCreateLeaveEmployee } =
    useMutation({
      mutationFn: (params: IMutateLeaveRequest) => createLeaveEmployee(params),
      onSuccess: () => {
        toast.success(t('createLeaveSuccess'));
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        queryClient.invalidateQueries({ queryKey: ["leavesEmployee"] });
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
      attachment: data.attachments || '',
      is_half_day: Boolean(data.is_half_day) &&
        dayjs(data.start_date).format("YYYY-MM-DD") ===
          dayjs(data.end_date).format("YYYY-MM-DD"),

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

  const { mutate: uploadLogo, isPending: isUploadingLogo } = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (res) => {
      const photoUrl = res.data.path;
      form.setValue("attachments", photoUrl, { shouldValidate: true });
    },
    onError: (error) => {
      toast.error(t('failedUploadImage', { message: error.message }));
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file, {
        onSuccess: (res) => {
          const photoUrl = res.data.path;
          form.setValue("attachments", photoUrl, { shouldValidate: true });
        },
      });
    }
  };

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
    uploadLogo,
    isUploadingLogo,
    handleLogoChange,
    isSingleDate,
  };
};
