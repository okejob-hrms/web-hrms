import * as React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxForm } from "@/components/ui/checkbox-form";
import { Form } from "@/components/ui/form";
import { TextAreaForm } from "@/components/ui/textarea";
import { InputForm } from "@/components/ui/input";
import RadioCard from "@/components/ui/radio-card";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";

import {
  getAnswerSubmissionOffboarding,
  postNotifyEmployee,
} from "@/services/employees/offboardings/exit-interview";
import { getFormById } from "@/services/form";
import { getDetailOffboarding } from "@/services/employees/offboardings";

import { ApiErrorResponse } from "@/lib/types";
import AppSkeleton from "@/components/partials/app-skeleton";
import { IFormGroup } from "@/services/form/types";

interface ExitInterviewFormProps {
  offboarding_id: number;
}

interface FormField {
  id: number;
  label: string;
  type: string;
  form_id: number;
  options?: string[] | { min: number; max: number };
  children?: React.ReactNode;
}

interface AnswerPayload {
  form_id: number;
  submitted_by: number;
}

const AlertProcess = React.memo(function AlertProcess({
  name,
  offboardingId,
}: {
  name: string;
  offboardingId: number;
}) {
  const notifyMutation = useMutation({
    mutationFn: () => postNotifyEmployee(offboardingId),
    onSuccess: () => {
      toast.success("Success notify employee");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response: Response };
        try {
          apiError.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to notify employee");
            })
            .catch(() => {
              toast.error("Failed to notify employee: Server error");
            });
        } catch (parseError) {
          toast.error(`Failed to notify employee: Server error: ${parseError}`);
        }
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to notify employee: ${errorMessage}`);
      }
    },
  });

  return (
    <div className="grid items-start w-full gap-4">
      <Alert className="flex items-center border border-primary-border bg-primary-background justify-between">
        <div>
          <AlertTitle className="text-primary font-semibold text-lg">
            Offboarding Process Initiated
          </AlertTitle>
          <AlertDescription>
            Please notify {name} to fill-in their exit form to proceed with the
            next step.
          </AlertDescription>
        </div>
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => notifyMutation.mutate()}
          disabled={notifyMutation.isPending}
        >
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

export const FormFieldRenderer = React.memo(function FormFieldRenderer({
  field,
}: {
  field: FormField;
}) {
  const renderField = () => {
    switch (field.type) {
      case "checkbox":
        return (
          <div className="mt-2">
            {Array.isArray(field.options) &&
              field.options.map((option: string) => (
                <CheckboxForm
                  key={option}
                  name={option}
                  label={option}
                  disabled
                />
              ))}
          </div>
        );

      case "textarea":
        return (
          <TextAreaForm
            data-state="disabled"
            name={field.form_id.toString()}
            label={field.label}
            disabled
            inputClassName="bg-grayscale-20 text-text-disabled"
          />
        );

      case "range":
        if (
          field.options &&
          typeof field.options === "object" &&
          !Array.isArray(field.options) &&
          "min" in field.options &&
          "max" in field.options
        ) {
          const options = field.options;
          const rangeOptions = Array.from(
            { length: options.max - options.min + 1 },
            (_, i) => options.min + i,
          );
          return (
            <div className="flex gap-2">
              {rangeOptions.map((value) => (
                <RadioCard key={value} disabled />
              ))}
            </div>
          );
        }
        return (
          <div className="flex gap-2">
            <RadioCard disabled />
          </div>
        );

      default:
        return (
          <InputForm
            name={field.form_id.toString()}
            className="mt-2"
            disabled
          />
        );
    }
  };

  return (
    <div className="rounded-sm border border-grayscale-20 p-4 gap-4 w-full">
      <span className="font-medium">{field.label}</span>
      {renderField()}
    </div>
  );
});

export const ExitInterviewForm = React.memo(function ExitInterviewForm({
  offboarding_id,
}: ExitInterviewFormProps) {
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

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["detail-offboarding", offboarding_id],
    queryFn: () => getDetailOffboarding(offboarding_id),
  });

  const { data: answer, isLoading: isLoadingAnswer } = useQuery({
    queryKey: ["answer-offboarding", offboarding_id],
    queryFn: () => {
      if (!details) {
        throw new Error("Details not available");
      }
      const answerPayload: AnswerPayload = {
        form_id: details.data.form_id,
        submitted_by: details.data.user_id,
      };
      return getAnswerSubmissionOffboarding(offboarding_id, answerPayload);
    },
    enabled: !!details?.data.form_id && !!details?.data.user_id,
  });

  const { data: forms, isLoading: isLoadingForms } = useQuery({
    queryKey: ["form", details?.data.form_id],
    queryFn: () => {
      if (!details?.data.form_id) {
        throw new Error("Form ID not available");
      }
      return getFormById(details.data.form_id);
    },
    enabled: !!details?.data.form_id,
  });

  const onSubmit = async (data: unknown) => {
    console.log("Form data:", data);
  };

  const shouldShowAlert = !answer && details?.data.user.name;
  const formGroups = forms?.data?.groups || [];

  if (isLoadingDetails || isLoadingForms || isLoadingAnswer) {
    return (
      <div className="w-full">
        <AppSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {shouldShowAlert && (
        <AlertProcess name={details.data.user.name} offboardingId={offboarding_id} />
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {formGroups.length > 0 && (
            <div className="rounded-sm border border-grayscale-20 p-4 gap-4 flex flex-col">
              {formGroups.map((group: IFormGroup) =>
                group.fields.map((field: FormField) => (
                  <FormFieldRenderer
                    key={`${field.id}-${field.label}`}
                    field={field}
                  />
                )),
              )}
            </div>
          )}

          <div className="flex gap-4">
            <CompleteOffboardingModal offboardingId={offboarding_id} />
            <CancelOffboardingModal offboardingId={offboarding_id} />
          </div>
        </form>
      </Form>
    </div>
  );
});
