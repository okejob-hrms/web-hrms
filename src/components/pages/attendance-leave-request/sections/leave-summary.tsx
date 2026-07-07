import React from 'react';
import { useTranslations } from 'next-intl';
import InfoList from '@/components/ui/info-list';
import { ILeaveSummary } from '../types';

interface Props {
  summary?: ILeaveSummary;
}

export default function LeaveSummary({ summary }: Props) {
  const t = useTranslations('attendance');

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-2">
        <InfoList
          title={t('newLeaveRequest')}
          compare="vs"
          time="yesterday"
          value={summary.new_requests.today}
        />
        <InfoList
          title={t('employeeOnLeaveToday')}
          compare=""
          time=""
          value={summary.on_leave.today}
        />
      </div>
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-2">
        <InfoList
          title={t('waitingForApproval')}
          compare="vs"
          time="yesterday"
          value={summary.pending}
        />
        <InfoList
          title={t('approvedLeaveRequest')}
          compare=""
          time=""
          value={summary.approved}
        />
        <InfoList
          title={t('rejectedLeaveRequest')}
          compare=""
          time=""
          value={summary.rejected}
        />
      </div>
    </div>
  );
}
