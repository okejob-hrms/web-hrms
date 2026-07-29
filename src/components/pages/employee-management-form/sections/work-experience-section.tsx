/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Plus } from "lucide-react";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getWorkExperiences,
  postCreateWorkExperience,
  putUpdateWorkExperience,
  deleteWorkExperience,
} from "@/services/employees/work-experiences";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IResponseWorkExperience,
  IWorkExperienceForm,
  WorkExperienceFormSchema,
} from "@/services/employees/work-experiences/types";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TextAreaForm } from "@/components/ui/textarea";
import { rupiahFormatter } from "@/lib/helpers";
import {
  COMPENSATION_CENSORED_PLACEHOLDER,
  COMPENSATION_VIEW_PERMISSION,
} from "@/lib/compensation";
import { usePermissionStore } from "@/hooks/use-permission-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ApiErrorResponse } from "@/lib/types";
import { useTranslations } from "next-intl";
import { PhoneInput } from "@/components/ui/phone-input";

dayjs.extend(localizedFormat);

// Phone number utility functions
const formatPhoneNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 10) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}-${cleanValue.slice(10)}`;
  }
};

const validatePhoneNumber = (
  value: string,
  t: (key: string) => string,
): string | null => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length < 3) {
    return t("phoneMinDigits");
  }
  if (cleanValue.length > 15) {
    return t("phoneMaxDigits");
  }
  return null;
};

const extractNumericPhone = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, "");
};

interface TableRowActionsProps {
  row: any;
  onEdit: (workExperience: IResponseWorkExperience) => void;
  onDelete: (workExperienceId: number) => void;
}

const TableRowActions = ({ row, onEdit, onDelete }: TableRowActionsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(row.original);
    setIsDropdownOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(row.original.id);
    setIsDropdownOpen(false);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Ellipsis className="h-4 w-4 text-grayscale-30" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
          <div className="flex h-fit w-fit gap-2 justify-between items-center">
            <Image
              src="/icons/editGrey.svg"
              height={16}
              width={16}
              alt="icon-edit"
            />
            Edit
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="cursor-pointer"
        >
          <div className="flex h-fit w-fit gap-2 justify-between items-center">
            <Image
              src="/icons/delete.svg"
              height={16}
              width={16}
              alt="icon-delete"
            />
            Delete
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface WorkExperienceFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  workExperienceData?: IResponseWorkExperience | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline";
}

const WorkExperienceFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  workExperienceData,
  employee_profile_id,
  onSuccess,
  buttonVariant = "default",
}: WorkExperienceFormModalProps) => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<IWorkExperienceForm>({
    resolver: zodResolver(WorkExperienceFormSchema),
    defaultValues: {
      company: "",
      initial_position: "",
      final_position: "",
      supervisor: "",
      supervisor_contact: "",
      company_address: "",
      start_date: new Date(),
      end_date: new Date(),
      last_salary: 0,
      reason_for_resign: "",
    },
  });

  React.useEffect(() => {
    if (isEdit && workExperienceData && open) {
      form.reset({
        company: workExperienceData.company || "",
        initial_position: workExperienceData.initial_position || "",
        final_position: workExperienceData.final_position || "",
        supervisor: workExperienceData.supervisor || "",
        supervisor_contact: workExperienceData.supervisor_contact || "",
        company_address: workExperienceData.company_address || "",
        start_date: workExperienceData.start_date
          ? new Date(workExperienceData.start_date)
          : new Date(),
        end_date: workExperienceData.end_date
          ? new Date(workExperienceData.end_date)
          : new Date(),
        last_salary: Number(workExperienceData.last_salary) || 0,
        reason_for_resign: workExperienceData.reason_for_resign || "",
      });
    }
  }, [isEdit, workExperienceData, open, form]);

  const mutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IWorkExperienceForm;
      id?: number;
    }) =>
      isEdit
        ? putUpdateWorkExperience(params)
        : postCreateWorkExperience(params),
    onSuccess: () => {
      toast.success(
        isEdit
          ? t("workExperienceUpdatedSuccess")
          : t("workExperienceAddedSuccess"),
      );

      queryClient.invalidateQueries({
        queryKey: ["work-experiences", employee_profile_id || ""],
      });

      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.log("error ", error);
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || t("workExperienceSaveFailed"),
              );
            })
            .catch(() => {
              toast.error(t("workExperienceSaveServerError"));
            });
        } catch (parseError) {
          toast.error(
            `${t("workExperienceSaveServerError")} : ${parseError}`,
          );
        }
      } else {
        toast.error(
          `${t("workExperienceSaveFailed")} ${error.message || ""}`,
        );
      }
    },
  });

  const onSubmit = React.useCallback(
    async (values: IWorkExperienceForm) => {
      try {
        const phoneError = validatePhoneNumber(
          values.supervisor_contact?.toString() || "",
          t,
        );
        if (phoneError) {
          form.setError("supervisor_contact", {
            type: "manual",
            message: phoneError,
          });
          return;
        }

        const payload = {
          ...values,
          supervisor_contact: extractNumericPhone(
            values.supervisor_contact?.toString() || "",
          ),
        };

        const params = {
          employee_profile_id,
          payload,
          ...(isEdit &&
            workExperienceData?.id && { id: workExperienceData.id }),
        };

        mutation.mutate(params);
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(t("workExperienceSubmitFailed"));
      }
    },
    [form, isEdit, workExperienceData?.id, employee_profile_id, mutation, t],
  );

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    mutation.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button
            variant={buttonVariant}
            className={cn(buttonVariant === "outline" && "bg-white")}
          >
            <Plus /> {t("addWorkExperience")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editWorkExperience") : t("addWorkExperience")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="company" label={t("company")} required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <InputForm
                  name="initial_position"
                  label={t("initialPosition")}
                  required
                />
                <InputForm
                  name="final_position"
                  label={t("finalPosition")}
                  required
                />
              </div>
              <InputForm name="supervisor" label={t("supervisor")} required />
              <PhoneInput
                name="supervisor_contact"
                label={t("supervisorContact")}
                required
                disabled={mutation.isPending}
              />
              <TextAreaForm
                name="company_address"
                label={t("companyAddress")}
                required
                className="md:col-span-2"
                disabled={mutation.isPending}
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <DatePicker label={t("joinDate")} name="start_date" />
                <DatePicker label={t("resignDate")} name="end_date" />
              </div>
              <InputForm
                name="last_salary"
                label={t("lastSalary")}
                required
                type="number"
                disabled={mutation.isPending}
              />
              <TextAreaForm
                name="reason_for_resign"
                label={t("reasonOfResign")}
                required
                className="md:col-span-2"
                disabled={mutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

const SectionHeader = ({ withAddButton, employee_profile_id }: Props) => {
  const t = useTranslations("employee");
  return (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      {t("workExperience")}
    </h2>
    {withAddButton && (
      <WorkExperienceFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
  );
};

export const WorkExperienceSection = React.memo<Props>(
  function WorkExperienceSection({
    withAddButton = false,
    employee_profile_id,
  }) {
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const canViewCompensation = usePermissionStore((state) =>
      state.can(COMPENSATION_VIEW_PERMISSION),
    );
    const queryClient = useQueryClient();
    const [editingWorkExperience, setEditingWorkExperience] =
      React.useState<IResponseWorkExperience | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const { data, isLoading } = useQuery({
      queryKey: employee_profile_id
        ? ["work-experiences", employee_profile_id]
        : ["work-experiences"],
      queryFn: () => getWorkExperiences({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!employee_profile_id,
    });

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) =>
        deleteWorkExperience({ id, employee_profile_id }),
      onSuccess: (_) => {
        toast.success(t("workExperienceDeleteSuccess"));
        queryClient.invalidateQueries({
          queryKey: ["work-experiences", employee_profile_id || ""],
        });
      },
      onError: (error: any) => {
        console.error("Delete mutation error:", error);
        toast.error(
          t("workExperienceDeleteFailed", {
            message:
              error?.response?.data?.message || error.message || tCommon("failed"),
          }),
        );
      },
    });

    const handleEdit = (workExperience: IResponseWorkExperience) => {
      setEditingWorkExperience(workExperience);
      setIsEditModalOpen(true);
    };

    const handleDelete = (workExperienceId: number) => {
      if (
        window.confirm(t("workExperienceDeleteConfirm"))
      ) {
        deleteMutation.mutate({ id: workExperienceId });
      }
    };

    const handleFormSuccess = () => {
      setIsEditModalOpen(false);
      setEditingWorkExperience(null);
    };

    const columns: ColumnDef<IResponseWorkExperience>[] = React.useMemo(
      () => [
        {
          accessorKey: "company",
          header: t("company"),
        },
        {
          accessorKey: "initial_position",
          header: t("initialPosition"),
        },
        {
          accessorKey: "final_position",
          header: t("finalPosition"),
        },
        {
          accessorKey: "supervisor",
          header: t("supervision"),
        },
        {
          accessorKey: "supervisor_contact",
          header: t("supervisorContact"),
          cell: ({ row }) => {
            const phone = row.original.supervisor_contact;
            return (
              <span>{phone ? formatPhoneNumber(phone.toString()) : "-"}</span>
            );
          },
        },
        {
          accessorKey: "company_address",
          header: t("companyAddress"),
        },
        {
          accessorKey: "start_date",
          header: t("joinDate"),
          cell: ({ row }) => (
            <span>{dayjs(row.original.start_date).format("LL")}</span>
          ),
        },
        {
          accessorKey: "end_date",
          header: t("resignDate"),
          cell: ({ row }) => (
            <span>{dayjs(row.original.end_date).format("LL")}</span>
          ),
        },
        {
          accessorKey: "last_salary",
          header: t("lastSalary"),
          cell: ({ getValue }) => {
            if (!canViewCompensation) {
              return COMPENSATION_CENSORED_PLACEHOLDER;
            }
            const salary = getValue<number>();
            return rupiahFormatter(salary);
          },
        },
        {
          accessorKey: "reason_for_resign",
          header: t("reasonOfResign"),
        },
        {
          accessorKey: "menu",
          header: "",
          cell: ({ row }) => (
            <TableRowActions
              row={row}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ),
        },
      ],
      [t, canViewCompensation],
    );

    return (
      <React.Fragment>
        <SectionHeader
          withAddButton={withAddButton}
          employee_profile_id={employee_profile_id}
        />

        {isEditModalOpen && (
          <WorkExperienceFormModal
            isEdit
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            workExperienceData={editingWorkExperience}
            employee_profile_id={employee_profile_id}
            onSuccess={handleFormSuccess}
          />
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4 items-center w-full">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-30 w-full" />
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data?.data || []}
            tableClassName="table-fixed w-full"
            tableCellClassName="w-1/9 text-clip text-balance"
            tableHeadClassName="w-1/9 text-clip text-balance"
            noDataPlaceholder={
              <div className="border border-primary-border bg-primary-background rounded-md p-2 gap-1 mx-8 flex flex-col items-center justify-center">
                <p className="text-primary font-semibold text-lg text-center">
                  {t("completeWorkExperience")}
                </p>
                <p className="text-base text-text-secondary text-center">
                  {t("completeWorkExperienceDesc")}
                </p>
                <WorkExperienceFormModal
                  buttonVariant="outline"
                  employee_profile_id={employee_profile_id}
                />
              </div>
            }
          />
        )}
        <Separator className="my-6" />
      </React.Fragment>
    );
  },
);
