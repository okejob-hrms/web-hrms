import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Ellipsis, FileDown, Play, Trash } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { OKRTab } from "./sections/tab";
import { CircularProgress } from "@/components/ui/progress";
import { useOKRDetails } from "./hook";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import { InitiateModal } from "./sections/initiate-modal";
import { DeleteModal } from "./sections/delete-modal";

export const PerformanceOKRDetails = () => {
  const {
    detailOKRCycle,
    isLoadingDetailOKRCycle,
    setOpenInitiateOKR,
    openInitiateOKR,
    id,
    handleInitiateOKR,
    openDeleteOKR,
    setOpenDeleteOKR,
    handleDeleteOKR,
    status,
  } = useOKRDetails();

  if (!detailOKRCycle?.data && !isLoadingDetailOKRCycle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-gray-100 p-6">
              <FileDown className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              OKR Cycle Not Found
            </h2>
            <p className="text-gray-500 text-base">
              The OKR cycle you're looking for doesn't exist or has been
              removed. Please check the URL or return to the OKR cycles list.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = "/performance/okr")}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors"
            >
              View All OKR Cycles
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingDetailOKRCycle) {
    return <Skeleton />;
  }

  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="font-semibold text-4xl">{detailOKRCycle?.data?.name}</h1>
        <StatusBadge
          statusKey={status.key}
          variant={status.variant}
          className={status.className}
          circleClassName={status.circleClassName}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Ellipsis className="text-grayscale-30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <button
                onClick={() => {
                  // handleDetail();
                }}
                className="flex gap-2 w-full text-left"
              >
                <FileDown className="w-4 h-4" />
                Export OKR
              </button>
            </DropdownMenuItem>
            {
              status.key !== "active" && (
                <>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => {
                        // handleEdit();
                      }}
                      className="flex gap-2 w-full text-left"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit OKR
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => {
                        setOpenDeleteOKR(true);
                      }}
                      className="flex gap-2 w-full text-left"
                    >
                      <Trash className="w-4 h-4" />
                      Delete OKR
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => {
                        setOpenInitiateOKR(true);
                      }}
                      className="flex gap-2 w-full text-left"
                    >
                      <Play className="w-4 h-4" />
                      Initiate OKR
                    </button>
                  </DropdownMenuItem>
                </>
              )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">
            {dayjs(detailOKRCycle?.data.start_date).format("MMMM DD, YYYY")}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">End Date</span>
          <span className="text-base">
            {dayjs(detailOKRCycle?.data.end_date).format("MMMM DD, YYYY")}
          </span>
        </div>
        <div className="border border-grayscale-10 rounded-xs px-4 py-2 flex justify-between items-center col-span-2 md:col-span-1">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base text-black">
              Overall Achievement
            </span>
            <span className="text-text-secondary text-xs">
              Average progres from overall achievement
            </span>
          </div>
          <CircularProgress
            value={Number(detailOKRCycle?.data.overall_progress)}
            size={120}
            strokeWidth={10}
            showLabel
            labelClassName="text-xl font-bold"
            renderLabel={(progress) => `${progress}%`}
          />
        </div>
        <div className="border border-grayscale-10 rounded-xs p-4 grid grid-cols-3 gap-4 col-span-2 md:col-span-1 items-center">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-primary-border rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                {detailOKRCycle?.data.key_results.total}
              </span>
              <span className="text-text-disabled text-sm">
                Total Key Result
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-warning rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                {detailOKRCycle?.data.key_results.active}
              </span>
              <span className="text-text-disabled text-sm">
                Open Key Result
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-success rounded-xs"></div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-text-secondary">
                {detailOKRCycle?.data.key_results.done}
              </span>
              <span className="text-text-disabled text-sm">
                Completed Key Result
              </span>
            </div>
          </div>
        </div>
      </div>
      <OKRTab />
      <InitiateModal
        open={openInitiateOKR}
        onOpenChange={setOpenInitiateOKR}
        onSubmit={handleInitiateOKR}
        id={id!}
      />
      <DeleteModal
        open={openDeleteOKR}
        onOpenChange={setOpenDeleteOKR}
        onSubmit={handleDeleteOKR}
        id={id!}
      />
    </div>
  );
};
