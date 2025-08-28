import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  Ellipsis,
  FileText,
  FileImage,
  File as FileIcon,
  Video,
  Music,
  Archive,
} from "lucide-react";
import * as React from "react";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropEvent, FileRejection } from "react-dropzone";
import { IDocument } from "@/lib/types";
import { IEmployeeDetailsResponse } from "@/services/employees/types";

interface DragnDropProps {
  handleDrop:
    | ((
        acceptedFiles: File[],
        fileRejections: FileRejection[],
        event: DropEvent,
      ) => void)
    | undefined;
  files?: File[] | undefined;
}

interface Props {
  data: IEmployeeDetailsResponse;
}

const tabs = [
  {
    name: "Upload From My Computer",
    value: "my-computer",
    icon: <Icon name="computer" color="currentColor" size={14} />,
  },
  {
    name: "File Library",
    value: "file-library",
    icon: <Icon name="storage" color="currentColor" size={14} />,
  },
];

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileType = (filename: string): string => {
  const extension = getFileExtension(filename);

  const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const documentTypes = ["pdf", "doc", "docx", "txt", "rtf"];
  const videoTypes = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
  const audioTypes = ["mp3", "wav", "ogg", "aac", "m4a"];
  const archiveTypes = ["zip", "rar", "7z", "tar", "gz"];

  if (imageTypes.includes(extension)) return "image";
  if (documentTypes.includes(extension)) return "document";
  if (videoTypes.includes(extension)) return "video";
  if (audioTypes.includes(extension)) return "audio";
  if (archiveTypes.includes(extension)) return "archive";

  return "unknown";
};

const DocumentPreview = React.memo(function DocumentPreview({
  file,
}: {
  file: IDocument;
}) {
  const fileUrl = `${process.env.NEXT_PUBLIC_FILE_URL}/${file.path}`;
  const fileType = getFileType(file.filename);
  const extension = getFileExtension(file.filename);

  const renderPreview = () => {
    switch (fileType) {
      case "image":
        return (
          <div className="relative w-full h-full overflow-hidden rounded-t-md min-h-36">
            <Image
              src={fileUrl}
              alt={file.filename}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <FileImage className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-500">
                  Image preview unavailable
                </p>
              </div>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="flex flex-col items-center min-h-36 justify-center h-full bg-gradient-to-br from-red-50 to-red-100 rounded-t-md">
            <FileText className="mb-2 text-red-500" size={32} />
            <p className="text-sm font-medium text-red-700 uppercase">
              {extension}
            </p>
            <p className="text-xs text-red-600">Document</p>
          </div>
        );

      case "video":
        return (
          <div className="relative w-full h-full overflow-hidden rounded-t-md bg-black min-h-36">
            <video
              className="w-full h-full object-cover"
              preload="metadata"
              muted
            >
              <source src={fileUrl} />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <Video className="mx-auto mb-2" size={32} />
                  <p className="text-sm">Video preview</p>
                </div>
              </div>
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-purple-100 rounded-t-md min-h-36">
            <Music className="mb-2 text-purple-500" size={32} />
            <p className="text-sm font-medium text-purple-700 uppercase">
              {extension}
            </p>
            <p className="text-xs text-purple-600">Audio File</p>
          </div>
        );

      case "archive":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-t-md min-h-36">
            <Archive className="mb-2 text-yellow-600" size={32} />
            <p className="text-sm font-medium text-yellow-700 uppercase">
              {extension}
            </p>
            <p className="text-xs text-yellow-600">Archive</p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-md min-h-36">
            <FileIcon className="mb-2 text-gray-500" size={32} />
            <p className="text-sm font-medium text-gray-700 uppercase">
              {extension || "file"}
            </p>
            <p className="text-xs text-gray-600">Unknown Type</p>
          </div>
        );
    }
  };

  return <div className="min-h-36 relative">{renderPreview()}</div>;
});

const DragnDrop = React.memo(function DragnDrop({
  handleDrop,
  files,
}: DragnDropProps) {
  return (
    <Dropzone
      maxFiles={3}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
      className="w-full min-h-[500px]"
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
});

const CardItem = React.memo(function CardItem({ file }: { file: IDocument }) {
  return (
    <div className="bg-primary-background rounded-md shadow-sm border hover:shadow-md transition-shadow">
      <DocumentPreview file={file} />
      <div className="p-4 bg-white rounded-b-md">
        <div className="flex justify-between gap-2">
          <p
            className="text-text-secondary text-sm truncate"
            title={file.filename}
          >
            {file.filename}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger className="shrink-0">
              <Ellipsis size={12} className="text-text-disabled" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Icon size={12} name="openNewTab" color="#8E8E8E" /> Open
                Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="edit" color="#8E8E8E" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a
                  href={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.path}`}
                  download={file.filename}
                  className="flex items-center gap-2"
                >
                  <Icon size={12} name="download" color="#8E8E8E" />
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="delete" color="#8E8E8E" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-text-disabled mt-1">{file.uploaded_at}</p>
        <p className="text-text-disabled text-xs">
          uploaded by{" "}
          <span className="text-text-secondary">{file.uploaded_by}</span>
        </p>
      </div>
    </div>
  );
});

const MenuTab = React.memo(function MenuTab() {
  const [files, setFiles] = React.useState<File[] | undefined>();
  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };
  return (
    <Tabs
      orientation="vertical"
      defaultValue={tabs[0].value}
      className="w-full grid grid-cols-1 md:grid-cols-5 items-start gap-4 justify-center"
    >
      <TabsList className="shrink-0 grid grid-cols-1 gap-1 p-0 bg-background">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start items-center px-3 py-1.5 gap-2"
          >
            {tab.icon} {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex items-center justify-center w-full border rounded-md font-medium text-muted-foreground col-span-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.name === "my-computer" ? (
              <DragnDrop files={files} handleDrop={handleDrop} />
            ) : (
              <DragnDrop files={files} handleDrop={handleDrop} />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
});

const UploadDocumentModal = React.memo(function UploadDocumentModal() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <MenuTab />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Upload Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const DocumentDetail = React.memo(function DocumentDetail({
  data,
}: Props) {
  const documents = data.employee_documents;
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-semibold text-lg">Employee Document</h1>
        <UploadDocumentModal />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {documents.map((item) => (
          <CardItem key={item.id} file={item} />
        ))}
      </div>
    </div>
  );
});
