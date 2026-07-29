/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { InputForm } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getAllowanceTypes } from "@/services/allowance-types";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getBaseSalary } from "@/services/salary";
import { useTranslations } from "next-intl";
import { usePermissionStore } from "@/hooks/use-permission-store";
import {
  COMPENSATION_CENSORED_PLACEHOLDER,
  COMPENSATION_VIEW_PERMISSION,
} from "@/lib/compensation";

export const SalaryInformationSection = React.memo(
  function SalaryInformation() {
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const canViewCompensation = usePermissionStore((state) =>
      state.can(COMPENSATION_VIEW_PERMISSION),
    );
    const { control, watch, getValues, setValue } = useFormContext();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [tempAllowances, setTempAllowances] = React.useState<any[]>([]);
    const watchedAllowances = watch("allowances") || [];
    const watchedJobPosition = watch("job_position_id") || null;
    const watchedJobLevel = watch("job_level_id") || null;

    const formatCurrency = (value: string | number) => {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return new Intl.NumberFormat("id-ID").format(numValue);
    };

    const { replace } = useFieldArray({
      control,
      name: "allowances",
    });

    const { data: allowanceTypes } = useQuery({
      queryKey: ["allowances"],
      queryFn: getAllowanceTypes,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const { data: baseSalary } = useQuery({
      queryKey: ["base-salary", watchedJobLevel, watchedJobPosition],
      queryFn: () =>
        getBaseSalary({
          job_level_id: watchedJobLevel,
          job_position_id: watchedJobPosition,
        }),
      enabled:
        canViewCompensation && !!watchedJobPosition && !!watchedJobLevel,
    });

    React.useEffect(() => {
      if (!canViewCompensation) {
        return;
      }
      if (baseSalary?.data?.[0]?.amount) {
        setValue("base_salary", baseSalary.data[0].amount);
      } else if (watchedJobPosition && watchedJobLevel) {
        setValue("base_salary", 0);
      }
    }, [
      baseSalary?.data,
      canViewCompensation,
      setValue,
      watchedJobLevel,
      watchedJobPosition,
    ]);

    const allowanceTypesOptions = React.useMemo(() => {
      if (allowanceTypes?.data) {
        return allowanceTypes.data.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [allowanceTypes?.data]);

    const handleAddAllowance = () => {
      const newAllowance = {
        allowance_type_id: "",
        allowance_value: 0,
        allowance_name: "",
      };
      setTempAllowances((prev) => [...prev, newAllowance]);
    };

    const handleRemoveAllowance = (index: number) => {
      setTempAllowances((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveAllowances = () => {
      const validAllowances = tempAllowances.filter(
        (allowance) =>
          allowance.allowance_type_id && Number(allowance.allowance_value),
      );
      replace(validAllowances);
      setIsModalOpen(false);
    };

    const handleOpenModal = () => {
      const currentAllowances = getValues("allowances") || [];
      if (currentAllowances.length === 0) {
        setTempAllowances([
          {
            allowance_type_id: "",
            allowance_value: 0,
            allowance_name: "",
          },
        ]);
      } else {
        setTempAllowances([...currentAllowances]);
      }
      setIsModalOpen(true);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      setTempAllowances([]);
    };

    const getAllowanceTypeName = (typeId: string) => {
      const type = allowanceTypes?.data?.find(
        (item) => item.id.toString() === typeId,
      );
      return type?.name || "";
    };

    const handleAllowanceTypeChange = (index: number, typeId: string) => {
      const newAllowances = [...tempAllowances];
      newAllowances[index].allowance_type_id = typeId;
      newAllowances[index].allowance_name = getAllowanceTypeName(typeId);
      setTempAllowances(newAllowances);
    };

    const hasAllowances = watchedAllowances.length > 0;

    if (!canViewCompensation) {
      return (
        <React.Fragment>
          <h2 className="font-semibold text-lg leading-5 mb-3">
            {t("salaryInformation")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <div className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal">
                {t("baseSalary")}
              </FormLabel>
              <p className="text-sm text-text-disabled">
                {COMPENSATION_CENSORED_PLACEHOLDER}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal">
                {t("salaryNett")}
              </FormLabel>
              <p className="text-sm text-text-disabled">
                {COMPENSATION_CENSORED_PLACEHOLDER}
              </p>
            </div>
          </div>
          <Separator className="my-6" />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          {t("salaryInformation")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="flex gap-2 items-center md:col-span-2">
            <FormLabel className="text-base font-normal">
              {t("allowance")}
              <span className="text-text-disabled">({t("optionalLabel")})</span>
            </FormLabel>
            {hasAllowances && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-primary"
                    type="button"
                    onClick={handleOpenModal}
                  >
                    <Edit className="w-4 h-4" /> {t("editAllowances")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{t("editAllowances")}</DialogTitle>
                    <DialogDescription>
                      {t("editAllowancesDesc")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4 mt-4">
                    {tempAllowances.map((allowance, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-start"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">
                            {t("allowanceType")}
                          </label>
                          <select
                            className="border rounded-md p-2"
                            value={allowance.allowance_type_id}
                            onChange={(e) =>
                              handleAllowanceTypeChange(index, e.target.value)
                            }
                          >
                            <option value="">{t("selectAllowanceType")}</option>
                            {allowanceTypesOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-medium">
                              {t("allowanceValue")}
                            </label>
                            <div className="flex items-center border rounded-md">
                              <span className="px-3 text-text-disabled">
                                Rp
                              </span>
                              <input
                                type="number"
                                className="p-2 w-full outline-none"
                                value={allowance.allowance_value}
                                disabled={!allowance.allowance_type_id}
                                onChange={(e) => {
                                  const newAllowances = [...tempAllowances];
                                  newAllowances[index].allowance_value =
                                    e.target.value;
                                  setTempAllowances(newAllowances);
                                }}
                              />
                            </div>
                          </div>
                          {tempAllowances.length > 1 && (
                            <Button
                              variant="ghost"
                              className="w-fit"
                              type="button"
                              onClick={() => handleRemoveAllowance(index)}
                            >
                              <Trash />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      className="w-fit text-primary"
                      type="button"
                      onClick={handleAddAllowance}
                    >
                      <Plus /> {t("addAnotherAllowance")}
                    </Button>

                    <div className="flex gap-2 justify-end mt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleCancel}
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button type="button" onClick={handleSaveAllowances}>
                        {t("saveAllowances")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <InputForm
            name="base_salary"
            label={t("baseSalary")}
            disabled
            required
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="salary_nett"
            label={t("salaryNett")}
            required
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />

          {/* If there is no allowance display this section */}
          {!hasAllowances && (
            <div className="w-full bg-primary-background border border-primary-border rounded-xl flex flex-col gap-2 md:col-span-2 text-center items-center p-4">
              <span className="font-semibold text-primary text-base">
                {t("noAllowanceData")}
              </span>
              <span className="text-text-secondary text-sm">
                {t("selectJobLevelForAllowance")}
              </span>
              <span className="text-text-disabled">{t("orLabel")}</span>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-primary font-semibold"
                    type="button"
                    onClick={handleOpenModal}
                  >
                    <Plus /> {t("addAllowanceManually")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{t("addAllowanceManually")}</DialogTitle>
                    <DialogDescription>
                      {t("addAllowancesManuallyDesc")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4 mt-4">
                    {tempAllowances.map((allowance, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-start"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">
                            {t("allowanceType")}
                          </label>
                          <select
                            className="border rounded-md p-2"
                            value={allowance.allowance_type_id}
                            onChange={(e) =>
                              handleAllowanceTypeChange(index, e.target.value)
                            }
                          >
                            <option value="">{t("selectAllowanceType")}</option>
                            {allowanceTypesOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-medium">
                              {t("allowanceValue")}
                            </label>
                            <div className="flex items-center border rounded-md">
                              <span className="px-3 text-text-disabled">
                                Rp
                              </span>
                              <input
                                type="number"
                                className="p-2 w-full outline-none"
                                value={Number(allowance.allowance_value)}
                                disabled={!allowance.allowance_type_id}
                                onChange={(e) => {
                                  const newAllowances = [...tempAllowances];
                                  newAllowances[index].allowance_value =
                                    e.target.value;
                                  setTempAllowances(newAllowances);
                                }}
                              />
                            </div>
                          </div>
                          {tempAllowances.length > 1 && (
                            <Button
                              variant="ghost"
                              className="w-fit"
                              type="button"
                              onClick={() => handleRemoveAllowance(index)}
                            >
                              <Trash />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      className="w-fit text-primary"
                      type="button"
                      onClick={handleAddAllowance}
                    >
                      <Plus /> {t("addAnotherAllowance")}
                    </Button>

                    <div className="flex gap-2 justify-end mt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleCancel}
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button type="button" onClick={handleSaveAllowances}>
                        {t("saveAllowances")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Display allowances list and amount if allowances exist */}
          {hasAllowances && (
            <div className="w-full md:col-span-2 space-y-3">
              <div className="border border-primary-border rounded-lg p-4 flex flex-col gap-2">
                {watchedAllowances.map((allowance: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex flex-row gap-2">
                      <span className="text-base">
                        {allowance.allowance_name ||
                          getAllowanceTypeName(allowance.allowance_type_id)}
                      </span>
                      <span className="text-base">
                        : Rp {formatCurrency(allowance.allowance_value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
