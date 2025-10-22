/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { RefreshCw, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelectComboboxForm } from "@/components/ui/multi-select-combobox";
import { getDepartment } from "@/services/department";
import { useQuery } from "@tanstack/react-query";
import { getJobLevels } from "@/services/job-levels";
import { getEmployees } from "@/services/employees";
import {
  getManageAccessDocument,
  postManageAccessDocument,
} from "@/services/document/access-control";
import { ApiErrorResponse, ComboboxGroup } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const accessFormSchema = z.object({
  access_level: z.string(),
  granteeables: z
    .array(
      z.object({
        value: z.string(),
        type: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
});

type AccessFormValues = z.infer<typeof accessFormSchema>;

const ACCESS_LEVEL_OPTIONS = [
  { label: "Public", value: "public" },
  { label: "Restricted", value: "restricted" },
  { label: "Confidential", value: "confidential" },
];

interface ManageAccessModalProps {
  onSave?: (data: any) => Promise<void> | void;
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: Partial<AccessFormValues>;
  employeeDocumentId: number;
}

export default function ManageAccessModal({
  onSave,
  disabled = false,
  isOpen,
  onClose,
  defaultValues,
  employeeDocumentId,
}: ManageAccessModalProps) {
  const form = useForm<AccessFormValues>({
    defaultValues: {
      access_level: "public",
      granteeables: [],
      ...defaultValues,
    },
  });

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedGranteeables = form.watch("granteeables");

  const mutation = useMutation({
    mutationFn: postManageAccessDocument,
    onSuccess: (data) => {
      if (onSave) {
        onSave(data);
      }
      onClose();
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["manage_access", employeeDocumentId],
      });
      toast.success("Access control granted.");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to save manage access");
            })
            .catch(() => {
              toast.error("Failed to save manage access: Server error");
            });
        } catch (parseError) {
          toast.error(
            "Failed to save manage access: Server error : " + parseError,
          );
        }
      } else {
        toast.error(
          `Failed to save manage access: ${error.message || "Unknown error"}`,
        );
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["department_id"],
    queryFn: () => getDepartment(),
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  const { data: jobLevels } = useQuery({
    queryKey: ["job_level_id"],
    queryFn: getJobLevels,
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees({ search: "" }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  const { data: manageAccess, isLoading: isManageAccessLoading } = useQuery({
    queryKey: ["manage_access", employeeDocumentId],
    queryFn: () => getManageAccessDocument(employeeDocumentId),
    enabled: isOpen && !!employeeDocumentId,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    console.log("🔍 Modal state changed", { isOpen, employeeDocumentId });
  }, [isOpen, employeeDocumentId]);

  React.useEffect(() => {
    console.log("🔍 useEffect triggered", {
      isOpen,
      hasManageAccessData: !!manageAccess?.data,
      hasEmployees: !!employees?.data?.data,
      hasDepartments: !!departments?.data?.data,
      hasJobLevels: !!jobLevels?.data,
      manageAccessData: manageAccess?.data,
    });

    if (!manageAccess?.data || !isOpen) {
      console.log("❌ Skipping - no manageAccess data or modal not open");
      return;
    }

    console.log(
      "✅ Setting default values from manageAccess",
      manageAccess.data,
    );
    const { access_control, shares } = manageAccess.data;

    // Set access level
    if (access_control?.access_level) {
      console.log("📝 Setting access_level:", access_control.access_level);
      form.setValue("access_level", access_control.access_level);
    }

    // Set granteeables
    if (
      shares &&
      shares.length > 0 &&
      employees?.data?.data &&
      departments?.data?.data &&
      jobLevels?.data
    ) {
      console.log("📝 Setting granteeables from shares:", shares);
      const formattedGranteeables = shares
        .map((share) => {
          let label = "";
          const type = share.granteeable_type;

          if (share.granteeable_type === "EmployeeProfile") {
            const employee = employees.data.data.find(
              (emp) => emp.id === share.granteeable_id,
            );
            label = employee?.name || `Employee ${share.granteeable_id}`;
          } else if (share.granteeable_type === "Departement") {
            const department = departments.data.data.find(
              (dept) => dept.id === share.granteeable_id,
            );
            label = department?.name || `Department ${share.granteeable_id}`;
          } else if (share.granteeable_type === "JobLevel") {
            const jobLevel = jobLevels.data.find(
              (jl) => jl.id === share.granteeable_id,
            );
            label = jobLevel?.name || `Job Level ${share.granteeable_id}`;
          }

          if (label) {
            return {
              value: share.granteeable_id.toString(),
              type: type,
              label,
            };
          }
          return null;
        })
        .filter(Boolean);

      form.setValue("granteeables", formattedGranteeables as any);
      console.log("✅ Formatted granteeables:", formattedGranteeables);
    } else {
      console.log("❌ No shares or missing data, clearing granteeables");
      form.setValue("granteeables", []);
    }
  }, [
    manageAccess,
    employees?.data?.data,
    departments?.data?.data,
    jobLevels?.data,
    form,
    isOpen,
  ]);

  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        form.reset({
          access_level: "public",
          granteeables: [],
          ...defaultValues,
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, form, defaultValues]);

  const handleSubmit = async (data: AccessFormValues) => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      const formattedGranteeables =
        data.granteeables?.map((item) => ({
          granteeable_type: item.type,
          granteeable_id: parseInt(item.value),
        })) || [];

      const params = {
        employee_document_id: employeeDocumentId,
        access_level: data.access_level,
        link_enabled: true,
        granteeables: formattedGranteeables,
      };

      mutation.mutate(params);
    } catch (error) {
      console.error("Error updating document access:", error);
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (manageAccess?.data?.access_control?.link_token) {
      const link = `${window.location.origin}/documents/shared/${manageAccess.data.access_control.link_token}`;
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    } else {
      toast.error("No shareable link available");
    }
  };

  const handleInvite = () => {
    console.log("Invite clicked");
  };

  const handleClose = (open: boolean) => {
    if (!open && !isLoading) {
      form.reset();
      onClose();
    }
  };

  const departmentOptions = React.useMemo(() => {
    if (departments?.data?.data) {
      return departments.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [departments?.data]);

  const jobLevelOptions = React.useMemo(() => {
    if (jobLevels?.data) {
      return jobLevels.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobLevels?.data]);

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [employees?.data]);

  const groupedOptions: ComboboxGroup[] = [
    {
      label: "Employee",
      options: employeesOptions,
      renderOption: (option, index) => {
        const employee = employees?.data?.data?.[index];
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                className="size-8"
                src={`${process.env.NEXT_PUBLIC_FILE_URL}/${employee?.photo_profile}`}
                alt={employee?.name}
              />
              <AvatarFallback className="text-base font-medium">
                {stringAvatar(employee?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-base font-normal text-grayscale-100">
                {employee?.name}
              </p>
              <p className="text-text-disabled text-xs font-normal">
                {employee?.job_position}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      label: "Department",
      options: departmentOptions,
      renderOption: (option) => (
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8 bg-primary-background items-center justify-center">
            <AvatarImage
              className="size-5 bg-primary-background"
              src="/icons/account-company.svg"
              alt="department"
            />
          </Avatar>
          {option.label}
        </div>
      ),
    },
    {
      label: "Job Level",
      options: jobLevelOptions,
      renderOption: (option) => (
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8 bg-primary-background items-center justify-center">
            <AvatarImage
              className="size-5 bg-primary-background"
              src="/icons/Group.svg"
              alt="job level"
            />
          </Avatar>
          {option.label}
        </div>
      ),
    },
  ];

  const isSubmitting = disabled || isLoading || isManageAccessLoading;

  const handleRemove = (valueToRemove: string, typeToRemove: string) => {
    const currentValues = form.getValues("granteeables") || [];
    const updatedValues = currentValues.filter(
      (item: any) =>
        !(item.value === valueToRemove && item.type === typeToRemove),
    );
    form.setValue("granteeables", updatedValues);
  };

  const getEmployeeData = (employeeId: string) => {
    return employees?.data?.data?.find((emp) => emp.id === Number(employeeId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Document Access</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1"
          >
            <div className="flex-1 px-1 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-8">
                    <SelectForm
                      name="access_level"
                      label="Access Level"
                      options={ACCESS_LEVEL_OPTIONS}
                      required
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-9">
                    <MultiSelectComboboxForm
                      name="granteeables"
                      label="Employee Name/Department/Job Level"
                      groups={groupedOptions}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleInvite}
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
                <div>
                  {selectedGranteeables && selectedGranteeables.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-text-disabled text-xs font-normal">
                        Who has access
                      </p>
                      <div className="flex flex-col gap-2 mb-2">
                        {selectedGranteeables.map(
                          (
                            item: {
                              value: string;
                              type: string;
                              label: string;
                            },
                            index: number,
                          ) => {
                            const employeeData = getEmployeeData(item.value);

                            return (
                              <div
                                key={`${item.value}-${item.type}-${index}`}
                                className="flex items-center px-2 py-1 text-sm justify-between"
                              >
                                {item.type === "EmployeeProfile" && (
                                  <div className="flex gap-2 items-center">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        className="size-8"
                                        src={`${process.env.NEXT_PUBLIC_FILE_URL}/${employeeData?.photo_profile}`}
                                        alt={employeeData?.name}
                                      />
                                      <AvatarFallback className="text-base font-medium">
                                        {stringAvatar(employeeData?.name ?? "")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{item.label}</span>
                                    <span className="text-text-disabled">
                                      ({employeeData?.id})
                                    </span>
                                    <span className="text-text-disabled">
                                      {employeeData?.job_position}
                                    </span>
                                  </div>
                                )}
                                {item.type === "Departement" && (
                                  <div className="flex gap-2 items-center">
                                    <Avatar className="h-8 w-8 bg-primary-background items-center justify-center">
                                      <AvatarImage
                                        className="size-5 bg-primary-background"
                                        src="/icons/account-company.svg"
                                        alt="department"
                                      />
                                    </Avatar>
                                    {item.label}
                                  </div>
                                )}
                                {item.type === "JobLevel" && (
                                  <div className="flex gap-2 items-center">
                                    <Avatar className="h-8 w-8 bg-primary-background items-center justify-center">
                                      <AvatarImage
                                        className="size-5 bg-primary-background"
                                        src="/icons/Group.svg"
                                        alt="job level"
                                      />
                                    </Avatar>
                                    {item.label}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemove(item.value, item.type)
                                  }
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  <Image
                                    src="/icons/deleteOutlined.svg"
                                    width={16}
                                    height={16}
                                    alt="delete"
                                  />
                                </button>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 sm:flex-none"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    {isManageAccessLoading ? "Loading..." : "Saving..."}
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
