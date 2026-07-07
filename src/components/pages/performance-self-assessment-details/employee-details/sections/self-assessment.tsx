/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { AssessmentForm } from "./assessment-form";
import { IAssessmentSubmission } from "@/services/employees/self-assessment/types";
import { FormProvider, useForm } from "react-hook-form";
import { AssessmentResultTable } from "./assessment-result-table";

interface SelfAssessmentProps {
  data?: IAssessmentSubmission;
}

export const SelfAssessment = ({ data }: SelfAssessmentProps) => {
  const form = useForm({
    defaultValues: {
      fields: data?.data?.fields || [],
    },
  });

  return (
    <div className="py-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg text-black">
        Self Assessment Result
      </h3>
      <AssessmentResultTable data={data?.data} />
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Self Assessment Details
        </h3>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <AssessmentForm
            fields={data?.data?.fields}
            formId={data?.form_id || 0}
          />
        </form>
      </FormProvider>
    </div>
  );
};
