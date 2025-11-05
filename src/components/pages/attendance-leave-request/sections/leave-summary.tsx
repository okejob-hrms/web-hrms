import React from "react";
import InfoList from "@/components/ui/info-list";
import { ILeaveSummary } from "../types";

interface Props {
  summary?: ILeaveSummary;
}

export default function LeaveSummary({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-2">
        <InfoList
          title="New Leave Request"
          compare="vs"
          time="yesterday"
          value={summary.new_requests.today}
        />
        <InfoList
          title="Employee On Leave Today"
          compare=""
          time=""
          value={summary.on_leave.today}
        />
      </div>
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-2">
        <InfoList
          title="Waiting for Approval"
          compare="vs"
          time="yesterday"
          value={summary.pending}
        />
        <InfoList
          title="Approved Leave Request"
          compare=""
          time=""
          value={summary.approved}
        />
        <InfoList
          title="Rejected Leave Request"
          compare=""
          time=""
          value={summary.rejected}
        />
      </div>
    </div>
  );
}
