import * as React from "react";
import { useRouter } from "next/navigation";

export const usePerformanceCompetenciesList = () => {
  const router = useRouter();
  const [isOpenModalForm, setIsOpenModalForm] = React.useState(false);

  const handleAddNew = () => setIsOpenModalForm(true);

  const handleSave = () => {};

  return {
    handleAddNew,
    handleSave,
    isOpenModalForm,
    setIsOpenModalForm,
  };
};
