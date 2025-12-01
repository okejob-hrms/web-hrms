import { IAssessmentGroup } from "@/services/employees/self-assessment/types";
import * as React from "react";

interface AssessmentValidationProps {
  data?: IAssessmentGroup[];
}

export const AssessmentValidation = ({ data }: AssessmentValidationProps) => {
  return (
    <div className="py-4">
      <h3 className="font-semibold text-lg text-black">
        Assessment Validation Result
      </h3>
    </div>
  );
};
