import { AssessmentForm } from "./assessment-form";
import * as React from "react";
import { IAssessmentSubmission } from "@/services/employees/self-assessment/types";
import { FormProvider, useForm } from "react-hook-form";
import { AssessmentResultTable } from "./assessment-result-table";

interface AssessmentValidationProps {
  data?: IAssessmentSubmission;
}

export const AssessmentValidation = ({ data }: AssessmentValidationProps) => {
  const form = useForm({
    defaultValues: {
      fields: data?.data?.fields || [],
    },
  });

  return (
    <div className="py-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg text-black">
        Assessment Validation Result
      </h3>
      <AssessmentResultTable
        data={data?.data}
        scoreHeaderClassName="text-center"
      />
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Assessment Validation Details
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
