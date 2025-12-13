import { Input } from "@/components/ui/input";
import { Edit, Ellipsis, Plus, Search } from "lucide-react";
import { useOKRDetails } from "../hook";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { LinearProgress } from "@/components/ui/progress";
import { FormObjective } from "./form-objective";
import { FormKpi } from "./form-kpi";

interface CardGroupProps {
  onNewKpi: () => void;
}

const CardItem = () => {
  return (
    <div className="flex flex-col gap-2 p-4 w-full">
      <div className="flex flex-row gap-1.5 items-center justify-between">
        <div className="flex flex-col">
          <span className="text-grayscale-50 font-semibold">KEY RESULT</span>
          <span className="text-text-disabled text-sm">updated 1h ago</span>
        </div>
        <div className="flex flex-row gap-1">
          <Badge variant="outline">Behind</Badge>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex gap-1">
        <span>
          Mengurangi waktu henti mesin per minggu hingga di bawah 2 jam
        </span>
        <Button size="sm" variant="ghost">
          <Edit />
        </Button>
      </div>
      <LinearProgress value={20} />
    </div>
  );
};

const CardGroup = ({ onNewKpi }: CardGroupProps) => {
  return (
    <div className="border border-grayscale-20 rounded-md shadow-sm w-full md:min-w-[418px] h-fit">
      <div className="flex flex-row gap-1.5 items-center p-4">
        <div className="flex flex-col">
          <span className="text-primary font-semibold">Objective</span>
          <span className="text-black font-semibold">
            Meningkatkan efisiensi proses produksi di lini 1 dan 2
          </span>
        </div>
        <div className="flex flex-row gap-1">
          <Button
            size="sm"
            className="px-2! py-1!"
            variant="outline"
            onClick={onNewKpi}
          >
            <Plus />
          </Button>
          <Button size="sm" className="px-2! py-1!" variant="ghost">
            <Ellipsis />
          </Button>
        </div>
      </div>
      <Separator />
      <CardItem />
      <CardItem />
    </div>
  );
};

export const OKRDetailTab = () => {
  const {
    searchOKR,
    setSearchOKR,
    openFormObjective,
    setOpenFormObjective,
    openFormKpi,
    setOpenFormKpi,
    formKpi,
    handleSaveKpi,
    frequencyOptions,
    formatOptions,
    jobPositionOptions,
    jobLevelOptions,
    aggregationOptions,
    directionOptions,
  } = useOKRDetails();
  return (
    <div>
      <Input
        placeholder="Search"
        icon={<Search className="size-5 text-grayscale-20" />}
        iconPosition="right"
        value={searchOKR}
        onChange={(e) => setSearchOKR(e.target.value)}
        className="md:max-w-[320px]"
      />
      <div className="py-4 px-2 flex flex-col gap-4 w-full overflow-auto">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="border border-dashed border-primary-border shadow-sm rounded-md bg-primary-background flex flex-col items-center justify-center gap-2 w-full md:min-w-[418px] min-h-[560px]">
            <Button
              className="bg-primary rounded-md py-6! px-4!"
              onClick={() => setOpenFormObjective(true)}
            >
              <Plus className="text-white size-6" />
            </Button>
            <span className="font-semibold">Add New Objective</span>
          </div>
          <CardGroup onNewKpi={() => setOpenFormKpi(true)} />
          <CardGroup onNewKpi={() => setOpenFormKpi(true)} />
          <CardGroup onNewKpi={() => setOpenFormKpi(true)} />
        </div>
      </div>

      <FormObjective
        open={openFormObjective}
        onOpenChange={setOpenFormObjective}
        onCreate={() => {}}
      />
      <FormKpi
        open={openFormKpi}
        onOpenChange={setOpenFormKpi}
        form={formKpi}
        onSave={handleSaveKpi}
        frequencyOptions={frequencyOptions}
        formatOptions={formatOptions}
        jobPositionOptions={jobPositionOptions}
        jobLevelOptions={jobLevelOptions}
        aggregationOptions={aggregationOptions}
        directionOptions={directionOptions}
      />
    </div>
  );
};
