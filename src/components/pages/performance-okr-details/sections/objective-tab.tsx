import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Edit2, Ellipsis, Plus, Search, Trash } from "lucide-react";
import { useOKRDetails } from "../hook";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringAvatar } from "@/lib/utils";
import { LinearProgress } from "@/components/ui/progress";
import { FormObjective } from "./form-objective";
import { FormKpi } from "./form-kpi";
import { IOKRKeyResult, IOKRObjective } from "@/services/okr/types";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getStatusOKRCycle } from "@/lib/helpers";

dayjs.extend(relativeTime);

interface CardObjectiveProps {
  objective: IOKRObjective;
  onNewKpi: () => void;
  handleRenameObjective: (objective: IOKRObjective) => void;
}

interface CardKeyResultProps {
  keyResult: IOKRKeyResult;
}

const CardKeyResult = ({ keyResult }: CardKeyResultProps) => {
  const {
    searchKPI,
    setSearchKPI,
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
    kpiOptions,
  } = useOKRDetails();
  return (
    <div className="flex flex-col gap-2 p-4 w-full">
      <div className="flex flex-row gap-1.5 items-center justify-between">
        <div className="flex flex-col">
          <span className="text-grayscale-50 font-semibold">KEY RESULT</span>
          <span className="text-text-disabled text-sm">
            updated {dayjs(keyResult.updated_at).fromNow()}
          </span>
        </div>
        <div className="flex flex-row gap-1">
          <Badge variant="outline">{keyResult.status_label}</Badge>
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {keyResult.assignments.length > 0 ? (
              keyResult.assignments.map((assignment) => (
                <Avatar className="h-10 w-10 border border-white">
                  <AvatarImage src={assignment.avatar_url || ""} />
                  <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                    {stringAvatar(assignment.name)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <Avatar className="h-10 w-10 border border-white">
                <AvatarImage src="" />
                <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                  {stringAvatar("")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 items-center justify-between">
        <span>{keyResult.title}</span>
        {/* <Button size="sm" variant="ghost" onClick={() => setOpenFormKpi(true)}>
          <Edit />
        </Button> */}
      </div>
      <LinearProgress value={keyResult.progress} />
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
        kpiOptions={kpiOptions}
        searchKPI={searchKPI}
        onSearchKPIChange={setSearchKPI}
      />
    </div>
  );
};

const CardObjective = ({
  onNewKpi,
  objective,
  handleRenameObjective,
}: CardObjectiveProps) => {
  const keyResults = objective.key_results;
  const status = getStatusOKRCycle(objective.status_label);
  return (
    <div className="border border-grayscale-20 rounded-md shadow-sm w-full md:min-w-[418px] h-fit">
      <div className="flex flex-row justify-between items-center p-4">
        <div className="flex flex-col">
          <span className="text-primary font-semibold">Objective</span>
          <span className="text-black font-semibold">{objective.title}</span>
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
          {status.label === "Draft" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Ellipsis className="text-grayscale-30" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => handleRenameObjective(objective)}
                    className="flex gap-2 w-full text-left"
                  >
                    <Edit2 className="w-4 h-4" />
                    Rename
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => {
                      // handleDelete();
                    }}
                    className="flex gap-2 w-full text-left"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Separator />
      {keyResults.length > 0 ? (
        keyResults.map((item) => (
          <CardKeyResult key={item.id} keyResult={item} />
        ))
      ) : (
        <div className="p-4">
          <Button size="lg" className="w-full" onClick={onNewKpi}>
            <Plus /> Define Key Result
          </Button>
        </div>
      )}
    </div>
  );
};

export const ObjectiveTab = () => {
  const {
    searchOKR,
    setSearchOKR,
    searchKPI,
    setSearchKPI,
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
    kpiOptions,
    handleSaveObjective,
    detailOKRCycle,
    handleOpenKeyResultForm,
    handleShowEditObjective,
    selectedObjective,
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
          {detailOKRCycle?.data.objectives.map((objective) => (
            <CardObjective
              key={objective.id}
              onNewKpi={() => handleOpenKeyResultForm(objective.id)}
              objective={objective}
              handleRenameObjective={() => handleShowEditObjective(objective)}
            />
          ))}
        </div>
      </div>

      <FormObjective
        open={openFormObjective}
        onOpenChange={setOpenFormObjective}
        onCreate={(data: { title: string }) => handleSaveObjective(data)}
        defaultValues={
          selectedObjective ? { title: selectedObjective.title } : undefined
        }
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
        kpiOptions={kpiOptions}
        searchKPI={searchKPI}
        onSearchKPIChange={setSearchKPI}
      />
    </div>
  );
};
