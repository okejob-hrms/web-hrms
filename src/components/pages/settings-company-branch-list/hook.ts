"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBranches } from "@/services/settings";
import { ICompanyBranches } from "@/services/settings/types";

export function useCompanyBranchList() {
  const [branches, setBranches] = useState<ICompanyBranches[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getBranches();
      setBranches(res.data ?? []);
    } catch (err: unknown) {
      console.error("Failed to fetch branches:", err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNew = () => {
    router.push("/settings/company/company-branch/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/settings/company/company-branch/${id}`);
  };

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    handleNew,
    handleEdit,
  };
}
