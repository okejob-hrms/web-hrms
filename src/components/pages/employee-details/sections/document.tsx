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
  RefreshCw,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as React from "react";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropEvent, FileRejection } from "react-dropzone";
import { IDocument } from "@/lib/types";
import DeleteDocumentModal from "./delete-document-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEmployeeDocument,
  deleteEmployeeDocument,
  getAllEmployeeDocument,
} from "@/services/document";
import { uploadAttachment } from "@/services/attachments";
import { toast } from "sonner";
import AppSkeleton from "@/components/partials/app-skeleton";
import ManageAccessModal from "./manage-acccess-modal";

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

interface CardItemProps {
  file: IDocument;
  userId: number;
}

interface Props {
  userId: number;
}

interface UploadedFile {
  file: File;
  path?: string;
  isUploading: boolean;
  error?: string;
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

const FileUploadPreview = React.memo(function FileUploadPreview({
  uploadedFile,
  onRemove,
}: {
  uploadedFile: UploadedFile;
  onRemove: () => void;
}) {
  const fileType = getFileType(uploadedFile.file.name);
  const extension = getFileExtension(uploadedFile.file.name);

  const renderPreview = () => {
    if (uploadedFile.isUploading) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-t-md min-h-36">
          <RefreshCw className="mb-2 text-gray-500 animate-spin" size={32} />
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      );
    }

    if (uploadedFile.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 rounded-t-md min-h-36">
          <FileIcon className="mb-2 text-red-500" size={32} />
          <p className="text-sm text-red-600">Upload failed</p>
        </div>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <div className="relative w-full h-full overflow-hidden rounded-t-md min-h-36">
            <Image
              src={URL.createObjectURL(uploadedFile.file)}
              alt={uploadedFile.file.name}
              fill
              className="object-cover"
            />
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

  return (
    <div className="bg-primary-background rounded-md shadow-sm border hover:shadow-md transition-shadow">
      {renderPreview()}
      <div className="p-4 bg-white rounded-b-md">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="text-text-secondary text-sm truncate"
              title={uploadedFile.file.name}
            >
              {uploadedFile.file.name}
            </p>
            <p className="text-xs text-text-disabled">
              {(uploadedFile.file.size / 1024).toFixed(1)} KB
            </p>
            {uploadedFile.error && (
              <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="shrink-0 h-6 w-6 p-0 hover:bg-gray-100"
            disabled={uploadedFile.isUploading}
          >
            <X size={12} className="text-text-disabled" />
          </Button>
        </div>
      </div>
    </div>
  );
});

const DragnDrop = React.memo(function DragnDrop({
  handleDrop,
  files,
}: DragnDropProps) {
  return (
    <Dropzone
      maxFiles={10}
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

const CardItem = React.memo(function CardItem({ file, userId }: CardItemProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isManageAccessOpen, setIsManageAccessOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteDocument, isPending: isPendingDelete } = useMutation({
    mutationFn: () => deleteEmployeeDocument(userId, file.id),
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["document-employee"] });
      setDropdownOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  if (isPendingDelete) {
    return (
      <div className="bg-primary-background rounded-md shadow-sm border hover:shadow-md transition-shadow">
        <div className="min-h-36 relative bg-gray-200 animate-pulse rounded-t-md"></div>
        <div className="p-4 bg-white rounded-b-md">
          <div className="flex justify-between gap-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1 animate-pulse"></div>
        </div>
      </div>
    );
  }

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
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={handleDropdownOpenChange}
          >
            <DropdownMenuTrigger
              className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Ellipsis size={12} className="text-text-disabled" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
                className="cursor-pointer"
              >
                <Image
                  width={15}
                  height={15}
                  src="/icons/openNewTabGrey.svg"
                  alt="Open Document"
                />
                Open Document
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
                className="cursor-pointer"
              >
                <Image
                  width={15}
                  height={15}
                  src="/icons/editGrey.svg"
                  alt="Edit"
                />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                <a
                  href={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.path}`}
                  download={file.filename}
                  className="flex items-center gap-2 w-full cursor-pointer"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Image
                    width={15}
                    height={15}
                    src="/icons/downloadGrey.svg"
                    alt="Download"
                  />
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <Image
                  width={15}
                  height={15}
                  src="/icons/delete.svg"
                  alt="Delete"
                />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setIsManageAccessOpen(true);
                  e.preventDefault();
                }}
                className="cursor-pointer"
              >
                <Image
                  width={15}
                  height={15}
                  src="/icons/totalCustomer.svg"
                  alt="Manage Access"
                />
                Manage Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteDocumentModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onArchieve={deleteDocument}
            disabled={isPendingDelete}
          />
          <ManageAccessModal
            isOpen={isManageAccessOpen}
            onClose={() => setIsManageAccessOpen(false)}
            onSave={() => {}}
            disabled={isPendingDelete}
            employeeDocumentId={file.employee_profile_id}
          />
        </div>
        <p className="text-xs text-text-disabled mt-1">{file.uploaded_at}</p>
        <p className="text-text-disabled text-xs">
          uploaded by{" "}
          <span className="text-text-secondary">{file.uploaded_by.name}</span>
        </p>
      </div>
    </div>
  );
});

const MenuTab = React.memo(function MenuTab({
  handleDrop,
  uploadedFiles,
  onRemoveFile,
}: {
  handleDrop: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
}) {
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

      <div className="flex flex-col items-center justify-center w-full border rounded-md font-medium text-muted-foreground col-span-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="w-full">
            {tab.name === "my-computer" ? (
              <div className="space-y-4">
                <DragnDrop
                  files={uploadedFiles.map((f) => f.file)}
                  handleDrop={handleDrop}
                />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">
                      Selected Files ({uploadedFiles.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedFiles.map((uploadedFile, index) => (
                        <FileUploadPreview
                          key={`${uploadedFile.file.name}-${index}`}
                          uploadedFile={uploadedFile}
                          onRemove={() => onRemoveFile(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <DragnDrop
                  files={uploadedFiles.map((f) => f.file)}
                  handleDrop={handleDrop}
                />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">
                      Selected Files ({uploadedFiles.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedFiles.map((uploadedFile, index) => (
                        <FileUploadPreview
                          key={`${uploadedFile.file.name}-${index}`}
                          uploadedFile={uploadedFile}
                          onRemove={() => onRemoveFile(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
});

const UploadDocumentModal = React.memo(function UploadDocumentModal({
  userId,
}: {
  userId: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const queryClient = useQueryClient();

  // Upload individual file mutation
  const { mutate: uploadFile } = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (response, file) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                path: response.data.path,
                isUploading: false,
                error: undefined,
              }
            : f,
        ),
      );
    },
    onError: (error, file) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, isUploading: false, error: error.message }
            : f,
        ),
      );
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    },
  });

  // Create documents mutation
  const { mutate: createDocuments, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const validFiles = uploadedFiles.filter((f) => f.path && !f.error);

      if (validFiles.length === 0) {
        throw new Error(
          "No files are ready for upload. Please wait for file uploads to complete or fix any errors.",
        );
      }

      const attachments = validFiles.map((f) => ({
        type: "other",
        path: f.path!,
      }));

      return addEmployeeDocument({
        attachments,
        user_id: userId,
      });
    },
    onSuccess: () => {
      toast.success("Documents created successfully!");
      queryClient.invalidateQueries({ queryKey: ["document-employee"] });
      setOpen(false);
      setUploadedFiles([]);
    },
    onError: (error) => {
      toast.error(`Failed to create documents: ${error.message}`);
    },
  });

  const handleDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newUploadedFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        isUploading: true,
      }));

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Upload each file immediately
      acceptedFiles.forEach((file) => {
        uploadFile(file);
      });
    },
    [uploadFile],
  );

  const handleRemoveFile = React.useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = React.useCallback(() => {
    const hasUploadingFiles = uploadedFiles.some((f) => f.isUploading);
    const hasErrors = uploadedFiles.some((f) => f.error);

    if (hasUploadingFiles) {
      toast.warning("Please wait for all files to finish uploading");
      return;
    }

    if (hasErrors) {
      toast.error("Please resolve upload errors before proceeding");
      return;
    }

    createDocuments();
  }, [uploadedFiles, createDocuments]);

  const isUploading = uploadedFiles.some((f) => f.isUploading);
  const hasValidFiles = uploadedFiles.some((f) => f.path && !f.error);
  const canUpload = !isCreating && !isUploading && hasValidFiles;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <MenuTab
          handleDrop={handleDrop}
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setUploadedFiles([]);
            }}
            disabled={isCreating || isUploading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!canUpload}>
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Creating Documents...
              </>
            ) : isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Uploading Files...
              </>
            ) : (
              "Create Documents"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const DocumentDetail = React.memo(function DocumentDetail({
  userId,
}: Props) {
  const {
    data: documents,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["document-employee", userId],
    queryFn: () => getAllEmployeeDocument(userId),
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-semibold text-lg">Employee Document</h1>
        <UploadDocumentModal userId={userId} />
      </div>

      {isLoading && <AppSkeleton />}

      {!isLoading && (!documents?.data || documents.data.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center">
            <div className="rounded-full bg-gray-50 p-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900">
                No Documents Found
              </h3>
              <p className="text-sm text-text-secondary">
                This employee doesn&apos;t have any documents uploaded yet.
                Start by uploading their first document.
              </p>
            </div>
            <UploadDocumentModal userId={userId} />
          </div>
        </div>
      )}

      {!isLoading &&
        !isError &&
        documents?.data &&
        documents.data.length > 0 && (
          <>
            {isFetching && (
              <Alert className="mb-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>Refreshing documents...</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {documents.data.map((item) => (
                <CardItem key={item.id} file={item} userId={userId} />
              ))}
            </div>
          </>
        )}
    </div>
  );
});
