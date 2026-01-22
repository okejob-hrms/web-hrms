import * as React from "react";
import { DetailLeaveForm } from "./detail-leave-form";
import { SectionAssessmentDetail } from "./section-assessment-detail";

import { useSearchParams } from "next/navigation";
import { useESS } from "../../../hook";
import { ExitInterviewForm } from "@/components/pages/offboarding/employee-view/sections/exit-interview-form";
import WorkHandover from "@/components/pages/offboarding/employee-view/sections/work-handover-form";
import DocumentHandover from "@/components/pages/offboarding/employee-view/sections/document-handover-form";

type EssOverviewDetailProps = {
  overview?: string;
  section?: string;
  id?: string;
};

export default function EssOverviewDetail({
  overview,
  section,
  id,
}: EssOverviewDetailProps) {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const { offboardingData } = useESS();

  const content = React.useMemo(() => {
    if (section === "assessment" && id) {
      return (
        <SectionAssessmentDetail
          assessmentId={id}
          formId={formId ? Number(formId) : undefined}
        />
      );
    }

    if (section === "offboarding" && id) {
      switch (id) {
        case 'exit-interview':
          return (
            <ExitInterviewForm
              formId={offboardingData?.form_id} 
              offboardingId={offboardingData?.id}
            />
          );
        case 'work-handover':
          return <WorkHandover />;
        case 'document-handover':
          return <DocumentHandover />;
        default:
          return <div className="p-10 text-center">Page not found</div>;
      }
    }

    switch (overview) {
      case "leave-form":
        return <DetailLeaveForm />;
      default:
        return <DetailLeaveForm />;
    }
  }, [overview, section, id]);

  return <div className="font-sans min-h-screen flex flex-col">{content}</div>;
}
