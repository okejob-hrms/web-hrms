/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { Form } from "@/components/ui/form";
import RadioCard from "@/components/ui/radio-card";
import { TextAreaForm } from "@/components/ui/textarea";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";
import { getDetailOffboarding } from "@/services/employees/offboardings";
import { useQuery } from "@tanstack/react-query";
import { getFormById } from "@/services/form";
import { InputForm } from "@/components/ui/input";

interface Props {
  offboarding_id: number;
}

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

export const ExitInterviewForm = React.memo(function ExitInterviewForm({
  offboarding_id,
}: Props) {
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

  const { data: details } = useQuery({
    queryKey: ["detail-offboarding", offboarding_id],
    queryFn: () => getDetailOffboarding(offboarding_id),
  });

  const { data: forms } = useQuery({
    queryKey: ["form", details?.form_id],
    queryFn: () => getFormById(details!.form_id),
    enabled: !!details?.form_id,
  });

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <AlertProcess />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
            {forms?.data.fields.map((item) => (
              <div
                className="rounded-sm border border-grayscale-20 p-4 gap-4"
                key={`${item.id}-${item.label}`}
              >
                <span className="font-medium">{item.label}</span>
                {item.type === "checkbox" ? (
                  <div className="mt-2">
                    {item.options.map((item) => (
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
                ) : item.type === "textarea" ? (
                  <TextAreaForm
                    data-state="disabled"
                    name={item.form_id.toString()}
                    label={item.label}
                    disabled
                    inputClassName="bg-grayscale-20 text-text-disabled"
                  />
                ) : item.type === "range" ? (
                  <div className="flex gap-2">
                    <RadioCard disabled />
                  </div>
                ) : (
                  <InputForm name={item.form_id.toString()} className="mt-2" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <CompleteOffboardingModal offboardingId={offboarding_id} />
            <CancelOffboardingModal offboardingId={offboarding_id} />
          </div>
        </form>
      </Form>
    </div>
  );
});
