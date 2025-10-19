import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Image from "next/image";
import * as React from "react";

interface CheckboxOption {
  id: string;
  value: string;
}

interface CheckboxFieldProps {
  questionIndex: number;
}

export const CheckboxField = React.memo(function CheckboxField({
  questionIndex,
}: CheckboxFieldProps) {
  const [options, setOptions] = React.useState<CheckboxOption[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);
  const [hasOther, setHasOther] = React.useState(false);

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), value: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 1) {
      setOptions((prev) => prev.filter((option) => option.id !== id));
    }
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, value } : option)),
    );
  };

  const handleAddOther = () => {
    setHasOther(true);
  };

  const handleRemoveOther = () => {
    setHasOther(false);
  };

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <p className="text-sm font-normal">
        Answer Option<span className="text-error">*</span>
      </p>
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center gap-2">
          <Checkbox />
          <Input
            value={option.value}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleRemoveOption(option.id)}
            disabled={options.length === 1}
          >
            <Image
              width={16}
              height={16}
              src="/icons/deleteOutlined.svg"
              alt="trash"
            />
          </Button>
        </div>
      ))}
      {hasOther && (
        <div className="flex items-center gap-2">
          <Checkbox />
          <Input value="Other" disabled placeholder="Other" />
          <Button variant="ghost" type="button" onClick={handleRemoveOther}>
            <Image
              width={16}
              height={16}
              src="/icons/deleteOutlined.svg"
              alt="trash"
            />
          </Button>
        </div>
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
