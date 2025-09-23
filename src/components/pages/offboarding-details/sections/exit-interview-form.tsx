import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { Form } from "@/components/ui/form";
import RadioCard from "@/components/ui/radio-card";
import { Textarea, TextAreaForm } from "@/components/ui/textarea";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";

export const AlertProcess = React.memo(function InterviewScheduleForm() {
  return (
    <div className="grid items-start w-full gap-4">
      <Alert className="flex items-center border border-primary-border bg-primary-background justify-between">
        <div>
          <AlertTitle className="text-primary font-semibold text-lg">
            Offboarding Process Initiated
          </AlertTitle>
          <AlertDescription>
            Please notify [employee-name] to fill-in their exit form to proceed
            with the next step.
          </AlertDescription>
        </div>
        <Button variant="outline" className="bg-white">
          <Image
            src="/icons/activity.svg"
            width={18}
            height={18}
            alt="notify"
          />
          Notify Employee
        </Button>
      </Alert>
    </div>
  );
});

export const ExitInterviewForm = React.memo(function ExitInterviewForm() {
  const form = useForm({
    defaultValues: {
      opportunity: false,
      salary: false,
      work: false,
      relationship: false,
      family: false,
      others: { checked: false, childValue: "" },
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  const options = [
    {
      name: "opportunity",
      label: "Better career opportunity (promotion & role expansion)",
    },
    {
      name: "salary",
      label: "Salary/Compensation",
    },
    {
      name: "work",
      label: "Work-life balance",
    },
    {
      name: "relationship",
      label: "Relationship with supervisor/colleagues",
    },
    {
      name: "family",
      label: "Relocation / Family reason",
    },
    {
      name: "others",
      label: "Others",
      children: (value: string, onChange: (value: string) => void) => (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 bg-grayscale-20"
          disabled
        />
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <AlertProcess />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4">
              <span className="font-medium">1. Reason for Leaving</span>
              <div className="mt-2">
                {options.map((item) => (
                  <CheckboxForm
                    key={item.name}
                    name={item.name}
                    label={item.label}
                    disabled
                  >
                    {item.children}
                  </CheckboxForm>
                ))}
              </div>
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">2. Compensation & Benefit</span>
              <div className="flex gap-2">
                <RadioCard disabled />
              </div>
              <TextAreaForm
                data-state="disabled"
                name="compensationNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">3. Work Environment</span>
              <div className="flex gap-2">
                <RadioCard disabled />
              </div>
              <TextAreaForm
                data-state="disabled"
                name="environmentNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">
                4. Relationship with Supervisor
              </span>
              <div className="flex gap-2">
                <RadioCard disabled />
              </div>
              <TextAreaForm
                data-state="disabled"
                name="relationshipNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">5. Career Development</span>
              <div className="flex gap-2">
                <RadioCard disabled />
              </div>
              <TextAreaForm
                data-state="disabled"
                name="careerNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">6. Company Strengths</span>
              <TextAreaForm
                data-state="disabled"
                name="strengthsNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">7. Company Weakness</span>
              <TextAreaForm
                data-state="disabled"
                name="weaknessNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">8. Suggestion for Improvement</span>
              <TextAreaForm
                data-state="disabled"
                name="suggestionNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              <span className="font-medium">9. Final Comments</span>
              <TextAreaForm
                data-state="disabled"
                name="finalNotes"
                label="Notes"
                disabled
                inputClassName="bg-grayscale-20 text-text-disabled"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" variant="outline">
              Complete Offboarding Process
            </Button>
            <Button
              variant="ghost"
              className="text-error hover:bg-error-background hover:text-error"
            >
              Cancel Offboarding Process
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});
