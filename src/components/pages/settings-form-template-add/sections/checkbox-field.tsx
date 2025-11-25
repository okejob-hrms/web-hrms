/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useFormContext } from "react-hook-form";

interface CheckboxFieldProps {
  questionIndex: number;
}

export const CheckboxField = React.memo(function CheckboxField({
  questionIndex,
}: CheckboxFieldProps) {
  const { setValue, watch } = useFormContext();
  const questions = watch("groups[0].fields");
  const currentQuestion = questions[questionIndex];

  const options = currentQuestion?.options || [];

  const handleAddOption = () => {
    const newOptions = [...options, ""];
    setValue(`groups[0].fields.${questionIndex}.options`, newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_: any, i: number) => i !== index);
      setValue(`groups[0].fields.${questionIndex}.options`, newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setValue(`groups[0].fields.${questionIndex}.options`, newOptions);
  };

  const handleAddOther = () => {
    const newOptions = [...options, "Other"];
    setValue(`groups[0].fields.${questionIndex}.options`, newOptions);
  };

  const handleRemoveOther = () => {
    const newOptions = options.filter((option: string) => option !== "Other");
    setValue(`groups[0].fields.${questionIndex}.options`, newOptions);
  };

  const hasOther = options.includes("Other");

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <p className="text-sm font-normal">
        Answer Option<span className="text-error">*</span>
      </p>
      {options.map(
        (
          option: string | number | readonly string[] | undefined,
          index: number,
        ) => {
          const isOther = option === "Other";

          return (
            <div key={index} className="flex items-center gap-2">
              <Checkbox />
              <Input
                value={option}
                onChange={(e) =>
                  !isOther && handleOptionChange(index, e.target.value)
                }
                placeholder={isOther ? "Other" : `Option ${index + 1}`}
                disabled={isOther}
              />
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  isOther ? handleRemoveOther() : handleRemoveOption(index)
                }
                disabled={options.length === 1 && !isOther}
              >
                <Image
                  width={16}
                  height={16}
                  src="/icons/deleteOutlined.svg"
                  alt="trash"
                />
              </Button>
            </div>
          );
        },
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="font-semibold text-primary text-sm"
          type="button"
          onClick={handleAddOption}
        >
          <Plus /> Add Answer Option
        </Button>
        <span className="text-text-disabled text-sm">or</span>
        <Button
          variant="ghost"
          className="font-semibold text-text-disabled text-sm"
          type="button"
          onClick={handleAddOther}
          disabled={hasOther}
        >
          <Plus /> Add Other
        </Button>
      </div>
    </div>
  );
});
