/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Plus } from "lucide-react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { useForm, useFormContext } from "react-hook-form";
import {
  familyFormScheme,
  IFamilyForm,
  IFamilyResponse,
} from "@/services/employees/families/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteFamily,
  getFamilies,
  postCreateFamily,
  putUpdateFamily,
} from "@/services/employees/families";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectForm } from "@/components/ui/select-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/ui/phone-input";
import { convertPhoneToNumber } from "@/lib/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import dayjs from "dayjs";
import { formatDate } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ApiErrorResponse } from "@/lib/types";

interface TableRowActionsProps {
  row: any;
  onEdit: (family: IFamilyResponse) => void;
  onDelete: (familyId: number) => void;
}

const TableRowActions = ({ row, onEdit, onDelete }: TableRowActionsProps) => {
  const tCommon = useTranslations("common");
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
            {tCommon('edit')}
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
            {tCommon('delete')}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface FamilyFormModalProps {
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  familyData?: IFamilyResponse | null;
  employee_profile_id?: number;
  onSuccess?: () => void;
  buttonVariant?: "outline" | "default";
}

const FamilyFormModal = ({
  isEdit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  familyData,
  employee_profile_id,
  onSuccess,
  buttonVariant = "default",
}: FamilyFormModalProps) => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [internalOpen, setInternalOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const formContext = useFormContext();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { setValue, watch } = formContext || {};
  const watchedFamilies = watch ? watch("families") : null;

  const form = useForm<IFamilyForm>({
    resolver: zodResolver(familyFormScheme),
    defaultValues: {
      name: "",
      place_of_birth: "",
      date_of_birth: "",
      relationship: "",
      highest_education: "1",
      email: "",
      phone: "",
      occupation: "",
      company: "",
    },
  });

  const educationOptions = React.useMemo(
    () => [
      { label: t("educationPrimary"), value: "1" },
      { label: t("educationJuniorHigh"), value: "2" },
      { label: t("educationSeniorHigh"), value: "3" },
      { label: t("educationVocationalHigh"), value: "4" },
      { label: t("educationDiploma"), value: "5" },
      { label: t("educationBachelor"), value: "6" },
      { label: t("educationMaster"), value: "7" },
      { label: t("educationDoctorate"), value: "8" },
    ],
    [t],
  );

  React.useEffect(() => {
    if (isEdit && familyData && open) {
      form.reset({
        name: familyData.name || "",
        place_of_birth: familyData.place_of_birth || "",
        date_of_birth: familyData.date_of_birth
          ? dayjs(familyData.date_of_birth).format("DD/MM/YYYY")
          : "",
        relationship: familyData.relationship || "",
        highest_education: familyData.highest_education?.toString() || "1",
        email: familyData.email || "",
        phone: familyData.phone?.toString() || "",
        occupation: familyData.occupation || "",
        company: familyData.company || "",
      });
    }
  }, [isEdit, familyData, open, form]);

  const mutation = useMutation({
    mutationFn: (params: {
      employee_profile_id?: number;
      payload: IFamilyForm;
      id?: number;
    }) => (isEdit ? putUpdateFamily(params) : postCreateFamily(params)),
    onSuccess: (res) => {
      toast.success(
        isEdit ? t("familyUpdatedSuccess") : t("familyAddedSuccess"),
      );

      if (setValue && watchedFamilies) {
        if (isEdit) {
          const updatedFamilies = watchedFamilies.map((f: IFamilyResponse) =>
            f.id === familyData?.id ? res.data : f,
          );
          setValue("families", updatedFamilies);
        } else {
          const updatedFamilies = Array.isArray(watchedFamilies)
            ? [...watchedFamilies, res.data]
            : [res.data];
          setValue("families", updatedFamilies);
        }
      }

      const queryKey = ["family", employee_profile_id || ""];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) {
          return {
            data: {
              data: [res.data],
              total: 1,
              page: 1,
              per_page: 10,
            },
          };
        }

        if (isEdit) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map((f: IFamilyResponse) =>
                f.id === familyData?.id ? res.data : f,
              ),
            },
          };
        } else {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: [...(oldData.data.data || []), res.data],
              total: (oldData.data.total || 0) + 1,
            },
          };
        }
      });

      queryClient.invalidateQueries({ queryKey: ["family"] });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("familySaveFailed"));
            })
            .catch(() => {
              toast.error(t("familySaveServerError"));
            });
        } catch (parseError) {
          toast.error(`${t("familySaveServerError")} : ${parseError}`);
        }
      } else {
        toast.error(
          tCommon("saveFailed", {
            message: error.message || "Unknown error",
          }),
        );
      }
    },
  });

  const onSubmit = React.useCallback(async (values: IFamilyForm) => {
    try {
      const payload = {
        ...values,
        highest_education: Number(values.highest_education),
        phone: values.phone ? convertPhoneToNumber(values.phone) : values.phone,
      };

      const params = {
        employee_profile_id,
        payload,
        ...(isEdit && familyData?.id && { id: familyData.id }),
      };

      mutation.mutate(params);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(t("familySubmitFailed"));
    }
  }, []);

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    mutation.reset();
  };

  const handleUpdateFamily = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const isValid = await form.trigger();
      const formData = form.getValues();

      console.log("# ERROR EDIT ", form.formState.errors);

      if (!isValid) {
        console.log("Form validation failed");
        return;
      }
      onSubmit(formData);
    },
    [form, onSubmit],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button
            variant={buttonVariant}
            className={cn(buttonVariant === "outline" && "bg-white")}
          >
            <Plus /> {t("addFamilyInformation")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editFamily") : t("addFamily")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm name="name" label={tCommon("name")} required />
              <div className="grid grid-cols-2 gap-4 w-full">
                <InputForm
                  name="place_of_birth"
                  label={t("placeOfBirth")}
                  required
                />
                <DatePicker name="date_of_birth" label={t("bornDate")} />
              </div>
              <InputForm
                name="relationship"
                label={t("familyRelationship")}
                required
              />
              <SelectForm
                name="highest_education"
                label={t("highestEducationLevel")}
                options={educationOptions}
                disabled={mutation.isPending}
                required
              />
              <InputForm name="email" label={tCommon("email")} type="email" required />
              <PhoneInput name="phone" label={t("phoneNumber")} required={true} />
              <InputForm
                name="occupation"
                label={t("occupation")}
                required
                disabled={mutation.isPending}
              />
              <InputForm
                name="company"
                label={t("company")}
                required
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
              <Button
                onClick={handleUpdateFamily}
                disabled={mutation.isPending || !form.formState.isValid}
              >
                {mutation.isPending ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface SectionHeaderProps {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

const SectionHeader = ({
  withAddButton,
  employee_profile_id,
}: SectionHeaderProps) => {
  const t = useTranslations("employee");
  return (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      {t("familyInformation")}
    </h2>
    {withAddButton && (
      <FamilyFormModal employee_profile_id={employee_profile_id} />
    )}
  </div>
  );
};

interface FamilyInformationSectionProps {
  withAddButton?: boolean;
  employee_profile_id?: number;
}

export const FamilyInformationSection =
  React.memo<FamilyInformationSectionProps>(function FamilyInformationSection({
    withAddButton = false,
    employee_profile_id,
  }) {
    const formContext = useFormContext();
    const queryClient = useQueryClient();
    const locale = resolveLocale(useLocale());
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const [editingFamily, setEditingFamily] =
      React.useState<IFamilyResponse | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const watchedFamilies = formContext ? formContext.watch("families") : null;

    const deleteMutation = useMutation({
      mutationFn: ({ id }: { id: number }) =>
        deleteFamily({ id, employee_profile_id }),
      onSuccess: (_, variables) => {
        toast.success(t("familyDeleteSuccess"));
        if (formContext?.setValue && watchedFamilies) {
          const updatedFamilies = watchedFamilies.filter(
            (f: IFamilyResponse) => f.id !== variables.id,
          );
          formContext.setValue("families", updatedFamilies);
        }
        const queryKey = ["family", employee_profile_id || ""];
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.filter(
                (f: IFamilyResponse) => f.id !== variables.id,
              ),
              total: oldData.data.total - 1,
            },
          };
        });

        queryClient.invalidateQueries({ queryKey: ["family"] });
      },
      onError: (error: any) => {
        console.error("Delete mutation error:", error);
        toast.error(
          t("familyDeleteFailed", {
            message:
              error?.response?.data?.message || error.message || "Unknown error",
          }),
        );
      },
    });

    const { data, isLoading } = useQuery({
      queryKey: employee_profile_id
        ? ["family", employee_profile_id]
        : ["family"],
      queryFn: () => getFamilies({ employee_profile_id }),
      retry: (failureCount, error: any) => {
        console.error("Query error:", error);
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      enabled: !!employee_profile_id,
    });

    const returnedData = data?.data?.data || watchedFamilies;

    const handleEdit = (family: IFamilyResponse) => {
      setEditingFamily(family);
      setIsEditModalOpen(true);
    };

    const handleDelete = (familyId: number) => {
      if (
        window.confirm(t("familyDeleteConfirm"))
      ) {
        deleteMutation.mutate({ id: familyId });
      }
    };

    const handleFormSuccess = () => {
      setIsEditModalOpen(false);
      setEditingFamily(null);
    };

    const columns: ColumnDef<IFamilyResponse>[] = React.useMemo(
      () => [
        {
          accessorKey: "name",
          header: tCommon("name"),
        },
        {
          accessorKey: "relationship",
          header: t("familyRelationship"),
        },
        {
          accessorKey: "place_of_birth",
          header: t("placeOfBirth"),
        },
        {
          accessorKey: "date_of_birth",
          header: t("bornDate"),
          cell: ({ row }) => (
            <span>
              {formatDate(row.getValue("date_of_birth"), locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          ),
        },
        {
          accessorKey: "highest_education",
          header: t("highestEducationLevel"),
          cell: ({ row }) => (
            <span>{row.original.highest_education_label}</span>
          ),
        },
        {
          accessorKey: "email",
          header: tCommon("email"),
        },
        {
          accessorKey: "phone",
          header: t("phoneNumber"),
        },
        {
          accessorKey: "occupation",
          header: t("occupation"),
        },
        {
          accessorKey: "company",
          header: t("company"),
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
      [t, tCommon, locale, handleEdit, handleDelete],
    );

    return (
      <React.Fragment>
        <SectionHeader
          withAddButton={withAddButton}
          employee_profile_id={employee_profile_id}
        />

        {isEditModalOpen && (
          <FamilyFormModal
            isEdit
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            familyData={editingFamily}
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
            data={returnedData || []}
            tableClassName="table-fixed w-full"
            tableCellClassName="w-1/9 text-clip text-balance"
            tableHeadClassName="w-1/9 text-clip text-balance"
            noDataPlaceholder={
              <div className="border border-primary-border bg-primary-background rounded-md p-2 gap-1 mx-8 flex flex-col items-center justify-center">
                <p className="text-primary font-semibold text-lg text-center">
                  {t("completeFamilyInformation")}
                </p>
                <p className="text-base text-text-secondary text-center">
                  {t("completeFamilyInformationDesc")}
                </p>
                <FamilyFormModal
                  employee_profile_id={employee_profile_id}
                  buttonVariant="outline"
                />
              </div>
            }
          />
        )}

        <Separator className="my-6" />
      </React.Fragment>
    );
  });
