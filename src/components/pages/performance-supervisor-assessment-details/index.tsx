import * as React from "react";
import { EmployeeDetailsSection } from "./sections/employee-details";
import { SupervisorAssessmentTab } from "./sections/tab";
import { useSupervisorAssessmentDetails } from "./hook";
import AppSkeleton from "@/components/partials/app-skeleton";
import { Button } from "@/components/ui/button";
import { CancelModal } from "./sections/cancel-modal";

interface Props {
  id: number;
}

export const SupervisorAssessmentDetails = React.memo(
  function SupervisorAssessmentDetailsPage({ id }: Props) {
    const {
      employeeDetails,
      isLoadingEmployeeDetails,
      isErrorEmployeeDetails,
      openCancelModal,
      setOpenCancelModal,
      onCancelAssessment,
    } = useSupervisorAssessmentDetails(id);

    if (isLoadingEmployeeDetails) {
      return <AppSkeleton />;
    }

    if (isErrorEmployeeDetails || !employeeDetails) {
      return <div>Employee data not found</div>;
    }

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <EmployeeDetailsSection data={employeeDetails?.data} />
        <SupervisorAssessmentTab id={id} />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-primary">
            Complete Assessment Proses
          </Button>
          <Button
            variant="ghost"
            className="text-error"
            onClick={() => setOpenCancelModal(true)}
          >
            Cancel Supervisor Assessment
          </Button>
        </div>
        <CancelModal
          id={id}
          open={openCancelModal}
          onOpenChange={setOpenCancelModal}
          onSubmit={onCancelAssessment}
        />
      </div>
    );
  },
);
