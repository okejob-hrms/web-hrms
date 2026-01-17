import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDetailsPenalty } from "@/services/employees/penalties";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/helpers";

interface PenaltyDetailModalProps {
  penaltyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PenaltyDetailModal({
  penaltyId,
  open,
  onOpenChange,
}: PenaltyDetailModalProps) {
  const { data: penaltyData, isLoading } = useQuery({
    queryKey: ["penalty-detail", penaltyId],
    queryFn: () => getDetailsPenalty(penaltyId!),
    enabled: !!penaltyId && open,
  });

  const penalty = penaltyData?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Penalty Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : penalty ? (
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div>
              <div className="text-sm text-gray-500">Point</div>
              <div>{penalty.point}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div>{penalty.name}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Description</div>
              <div>{penalty.description}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Valid Until</div>
              <div>
                {penalty.valid_until
                  ? formatDateTime(penalty.valid_until).date
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Created At</div>
              <div>{formatDateTime(penalty.created_at).date}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Updated At</div>
              <div>{formatDateTime(penalty.updated_at).date}</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No details found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
