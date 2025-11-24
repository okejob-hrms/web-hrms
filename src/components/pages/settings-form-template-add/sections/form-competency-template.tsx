import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { InputForm } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LibraryForm = React.memo(function LibraryForm() {
  const competencyOptions = [
    {
      value: "ach",
      label: "[ACH] Achievement Orientation",
    },
    {
      value: "com",
      label: "[COM] Communication",
    },
    {
      value: "dec",
      label: "[DEC] Decision Making",
    },
    {
      value: "ini",
      label: "[INI] Initiative",
    },
    {
      value: "org",
      label: "[ORG] Organization Orientation",
    },
    {
      value: "pro",
      label: "[PRO] Problem Solving",
    },
    {
      value: "rel",
      label: "[REL] Relationship Management",
    },
    {
      value: "str",
      label: "[STR] Strategic Thinking",
    },
  ];

  const dimensionOptions = [
    {
      label: "A",
      value: "A",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "C",
      value: "C",
    },
    {
      label: "D",
      value: "D",
    },
  ];

  const levelOptions = [
    {
      label: "[-1] No Standards of Excellence",
      value: "-1",
    },
    {
      label: "[0] Focused on the Task",
      value: "0",
    },
    {
      label: "[1] Wants to Do the Job Well",
      value: "1",
    },
    {
      label: "[2] Works to Meet Others Standard",
      value: "2",
    },
    {
      label: "[3] Creates Own Measure of Excellence",
      value: "3",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <SelectForm
        name="competency"
        label="Competency"
        options={competencyOptions}
      />
      <SelectForm
        name="dimension"
        label="Dimension"
        options={dimensionOptions}
      />
      <MultiSelectForm name="level" label="Level" options={levelOptions} />
      <InputForm
        name="weight"
        label="Score Weight"
        className="md:max-w-[116px]"
      />
      <Button className="md:self-end">Save</Button>
    </div>
  );
});

export const CustomForm = React.memo(function CustomForm() {
  return (
    <div className="border border-grayscale-40 rounded-md p-4">
      <h1>Custom</h1>
    </div>
  );
});

interface FormCompetencyTemplateProps {
  groupIndex?: number;
  fieldIndex?: number;
  onRemove?: () => void;
}

export const FormCompetencyTemplate = React.memo(
  function FormCompetencyTemplate({
    groupIndex,
    fieldIndex,
    onRemove,
  }: FormCompetencyTemplateProps) {
    const form = useFormContext();
    const [selectedType, setSelectedType] = React.useState<string>("library");

    return (
      <div className="border border-grayscale-40 rounded-md p-4 space-y-4">
        <RadioGroup
          defaultValue="library"
          orientation="horizontal"
          onValueChange={(value) => setSelectedType(value)}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="library" id="library" />
            <Label htmlFor="library">Use Competency Library</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">Customize Aspect</Label>
          </div>
        </RadioGroup>

        {selectedType === "library" && <LibraryForm />}
        {selectedType === "custom" && <CustomForm />}
      </div>
    );
  },
);
