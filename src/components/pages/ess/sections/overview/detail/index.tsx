"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { DetailLeaveForm } from "./detail-leave-form";
import { SectionAssessmentDetail } from "./section-assessment-detail";
import { SectionAssessmentValidate } from "./section-assessment-validate";
import { SectionAssessmentLanding } from "../section-assessment-landing";
import { EssOkrDetail } from "../section-okr-detail";

import { useSearchParams } from "next/navigation";
import { useESS } from "../../../hook";
import { ExitInterviewForm } from "@/components/pages/offboarding/employee-view/sections/exit-interview-form";
import WorkHandover from "@/components/pages/offboarding/employee-view/sections/work-handover-form";
import DocumentHandover from "@/components/pages/offboarding/employee-view/sections/document-handover-form";

type EssOverviewDetailProps = {
  overview?: string;
  section?: string;
  id?: string;
  action?: string;
};

export default function EssOverviewDetail({
  overview,
  section,
  id,
  action,
}: EssOverviewDetailProps) {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const { offboardingData } = useESS();
  const t = useTranslations("ess");

  const content = React.useMemo(() => {
    if (section === "okr" && id && /^\d+$/.test(id)) {
      return <EssOkrDetail cycleId={Number(id)} />;
    }

    if (section === "assessment" && id) {
      if (action === "form") {
        return (
          <SectionAssessmentDetail
            assessmentId={id}
            formId={formId ? Number(formId) : undefined}
          />
        );
      }
      if (action === "validate") {
        return (
          <SectionAssessmentValidate
            memberEsaId={id}
            formId={formId ? Number(formId) : undefined}
          />
        );
      }
      return <SectionAssessmentLanding assessmentId={id} />;
    }

    if (section === "offboarding" && id) {
      switch (id) {
        case "exit-interview":
          return (
            <ExitInterviewForm
              formId={offboardingData?.form_id}
              offboardingId={offboardingData?.id}
            />
          );
        case "work-handover":
          return <WorkHandover />;
        case "document-handover":
          return <DocumentHandover />;
        default:
          return (
            <div className="p-10 text-center">{t("pageNotFound")}</div>
          );
      }
    }

    switch (overview) {
      case "leave-form":
        return <DetailLeaveForm />;
      default:
        return <DetailLeaveForm />;
    }
  }, [overview, section, id, action, formId, offboardingData, t]);

  return <div className="font-sans min-h-screen flex flex-col">{content}</div>;
}
