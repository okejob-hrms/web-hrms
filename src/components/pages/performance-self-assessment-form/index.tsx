"use client";

import * as React from "react";
import { usePerformanceSelfAssessmentForm } from "./hook";
import { Form } from "@/components/ui/form";
import { SelectForm } from "@/components/ui/select-form";
import { InputForm } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { IdCardLanyard, Plus } from "lucide-react";
import { ParticipantListModal } from "./sections/participant-list-modal";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const PerformanceSelfAssessmentForm = React.memo(
  function PerformanceSelfAssessmentForm() {
    const t = useTranslations("performance");
    const tCommon = useTranslations("common");
    const {
      form,
      periodOptions,
      sendReminderOptions,
      assessmentFormOptions,
      handleOpenParticipant,
      handleCloseParticipant,
      isParticipantModalOpen,
      assessmentForms,
      handleAddAssessmentForm,
      handleDeleteAssessmentForm,
      totalSelectedParticipants,
      currentFormIndex,
      handleUpdateSelectedParticipants,
      handleCancel,
      handleSubmit,
      isPendingAddAssessment,
      isEditMode,
      isLoadingDetails,
      employeeList,
      isLoadingEmployees,
      pagination,
      handlePaginationChange,
      handleSearchChange,
      filters,
      totalEmployees,
      lockedParticipantIds,
    } = usePerformanceSelfAssessmentForm();

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h2 className="font-semibold text-lg text-black">
          {isEditMode ? t("editAssessmentDetails") : t("assessmentDetails")}
        </h2>
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <SelectForm
              name="period"
              options={periodOptions}
              required
              label={t("assessmentPeriod")}
              disabled={isLoadingDetails}
            />
            <InputForm
              label={t("year")}
              name="year"
              required
              disabled={isLoadingDetails}
            />
            <DatePicker
              name="start_date"
              label={t("startDate")}
              className="md:col-start-1"
              disabled={isLoadingDetails}
            />
            <DatePicker
              name="end_date"
              label={t("endDate")}
              disabled={isLoadingDetails}
            />
            <SelectForm
              name="reminder"
              options={sendReminderOptions}
              required
              label={t("sendReminder")}
              disabled={isLoadingDetails}
            />
            <div className="md:col-span-3 flex gap-2 items-center mt-2">
              <h2 className="font-semibold text-lg text-black">
                {t("participants")}
              </h2>
              <div className="rounded-full bg-primary-background py-1 px-1.5 text-primary text-xs">
                <span>
                  {t("employeesAssigned", {
                    assigned: totalSelectedParticipants,
                    total: totalEmployees ?? 0,
                  })}
                </span>
              </div>
            </div>
            {assessmentForms.map((assessmentFormItem, index) => (
              <div
                key={assessmentFormItem.id}
                className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
              >
                <div className="md:col-span-2">
                  <SelectForm
                    name={`assessment_form_${assessmentFormItem.id}`}
                    options={assessmentFormOptions}
                    required
                    label={t("assessmentForm")}
                  />
                </div>
                {assessmentFormItem.selectedParticipants.length > 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col text-text-disabled">
                      <span className="text-sm">{t("assignedParticipant")}</span>
                      <span className="text-sm">
                        {assessmentFormItem.selectedParticipants.length} /{" "}
                        {totalEmployees}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleOpenParticipant(index)}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      <Image
                        src="/icons/editBlue.svg"
                        alt="edit"
                        width={20}
                        height={20}
                      />
                      {t("editParticipant")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteAssessmentForm(index)}
                      type="button"
                    >
                      <Image
                        src="/icons/deleteOutlined.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleOpenParticipant(index)}
                    type="button"
                  >
                    <IdCardLanyard />
                    {t("assignParticipant")}
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={handleAddAssessmentForm}
              variant="ghost"
              size="lg"
              className="text-primary text-left hover:text-white"
              type="button"
            >
              <Plus />
              {t("addParticipant")}
            </Button>
            <div className="flex gap-2 my-8 justify-between md:col-start-1 md:justify-start w-full">
              <Button
                variant="outline"
                className="md:max-w-36 w-[50%]"
                type="button"
                disabled={isPendingAddAssessment}
                onClick={handleCancel}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isPendingAddAssessment}
                className="w-[50%]"
                disabled={isLoadingDetails}
              >
                {isEditMode ? t("updateAssessment") : t("createAssessment")}
              </Button>
            </div>
          </form>
        </Form>

        <ParticipantListModal
          isOpen={isParticipantModalOpen}
          onClose={handleCloseParticipant}
          currentFormIndex={currentFormIndex}
          assessmentForms={assessmentForms}
          onUpdateSelectedParticipants={handleUpdateSelectedParticipants}
          employeeList={employeeList}
          isLoadingEmployees={isLoadingEmployees}
          pagination={pagination}
          handlePaginationChange={handlePaginationChange}
          handleSearchChange={handleSearchChange}
          filters={filters}
          totalEmployees={totalEmployees}
          lockedParticipantIds={lockedParticipantIds}
        />
      </div>
    );
  },
);
