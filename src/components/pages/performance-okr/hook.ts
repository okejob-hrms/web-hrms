import * as React from "react";
import { useRouter } from "next/navigation";

// Mock data for OKR cycles
const mockOKRData = [
  {
    id: 1,
    period: "Q4 2025",
    start_date: "2025-10-01",
    end_date: "2025-12-31",
    total: 12,
    achievement: "85%",
    status: "In Progress",
    updated_at: "2025-12-01",
  },
  {
    id: 2,
    period: "Q3 2025",
    start_date: "2025-07-01",
    end_date: "2025-09-30",
    total: 10,
    achievement: "92%",
    status: "Completed",
    updated_at: "2025-10-05",
  },
  {
    id: 3,
    period: "Q2 2025",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    total: 8,
    achievement: "78%",
    status: "Completed",
    updated_at: "2025-07-10",
  },
  {
    id: 4,
    period: "Q1 2025",
    start_date: "2025-01-01",
    end_date: "2025-03-31",
    total: 15,
    achievement: "88%",
    status: "Completed",
    updated_at: "2025-04-15",
  },
  {
    id: 5,
    period: "Q4 2024",
    start_date: "2024-10-01",
    end_date: "2024-12-31",
    total: 11,
    achievement: "95%",
    status: "Completed",
    updated_at: "2025-01-10",
  },
];

export default function useOKR() {
  const router = useRouter();
  const [openForm, setOpenForm] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleNew = () => {
    setOpenForm(true);
  };

  const handleDetail = (id: number) => {
    router.push(`/performance/okr/${id}`);
  };

  const paginationData = {
    data: mockOKRData,
    meta: {
      current_page: pagination.pageIndex + 1,
      last_page: 1,
      per_page: pagination.pageSize,
      total: mockOKRData.length,
    },
  };

  const periodOptions = [
    { label: "Q1", value: "Q1" },
    { label: "Q2", value: "Q2" },
    { label: "Q3", value: "Q3" },
    { label: "Q4", value: "Q4" },
  ];

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSave = () => {};

  return {
    data: mockOKRData,
    pagination: paginationData,
    paginationState: pagination,
    setPagination,
    openForm,
    setOpenForm,
    handleNew,
    handleDetail,
    periodOptions,
    handleCloseForm,
    handleSave,
  };
}
