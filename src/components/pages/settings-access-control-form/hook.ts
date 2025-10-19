"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getEmployee, getPermission, createRole, getRoleById, getUserWithRole, updateRole } from "@/services/settings";
import {
  IPermissionResponse,
  IPermissionModule,
  IEmployee,
  ICreateRolePayload,
} from "@/services/settings/types";
import { PaginatedResponse } from "@/lib/types";
import * as React from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { z } from "zod";
import { toast } from "sonner";

// schema form
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export type RoleFormSchema = z.infer<typeof formSchema>;

export function useRoleManagementForm() {
  const router = useRouter();

  // local states
  const [selectedPermissions, setSelectedPermissions] = React.useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = React.useState<IEmployee[]>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [searchEmployee, setSearchEmployee] = React.useState<string>('');

  // fetch permissions
  const {
    data: permissionData,
    isLoading: isPermissionLoading,
    error: permissionError,
  } = useQuery<IPermissionResponse>({
    queryKey: ["permissions"],
    queryFn: getPermission,
  });

  // fetch employees
  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    error: employeeError,
  } = useQuery<PaginatedResponse<IEmployee>>({
    queryKey: ["employees", searchEmployee],
    queryFn: () => getEmployee(searchEmployee),
  });

  // fetch detail roles
  const {
    data: roleDetail,
    isLoading: isRoleLoading,
    error: roleError,
    refetch: roleRefetch,
  } = useQuery({
    queryKey: ["role", selectedId],
    queryFn: () => getRoleById(selectedId!),
    enabled: !!selectedId,
  });

  // fetch user list
    const {
    data: userWithRole,
    isLoading: isUserRoleLoading,
    error: userWithRoleError,
    refetch: userWithRoleRefetch,
  } = useQuery({
    queryKey: ["userWithRole", selectedId],
    queryFn: () => getUserWithRole(selectedId!),
    enabled: !!selectedId,
  });

  // mutation create role
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      router.push("/settings/access-control");
      toast.success("Create role successful!");
    },
    onError: (error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });

  // mutation update role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICreateRolePayload }) => updateRole(id, data),
    onSuccess: () => {
      router.push("/settings/access-control");
      roleRefetch();
      userWithRoleRefetch();
      toast.success("Update role successful!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  // toggle permission
  const handleTogglePermission = (id: number, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  // back button
  const handleBack = () => {
    router.push("/settings/access-control");
  };

  // submit
  const handleSubmit = (values: RoleFormSchema) => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    const payload = {
      ...values,
      guard_name: "web",
      permissions: selectedPermissions,
      users: selectedEmployees.map((e) => e.user_id),
    };

    if (selectedId) {
      updateRoleMutation.mutate({ id: selectedId, data: payload });
    } else {
      createRoleMutation.mutate(payload);
    }
  };

  const handleDetailData = (id: number) => {
    setSelectedId(id)
  }

  return {
    loading: isPermissionLoading || isEmployeeLoading,
    error: permissionError?.message || employeeError?.message || null,
    permission: permissionData?.data ?? ([] as IPermissionModule[]),
    employees: employeeData?.data ?? ([] as IEmployee[]),
    pagination: employeeData ?? null,
    selectedPermissions,
    selectedEmployees,
    rowSelection,
    setSelectedPermissions,
    setSelectedEmployees,
    setRowSelection,
    handleTogglePermission,
    handleSubmit,
    handleBack,
    handleDetailData,
    formSchema,
    isSubmitting: createRoleMutation.isPending,
    isSuccess: createRoleMutation.isSuccess,
    isError: createRoleMutation.isError,
    errorMessage: (createRoleMutation.error as Error)?.message ?? null,
    roleDetail,
    isRoleLoading,
    roleError,
    userWithRole,
    isUserRoleLoading,
    userWithRoleError,
    searchEmployee, 
    setSearchEmployee,
  };
}
