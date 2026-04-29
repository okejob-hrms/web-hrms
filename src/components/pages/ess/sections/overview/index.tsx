"use client";

import * as React from "react";
import { SectionLeave } from "./section-leave";
import { SectionAssessment } from "./section-assessment";
import { SectionOrganization } from "./section-org";
import { SectionOvertime } from "./section-overtime";
import { SectionOffboarding } from "./section-offboarding";
import { SectionOkr } from "./section-okr";
import { SectionBusinessTrip } from "./section-business-trip";

type EssOverviewProps = {
  overview?: string;
};

export default function EssOverview({ overview }: EssOverviewProps) {
  const content = React.useMemo(() => {
    switch (overview) {
      case "leave":
        return <SectionLeave />;
      case "okr":
        return <SectionOkr />;
      case "business-trip":
        return <SectionBusinessTrip />;
      case "organization":
        return <SectionOrganization />;
      case "assessment":
        return <SectionAssessment />;
      case "overtime":
        return <SectionOvertime />;
      case "offboarding":
        return <SectionOffboarding />;
      default:
        return <SectionLeave />;
    }
  }, [overview]);

  return <div className="font-sans min-h-screen flex flex-col">{content}</div>;
}
