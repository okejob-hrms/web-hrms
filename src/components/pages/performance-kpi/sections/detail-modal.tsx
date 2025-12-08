import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IKPIDetails } from "@/services/performances/kpi/types";
import * as React from "react";

interface IDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IKPIDetails | undefined;
}

export const DetailModal: React.FC<IDetailModalProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            KPI Details
          </DialogTitle>
        </DialogHeader>
        {!data ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Loading KPI details...
          </div>
        ) : (
          <>
            <div className="px-6">
              <h2 className="text-base font-semibold mb-4">KPI Information</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-text-disabled text-sm">KPI Name</span>
                  <span className="text-foreground">{data?.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-text-disabled text-sm">
                    Description
                  </span>
                  <span className="text-foreground">{data?.description || "-"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-text-disabled text-sm">Target</span>
                    <span className="text-foreground">{data?.target}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-text-disabled text-sm">
                      Direction
                    </span>
                    <span className="text-foreground">{data?.direction}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-text-disabled text-sm">
                      Frequency
                    </span>
                    <span className="text-foreground">{data?.frequency}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6">
              <h2 className="text-base font-semibold mb-4">Assignee</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-text-disabled text-sm">
                    Job Position
                  </span>
                  <div className="flex flex-wrap gap-2">
										{data.job_positions.map((position) => (
											<div
												key={position.id}
												className="bg-primary-focused rounded-full py-1 px-1.5 w-fit"
											>
												<span className="text-primary text-sm">{position.name}</span>
											</div>
										))}
									</div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-text-disabled text-sm">Job Level</span>
                  <div className="flex flex-wrap gap-2">
										{data.job_levels.map((level) => (
											<div
												key={level.id}
												className="bg-primary-focused rounded-full py-1 px-1.5 w-fit"
											>
												<span className="text-primary text-sm">{level.name}</span>
											</div>
										))}
									</div>
                </div>
              </div>
            </div>
          </>
        )}
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
