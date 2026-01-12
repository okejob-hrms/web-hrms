'use client';

import { useState } from 'react';

export function useDashboarAssessment() {
    const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "",
    dataSource: "",
    formSource: "",
    rows: "",
    columns: "",
    dataSummary: "",
    dataVisualization: "",
  });

  return {
    form,
    setForm,
    open,
    setOpen,
  };
}
