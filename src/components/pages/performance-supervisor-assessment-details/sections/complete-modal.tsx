import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as React from "react";

interface Props {
  id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: number) => void;
}

export const CompleteModal: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = React.useState<string>("");
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleClose = () => {
    setSelectedOption("");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (selectedOption === "3") {
      setShowConfirmation(true);
    } else {
      onSubmit(Number(selectedOption));
      handleClose();
    }
  };

  const handleConfirmNotPromote = () => {
    onSubmit(3);
    handleClose();
  };

  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-semibold">
              Complete Supervisor Assessment
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-text-secondary">
            The employee has been decided not to be promoted. They will remain
            in their current position, and no changes will be made to their
            employment information.
          </DialogDescription>
          <DialogFooter className="w-full grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmNotPromote}
              className="bg-primary text-white"
            >
              Complete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Complete Supervisor Assessment
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-text-secondary">
          Decide from supervisor assessment results
        </DialogDescription>
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="2" id="promoted" />
            <div className="grid flex-1">
              <Label htmlFor="promoted">Promoted</Label>
              <p className="text-text-disabled text-sm">
                Employee meets performance standards and is eligible for
                promotion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="3" id="not-promoted" />
            <div className="grid flex-1">
              <Label htmlFor="not-promoted">Not Promoted</Label>
              <p className="text-text-disabled text-sm">
                Employee does not meet the required criteria for promotion at
                this time.
              </p>
            </div>
          </div>
        </RadioGroup>
        <DialogFooter className="w-full grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary text-white"
            disabled={!selectedOption}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
