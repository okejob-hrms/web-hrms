"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SelectForm } from "@/components/ui/select-form";
import { DatePicker } from "@/components/ui/date-picker";
import { InputForm } from "@/components/ui/input";
import { TextAreaForm } from "@/components/ui/textarea";
import { RadioForm } from "@/components/ui/radio-group";
import Image from "next/image";
import { FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRoles } from "@/services/roles";
import { uploadAttachment } from "@/services/attachments";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

export const PersonalInformationSection = React.memo(
  function PersonalInformationSection() {
    const { data: roles } = useQuery({
      queryKey: ["roles"],
      queryFn: getRoles,
    });

    const { watch, setValue, getValues, formState } = useFormContext();
    const [socialMediaCount, setSocialMediaCount] = React.useState(1);
    const [previewPhotoProfile, setPreviewPhotoProfile] = React.useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { mutate: uploadPhotoProfile } = useMutation({
      mutationFn: uploadAttachment,
      onSuccess: (res) => {
        setValue("photo_profile", res.data.path);
        setPreviewPhotoProfile(res.data.url);
      },
      onError: (error) => {
        toast.error(`Failed to upload photo profile: ${error.message}`);
      },
    });

    const roleOptions = React.useMemo(() => {
      if (roles?.data) {
        return roles.data?.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [roles?.data]);

    const handlePhoto = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast.error("File size must be less than 5MB");
          return;
        }

        uploadPhotoProfile(file);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    React.useEffect(() => {
      const currentSocialMedia = getValues("social_media_accounts");
      if (!currentSocialMedia || currentSocialMedia.length === 0) {
        setValue("social_media_accounts", [{ type: "", url: "" }]);
      }
    }, [setValue, getValues, watch("social_media_accounts")]);

    const addSocialMedia = () => {
      const currentSocialMedia = watch("social_media_accounts") || [];
      setValue("social_media_accounts", [
        ...currentSocialMedia,
        { type: "", url: "" },
      ]);
      setSocialMediaCount((prev) => prev + 1);
    };

    const removeSocialMedia = (index: number) => {
      const currentSocialMedia = getValues("social_media_accounts") || [];
      const newSocialMedia = currentSocialMedia.filter(
        (_: never, i: number) => i !== index,
      );
      setValue("social_media_accounts", newSocialMedia);
      setSocialMediaCount((prev) => Math.max(1, prev - 1));
    };

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="md:col-span-2">
            <label className="text-sm">
              Photo{" "}
              <span className="text-sm text-text-disabled">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <Avatar className="size-20 bg-grayscale-10">
                <AvatarImage
                  src={previewPhotoProfile || "/icons/userPlaceholder.svg"}
                  alt="Profile photo"
                  className={cn(
                    `bg-grayscale-10 m-auto object-cover`,
                    !previewPhotoProfile && "h-10 w-10",
                  )}
                />
                <AvatarFallback className="size-10">
                  {getValues("name")?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="w-44"
                size="lg"
                onClick={handlePhoto}
                type="button"
              >
                <Image
                  src="/icons/imagePlaceholder.svg"
                  width={18}
                  height={18}
                  alt="icon search"
                />
                Select Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          <InputForm name="name" label="Name" required />

          <SelectForm
            name="role_id"
            label="User Role"
            options={roleOptions}
            required
            className="md:w-[50%]"
          />
          <InputForm
            name="email"
            label="Email"
            required
            className="col-start-1"
          />
          <PhoneInput
            name="phone_number"
            label="Phone Number"
            required={true}
          />
          <RadioForm
            required
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          <div className="grid grid-cols-2 gap-2 items-start">
            <InputForm name="place_of_birth" label="Place of Birth" required />
            <DatePicker name="date_of_birth" label="Born Date" />
          </div>

          <div className="grid grid-cols-2 gap-2 items-start">
            <SelectForm
              name="marital_status"
              label="Marital Status"
              options={[
                { label: "Single", value: "1" },
                { label: "Married", value: "2" },
                { label: "Divorced", value: "3" },
                { label: "Widowed", value: "4" },
              ]}
              required
            />
            <InputForm name="blood_type" label="Blood Type" required />
          </div>
          <div className="grid grid-cols-2 gap-2 col-start-1 col-end-2 items-start">
            <InputForm
              name="height"
              label="Height"
              required
              iconPosition="right"
              type="number"
              icon={<span className="text-text-disabled text-base">cm</span>}
            />
            <InputForm
              name="weight"
              label="Weight"
              type="number"
              required
              iconPosition="right"
              icon={<span className="text-text-disabled text-base">kg</span>}
            />
          </div>

          <InputForm name="id_number" label="ID Number" required />
          <InputForm name="npwp" label="Taxpayer ID Number (NPWP)" required />
          <InputForm
            name="bpjs"
            label="Health Insurance Number (BPJS)"
            required
          />

          <TextAreaForm name="citizen_id_address" label="Citizen ID Address" />
          <TextAreaForm name="residential_address" label="Residental Address" />
          <InputForm name="hobby" label="Hobby" required />

          <TextAreaForm
            name="achievement"
            label="Achievement"
            className="md:col-span-2"
          />
          <TextAreaForm
            name="personal_description"
            label="Personal Description"
            className="md:col-span-2"
          />
          <div className="grid gap-2 w-full items-center">
            <FormLabel className="text-sm font-normal">
              Social Media
              <span className="text-text-disabled"> (optional)</span>
            </FormLabel>
            {Array.from({ length: socialMediaCount }).map((_, index) => (
              <div key={index} className="flex items-start gap-2 w-full">
                <SelectForm
                  name={`social_media_accounts.${index}.type`}
                  isOptional
                  options={[
                    {
                      label: "Instagram",
                      value: "instagram",
                      icon: (
                        <Image
                          width={16}
                          height={16}
                          src="/icons/instagram.svg"
                          alt="instagram"
                        />
                      ),
                    },
                    {
                      label: "X / Twitter",
                      value: "twitter",
                      icon: (
                        <Image
                          width={16}
                          height={16}
                          src="/icons/x.svg"
                          alt="x"
                        />
                      ),
                    },
                    {
                      label: "Facebook",
                      value: "facebook",
                      icon: (
                        <Image
                          width={16}
                          height={16}
                          src="/icons/facebook.svg"
                          alt="facebook"
                        />
                      ),
                    },
                    {
                      label: "LinkedIn",
                      value: "linkedin",
                      icon: (
                        <Image
                          width={16}
                          height={16}
                          src="/icons/linkedin.svg"
                          alt="linkedin"
                        />
                      ),
                    },
                    {
                      label: "Other",
                      value: "other",
                      icon: (
                        <Image
                          width={16}
                          height={16}
                          src="/icons/link.svg"
                          alt="link"
                        />
                      ),
                    },
                  ]}
                  className="w-18"
                  placeholder="Select platform"
                />
                <InputForm
                  name={`social_media_accounts.${index}.url`}
                  isOptional
                  className="w-full"
                />
                {socialMediaCount > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSocialMedia(index)}
                    className="h-10 w-10 text-red-500 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className={`w-fit text-primary ${formState.errors["social_media_accounts"] ? "self-center" : "self-end"}`}
            type="button"
            onClick={addSocialMedia}
          >
            <Plus /> Add More
          </Button>
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
