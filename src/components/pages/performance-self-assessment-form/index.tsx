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

export const PerformanceSelfAssessmentForm = React.memo(
  function PerformanceSelfAssessmentForm() {
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
      totalEmployees,
      handleCancel,
    } = usePerformanceSelfAssessmentForm();

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h2 className="font-semibold text-lg text-black">Assessment Details</h2>
        <Form {...form}>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              // form.handleSubmit(handleSubmit)();
            }}
          >
            <SelectForm
              name="period"
              options={periodOptions}
              required
              label="Assessment Period"
            />
            <InputForm label="Year" name="year" required />
            <DatePicker
              name="start_date"
              label="Start Date"
              className="md:col-start-1"
            />
            <DatePicker name="end_date" label="End Date" />
            <SelectForm
              name="reminder"
              options={sendReminderOptions}
              required
              label="Send Reminder"
            />
            <div className="md:col-span-3 flex gap-2 items-center mt-2">
              <h2 className="font-semibold text-lg text-black">Participants</h2>
              <div className="rounded-full bg-primary-background py-1 px-1.5 text-primary text-xs">
                <span>
                  {totalSelectedParticipants} / {totalEmployees} Employee
                  Assigned
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
                    label="Assessment Form"
                  />
                </div>
                {assessmentFormItem.selectedParticipants.length > 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col text-text-disabled">
                      <span className="text-sm">Assigned Participant</span>
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
                      Edit Participant
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteAssessmentForm(index)}
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
                    Assign Participant
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
              Add Participant
            </Button>
            <div className="flex gap-2 my-8 justify-between md:col-start-1 md:justify-start w-full">
              <Button
                variant="outline"
                className="md:max-w-36 w-[50%]"
                type="button"
                // disabled={isPendingAddAssessment}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                // onClick={() => {
                // 	form.handleSubmit(handleSubmit)();
                // }}
                // isLoading={isPendingAddAssessment}
                className="w-[50%]"
              >
                Create Assessment
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
        />
      </div>
    );
  },
);
