"use client";

import * as React from "react";
import { SectionLeave } from "./section-leave";
import { SectionAssessment } from "./section-assessment";
import { SectionOrganization } from "./section-org";
import { SectionOvertime } from "./section-overtime";
import { SectionOffboarding } from "./section-offboarding";
import { SectionOkr } from "./section-okr";
import { SectionBusinessTrip } from "./section-business-trip";
import { SectionApprovals } from "./section-approvals";
import { SectionTeamRoster } from "./section-team-roster";
import { SectionAttendance } from "./section-attendance";
import { SectionProfile } from "./section-profile";

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
      case "approvals":
        return <SectionApprovals />;
      case "organization":
        return <SectionOrganization />;
      case "assessment":
        return <SectionAssessment />;
      case "overtime":
        return <SectionOvertime />;
      case "offboarding":
        return <SectionOffboarding />;
      case "team-roster":
        return <SectionTeamRoster />;
      case "attendance":
        return <SectionAttendance />;
      case "profile":
        return <SectionProfile />;
      default:
        return <SectionLeave />;
    }
  }, [overview]);

  return <div className="font-sans min-h-screen flex flex-col">{content}</div>;
}
