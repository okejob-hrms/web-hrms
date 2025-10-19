import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as React from "react";

export const RangeField = React.memo(function RangeField() {
  return (
    <div className="col-span-2 flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-normal">
          Range Configuration<span className="text-error">*</span>
        </p>
        <div className="flex gap-2 items-center">
          <Input className="!w-20" />
          <span>-</span>
          <Input className="!w-20" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-text-secondary text-sm">Add Notes Section</span>
        <div className="flex items-center space-x-2">
          <Label
            htmlFor="notes-switch"
            className="text-base text-text-disabled"
          >
            Nonactive
          </Label>
          <Switch id="notes-switch" />
          <Label htmlFor="notes-switch" className="text-base text-primary">
            Active
          </Label>
        </div>
      </div>
    </div>
  );
});
