import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

interface Props {
  disabled?: boolean;
  min?: number;
  max?: number;
  value?: string;
}

// const options = [
//   {
//     value: "1",
//     label: "1",
//   },
//   {
//     value: "2",
//     label: "2",
//   },
//   {
//     value: "3",
//     label: "3",
//   },
//   {
//     value: "4",
//     label: "4",
//   },
//   {
//     value: "5",
//     label: "5",
//   },
// ];
const RadioCard = ({ disabled, min = 1, max = 5, value }: Props) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => ({
    value: (min + i).toString(),
    label: (min + i).toString(),
  }));

  return (
    <RadioGroupPrimitive.Root
      className="w-full flex flex-wrap gap-3"
      value={value}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={disabled}
          className={cn(
            "min-w-11 ring-[1px] ring-border rounded py-1 px-3 data-[state=checked]:ring-grayscale-20 data-[state=checked]:bg-grayscale-20",
          )}
        >
          <span className="text-text-disabled data-[state=checked]:text-white">
            {option.label}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
};
export default RadioCard;
