import * as React from "react";
import { DetailLeaveForm } from "./detail-leave-form";
import { SectionAssessmentDetail } from "./section-assessment-detail";

import { useSearchParams } from "next/navigation";

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

  const content = React.useMemo(() => {
    if (section === "assessment" && id) {
      return (
        <SectionAssessmentDetail
          assessmentId={id}
          formId={formId ? Number(formId) : undefined}
        />
      );
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
