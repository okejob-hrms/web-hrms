import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { uploadAttachment } from "@/services/attachments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { postAddBranch } from "@/services/settings";

export const formSchema = z.object({
  is_primary: z.boolean(),
  name: z.string().min(1, "Company name is required"),
  legal_entity_name: z.string().min(1, "Legal entity name is required"),
  industry: z.string().min(1, "Industry is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone number is required"),
  logo: z.string().min(1, "Logo path is required"),
  business_registration_number: z
    .string()
    .min(1, "Business registration number is required"),
  website: z.string().url("Invalid website URL"),
  address: z.string().min(1, "Address is required"),
  payroll_bank_name: z.string().min(1, "Payroll bank name is required"),
  payroll_bank_account_number: z
    .string()
    .regex(/^[0-9]+$/, "Bank account number must be numeric"),
  payroll_bank_account_name: z
    .string()
    .min(1, "Payroll bank account name is required"),
  payroll_currency: z.string().min(1, "Payroll currency is required"),
});

export type CompanyBranchFormSchema = z.infer<typeof formSchema>;

export function useCompanyBranchForm() {
  const router = useRouter();
  const [previewPhotoProfile, setPreviewPhotoProfile] = React.useState("");
  const [isLoadingPhotoProfile, setLoadingPhotoProfile] = React.useState(false);
  const [openAttendenceModal, setOpenAttendenceModal] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<CompanyBranchFormSchema>({
    resolver: zodResolver(formSchema),
  });

  const { mutate: addBranch, isPending: isPendingAddBranch } = useMutation({
    mutationFn: postAddBranch,
    onSuccess: () => {
      toast.success("Add branch successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to add branch: ${error.message}`);
    },
  });

  const { mutate: uploadPhotoProfile, isPending: isPendingPhotoProfile } =
    useMutation({
      mutationFn: uploadAttachment,
      onSuccess: (res) => {
        form.setValue("logo", res.data.path);
        setPreviewPhotoProfile(res.data.url);
        setLoadingPhotoProfile(false);
      },
      onError: (error) => {
        toast.error(`Failed to upload photo profile: ${error.message}`);
      },
    });
  const handleSubmit = (values: CompanyBranchFormSchema) => {
    console.log("call on submit");
    console.log(values);
  };
  const handlePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoadingPhotoProfile(true);
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        setLoadingPhotoProfile(false);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        setLoadingPhotoProfile(false);
        return;
      }

      uploadPhotoProfile(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        setLoadingPhotoProfile(false);
      }
    }
  };

  const handleOpenAttendenceModal = (open: boolean) => {
    setOpenAttendenceModal(open);
    if (!open) {
      form.reset();
    }
  };

  const handleCancel = () => router.push("/settings/company/company-branch");

  return {
    formSchema,
    fileInputRef,
    previewPhotoProfile,
    setPreviewPhotoProfile,
    isLoadingPhotoProfile,
    setLoadingPhotoProfile,
    handlePhoto,
    handleSubmit,
    handleCancel,
    handleFileChange,
    uploadPhotoProfile,
    isPendingPhotoProfile,
    form,
    openAttendenceModal,
    setOpenAttendenceModal,
    handleOpenAttendenceModal,
    addBranch,
    isPendingAddBranch,
  };
}
