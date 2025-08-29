import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Trash } from "lucide-react";
import { UploadButtonProps } from "@/lib/types";
import { PreviewDoc, useFileUpload } from "@/hooks/use-file-upload";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-primary text-primary shadow-xs hover:opacity-50 hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

interface FilePreviewProps {
  preview: PreviewDoc;
  onRemove: () => void;
}

function FilePreview({ preview, onRemove }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-row border rounded-xs border-grayscale-10 p-2">
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary font-semibold text-sm">
          {preview.name}
        </span>
        <span className="text-text-disabled text-[10px]">
          {formatFileSize(preview.size)}
        </span>
      </div>
      <Button variant="ghost" className="w-fit" onClick={onRemove}>
        <Trash />
      </Button>
    </div>
  );
}

function UploadButton({
  label,
  required,
  name,
  defaultFile,
}: UploadButtonProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const { preview, handleFileUpload, handleRemove, isUploading, setPreview } =
    useFileUpload({ name });

  const handleButtonClick = () => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);

      // Clear the input value to allow re-uploading the same file
      if (ref.current) {
        ref.current.value = "";
      }
    }
  };

  React.useEffect(() => {
    if (defaultFile && !preview) {
      setPreview({
        name: defaultFile.filename,
        size: defaultFile.size,
        url: defaultFile.path,
        type: defaultFile.mime_type,
      });
    }
  }, [defaultFile, preview, setPreview]);

  return (
    <div className="flex flex-col max-w-fit gap-2">
      <span className="text-sm">
        {label}
        {required && <span className="text-error">*</span>}
      </span>

      {preview && <FilePreview preview={preview} onRemove={handleRemove} />}

      <Button
        variant="outline"
        className="w-28"
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        <Image
          aria-hidden
          src="/icons/attachmentBlue.svg"
          alt="attachment icon"
          width={18}
          height={18}
          className="text-primary"
        />
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>

      <input
        type="file"
        ref={ref}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}

export { Button, buttonVariants, UploadButton };
