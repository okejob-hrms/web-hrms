/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { uploadAttachment } from "@/services/attachments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { postAddBranch } from "@/services/settings";
import { ApiErrorResponse } from "@/lib/types";

export const formSchema = z.object({
  is_primary: z.boolean(),
  name: z.string().min(1, "Company name is required"),
  legal_entity_name: z.string().min(1, "Legal entity name is required"),
  industry: z.string().min(1, "Industry is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone number is required"),
  logo: z.string(),
  business_registration_number: z
    .string()
    .min(1, "Business registration number is required"),
  website: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  payroll_bank_name: z.string().min(1, "Payroll bank name is required"),
  payroll_bank_account_number: z
    .string()
    .regex(/^[0-9]+$/, "Bank account number must be numeric"),
  payroll_bank_account_name: z
    .string()
    .min(1, "Payroll bank account name is required"),
  payroll_currency: z.string().min(1, "Payroll currency is required"),
  latitude: z.string().min(1, "Attendance location is required"),
  longitude: z.string().min(1, "Attendance location is required"),
  max_radius: z.number().optional(),
});

export type CompanyBranchFormSchema = z.infer<typeof formSchema>;

export const defaultValues: CompanyBranchFormSchema = {
  is_primary: false,
  name: "",
  legal_entity_name: "",
  industry: "",
  email: "",
  phone: "",
  logo: "",
  business_registration_number: "",
  website: "",
  address: "",
  payroll_bank_name: "",
  payroll_bank_account_number: "",
  payroll_bank_account_name: "",
  payroll_currency: "",
  latitude: "",
  longitude: "",
  max_radius: 0,
};

export function useCompanyBranchForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const defaultMap = {
    lat: -6.2088,
    lng: 106.8456,
  };
  const [previewPhotoProfile, setPreviewPhotoProfile] = React.useState("");
  const [isLoadingPhotoProfile, setLoadingPhotoProfile] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openAttendenceModal, setOpenAttendenceModal] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedMap, setSelectedMap] = React.useState({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [map, setMap] = React.useState({
    lat: 0,
    lng: 0,
  });
  const [location, setLocation] = React.useState("");

  const form = useForm<CompanyBranchFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutate: addBranch, isPending: isPendingAddBranch } = useMutation({
    mutationFn: postAddBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branches"] });
      toast.success("Add branch successfully.");
      router.push("/settings/company/company-branch");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || "Failed to add branch");
            })
            .catch(() => {
              toast.error("Failed to add branch: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add branch: Server error");
        }
      } else {
        toast.error(
          `Failed to add branch: ${error.message || "Unknown error"}`,
        );
      }
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
        setLoadingPhotoProfile(false);
      },
    });

  const handleSubmit = React.useCallback(
    (values: CompanyBranchFormSchema) => {
      console.log("handleSubmit called with values:", values);
      try {
        const { max_radius, ...restValues } = values;
        const submitData = {
          ...restValues,
          latitude: map.lat.toString(),
          longitude: map.lng.toString(),
          ...(max_radius && { max_radius }),
        };

        console.log("Submitting data to API:", submitData);
        addBranch(submitData);
      } catch (err) {
        console.error("Error on submit", err);
        toast.error("Failed to submit form");
      }
    },
    [addBranch, map.lat, map.lng],
  );

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

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        setLoadingPhotoProfile(false);
        return;
      }

      uploadPhotoProfile(file);
    }
  };

  const handleSetMap = () => {
    console.log("call handleSetmap", selectedMap);
    setMap(selectedMap);
    form.setValue("latitude", selectedMap.lat.toString());
    form.setValue("longitude", selectedMap.lng.toString());
    setOpenAttendenceModal(false);
  };

  const handleOpenAttendenceModal = (open: boolean) => {
    setOpenAttendenceModal(open);
    if (!open) {
      setSelectedMap(defaultMap);
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
    selectedMap,
    setSelectedMap,
    handleSetMap,
    map,
    setMap,
    loading,
    setLoading,
    defaultMap,
    location,
    setLocation,
  };
}
