"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getEmployee, getPermission } from "@/services/settings";
import {
  IPermissionResponse,
  IPermissionModule,
  IEmployee,
} from "@/services/settings/types";
import { PaginatedResponse } from "@/lib/types";

export function useRoleManagementForm() {
  const [permission, setPermission] = useState<IPermissionModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IEmployee> | null>(null);

  const router = useRouter();

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res: IPermissionResponse = await getPermission();
      setPermission(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch roles:", err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getEmployee();

      setEmployees(res.data.data);
      setPagination(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch employees:", err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBack = () => {
    router.push("/settings/access-control");
  };

  useEffect(() => {
    fetchRoles();
    fetchEmployee();
  }, [fetchRoles, fetchEmployee]);

  return {
    loading,
    error,
    permission,
    employees,
    pagination,
    handleBack,
  };
}
