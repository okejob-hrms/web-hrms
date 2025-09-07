import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Trash, Loader2 } from "lucide-react";
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

interface FilePreviewProps {
  preview: PreviewDoc;
  onRemove: () => void;
  isRemoving?: boolean;
}

function FilePreview({
  preview,
  onRemove,
  isRemoving = false,
}: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center border rounded-xs border-grayscale-10 p-2 transition-opacity",
        isRemoving && "opacity-50",
      )}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-text-secondary font-semibold text-sm truncate">
          {preview.name}
        </span>
        <span className="text-text-disabled text-[10px]">
          {formatFileSize(preview.size)}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${preview.name}`}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
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
  const [isInitialized, setIsInitialized] = React.useState(false);

  const {
    preview,
    handleFileUpload,
    handleRemove,
    isUploading,
    isRemoving,
    setPreview,
  } = useFileUpload({ name });

  const handleButtonClick = React.useCallback(() => {
    if (ref.current && !isUploading) {
      ref.current.click();
    }
  }, [isUploading]);

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);

        if (ref.current) {
          ref.current.value = "";
        }
      }
    },
    [handleFileUpload],
  );

  React.useEffect(() => {
    if (defaultFile && !preview && !isInitialized) {
      setPreview({
        name: defaultFile.filename || "Unknown file",
        size: defaultFile.size || 0,
        url: defaultFile.path || "",
        type: defaultFile.mime_type || "",
      });

      setIsInitialized(true);
    }
  }, [defaultFile, preview, setPreview, isInitialized]);

  const handleRemoveWithConfirmation = React.useCallback(() => {
    if (window.confirm("Are you sure you want to remove this file?")) {
      handleRemove();
    }
  }, [handleRemove]);

  return (
    <div className="flex flex-col gap-3 max-w-full">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && (
          <span className="text-red-500 text-sm" aria-label="Required field">
            *
          </span>
        )}
      </div>

      {preview && (
        <FilePreview
          preview={preview}
          onRemove={handleRemoveWithConfirmation}
          isRemoving={isRemoving}
        />
      )}

      <Button
        type="button"
        variant="outline"
        className="w-fit min-w-[140px]"
        size="default"
        onClick={handleButtonClick}
        disabled={isUploading || isRemoving}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Image
              aria-hidden
              src="/icons/attachmentBlue.svg"
              alt=""
              width={18}
              height={18}
              className="text-primary"
            />
            {preview ? "Change File" : "Upload File"}
          </>
        )}
      </Button>

      <input
        type="file"
        ref={ref}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading || isRemoving}
        aria-label={`Upload file for ${label}`}
        accept="*/*"
      />
    </div>
  );
}

export { Button, buttonVariants, UploadButton };
