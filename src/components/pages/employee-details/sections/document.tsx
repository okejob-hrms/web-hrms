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
import { Ellipsis } from "lucide-react";
import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropEvent, FileRejection } from "react-dropzone";

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

const CardItem = React.memo(function CardItem() {
  return (
    <div className="bg-primary-background rounded-md">
      <div className="min-h-36"></div>
      <div className="p-4 bg-white rounded-b-md">
        <div className="flex justify-between gap-2">
          <p className="text-text-secondary text-sm">Title.ppf</p>
          <DropdownMenu>
            <DropdownMenuTrigger>
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
                <Icon size={12} name="download" color="#8E8E8E" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon size={12} name="delete" color="#8E8E8E" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-text-disabled">2021/4/15 16:29</p>
        <p className="text-text-disabled text-xs">
          uploaded by <span className="text-text-secondary">Samantha</span>
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
      <DialogContent className="bg-white min-w-7xl">
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

export const DocumentDetail = React.memo(function DocumentDetail() {
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-semibold text-lg">Employee Document</h1>
        <UploadDocumentModal />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
        <CardItem />
      </div>
    </div>
  );
});
