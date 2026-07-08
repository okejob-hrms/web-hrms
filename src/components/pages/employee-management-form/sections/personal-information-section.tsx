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
import { getPublicFileUrl } from "@/lib/helpers";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn, stringAvatar } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export const PersonalInformationSection = React.memo(
  function PersonalInformationSection() {
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const { data: roles } = useQuery({
      queryKey: ["roles"],
      queryFn: getRoles,
    });

    const { watch, setValue, getValues, formState } = useFormContext();
    const [socialMediaCount, setSocialMediaCount] = React.useState(1);
    const [previewPhotoProfile, setPreviewPhotoProfile] = React.useState("");
    const [isLoadingPhotoProfile, setLoadingPhotoProfile] =
      React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      const photoUrl = watch("photo_profile_url");
      if (photoUrl) {
        setPreviewPhotoProfile(photoUrl);
      }
    }, [watch("photo_profile_url")]);

    React.useEffect(() => {
      const accounts = watch("social_media_accounts");
      if (accounts) {
        setSocialMediaCount(accounts.length);
      }
    }, [watch("social_media_accounts")]);

    const { mutate: uploadPhotoProfile, isPending: isPendingPhotoProfile } =
      useMutation({
        mutationFn: uploadAttachment,
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
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error(t("selectImageFile"));
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(t("fileSizeMax5mb"));
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewPhotoProfile(localPreview);
      setLoadingPhotoProfile(true);

      uploadPhotoProfile(file, {
        onSuccess: (res) => {
          setValue("photo_profile", res.data.path);
          const publicUrl = getPublicFileUrl(res.data.path);
          const probe = new window.Image();
          probe.onload = () => {
            setPreviewPhotoProfile(publicUrl);
            URL.revokeObjectURL(localPreview);
          };
          probe.onerror = () => {
            setPreviewPhotoProfile(localPreview);
          };
          probe.src = publicUrl;
        },
        onError: (error: Error) => {
          URL.revokeObjectURL(localPreview);
          setPreviewPhotoProfile("");
          toast.error(t("photoUploadFailed", { message: error.message }));
        },
        onSettled: () => {
          setLoadingPhotoProfile(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
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
          {t("personalInformation")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="md:col-span-2">
            <label className="text-sm">
              {t("photo")}{" "}
              <span className="text-sm text-text-disabled">{tCommon("optional")}</span>
            </label>
            <div className="flex items-center gap-4">
              {isLoadingPhotoProfile || isPendingPhotoProfile ? (
                <Skeleton className="size-20 rounded-full" />
              ) : (
                <Avatar className="size-20 bg-grayscale-10 items-center justify-center">
                  <AvatarImage
                    src={previewPhotoProfile || "/icons/userPlaceholder.svg"}
                    alt="Profile photo"
                    className={cn(
                      `bg-grayscale-10 m-auto object-cover`,
                      !previewPhotoProfile && "h-10 w-10",
                    )}
                  />
                  <AvatarFallback className="size-10 font-semibold">
                    {stringAvatar(watch("name"))}
                  </AvatarFallback>
                </Avatar>
              )}
              <Button
                variant="outline"
                className="w-44"
                size="lg"
                onClick={handlePhoto}
                disabled={isLoadingPhotoProfile || isPendingPhotoProfile}
                type="button"
              >
                <Image
                  src="/icons/imagePlaceholder.svg"
                  width={18}
                  height={18}
                  alt="icon search"
                />
                {t("selectImage")}
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
          <InputForm name="name" label={tCommon("name")} required />

          <SelectForm
            name="role_id"
            label={t("userRole")}
            options={roleOptions}
            required
            className="md:w-[50%]"
          />
          <InputForm
            name="email"
            label={tCommon("email")}
            required
            className="col-start-1"
          />
          <PhoneInput
            name="phone_number"
            label={t("phoneNumber")}
            required={true}
            className="self-end"
            countryCodeName="country_code"
          />
          <RadioForm
            required
            name="gender"
            label={t("gender")}
            options={[
              { label: t("male"), value: "male" },
              { label: t("female"), value: "female" },
            ]}
          />

          <div className="grid grid-cols-2 gap-2 items-start">
            <InputForm name="place_of_birth" label={t("placeOfBirth")} required />
            <DatePicker name="date_of_birth" label={t("bornDate")} />
          </div>

          <div className="grid grid-cols-2 gap-2 items-start">
            <SelectForm
              name="marital_status"
              label={t("maritalStatus")}
              options={[
                { label: t("single"), value: "1" },
                { label: t("married"), value: "2" },
                { label: t("divorced"), value: "3" },
                { label: t("widowed"), value: "4" },
              ]}
              required
            />
            <SelectForm
              name="blood_type"
              label={t("bloodType")}
              options={[
                { label: "A", value: "A" },
                { label: "AB", value: "AB" },
                { label: "B", value: "B" },
                { label: "O", value: "O" },
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2 col-start-1 col-end-2 items-start">
            <InputForm
              name="height"
              label={t("height")}
              required
              iconPosition="right"
              type="number"
              icon={<span className="text-text-disabled text-base">cm</span>}
            />
            <InputForm
              name="weight"
              label={t("weight")}
              type="number"
              required
              iconPosition="right"
              icon={<span className="text-text-disabled text-base">kg</span>}
            />
          </div>

          <InputForm name="id_number" label={t("idNumber")} required />
          <InputForm name="npwp" label={t("npwp")} />
          <InputForm name="bpjs" label={t("bpjs")} />

          <TextAreaForm
            name="citizen_id_address"
            label={t("citizenIdAddress")}
            required
          />
          <TextAreaForm
            name="residential_address"
            label={t("residentialAddress")}
            required
          />
          <InputForm name="hobby" label={t("hobby")} />

          <TextAreaForm
            name="achievement"
            label={t("achievement")}
            className="md:col-span-2"
          />
          <TextAreaForm
            name="personal_description"
            label={t("personalDescription")}
            className="md:col-span-2"
          />
          <div className="grid gap-2 w-full items-center">
            <FormLabel className="text-sm font-normal">
              {t("socialMedia")}
              <span className="text-text-disabled"> {tCommon("optional")}</span>
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
                  placeholder={t("selectPlatform")}
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
            <Plus /> {t("addMore")}
          </Button>
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
