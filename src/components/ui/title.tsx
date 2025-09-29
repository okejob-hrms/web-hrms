import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface TitleContentProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const TitleContent: React.FC<TitleContentProps> = ({
  label,
  onClick,
  className = "",
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="link"
        onClick={onClick ?? (() => window.history.back())}
        className={`text-dark ${className} bg-primary-background w-[38px] h-[38px] flex items-center justify-center`}
      >
        <ChevronLeft
          style={{ height: "24px", width: "24px" }}
          className="text-primary"
        />
      </Button>
      <h2 className="text-xl font-semibold">{label}</h2>
    </div>
  );
};

export default TitleContent;
