"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRoles } from "@/services/settings";
import { IRole } from "@/services/settings/types";

export function useRoleManagement() {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchRoles = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);

        const res = await getRoles();
        setRoles(res.data ?? []);
    } catch (err: unknown) {
        console.error("Failed to fetch roles:", err);
        setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
        setLoading(false);
    }
  }, []);


  const handleNew = () => {
    router.push("/settings/access-control/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/settings/access-control/${id}/edit`);
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    handleNew,
    handleEdit,
  };
}
