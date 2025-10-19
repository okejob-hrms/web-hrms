import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import * as React from "react";
import { useCompanyBranchForm } from "./hook";
import { Button } from "@/components/ui/button";
import { SelectForm } from "@/components/ui/select-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, stringAvatar } from "@/lib/utils";
import Image from "next/image";
import { TextAreaForm } from "@/components/ui/textarea";
import { AttendenceLocationModal } from "./sections/attendence-location-modal";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";

export const SettingsCompanyBranchForm = React.memo(
  function SettingsCompanyBranchForm() {
    const {
      fileInputRef,
      previewPhotoProfile,
      setPreviewPhotoProfile,
      isLoadingPhotoProfile,
      handlePhoto,
      handleSubmit,
      handleCancel,
      handleFileChange,
      isPendingPhotoProfile,
      isPendingAddBranch,
      form,
    } = useCompanyBranchForm();

    React.useEffect(() => {
      const photoUrl = form.watch("logo");
      if (photoUrl) {
        setPreviewPhotoProfile(
          `${process.env.NEXT_PUBLIC_FILE_URL}/${photoUrl}`,
        );
      }
    }, [form.watch("logo")]);

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h2 className="font-semibold text-lg text-black">
          Company Information
        </h2>
        <Form {...form}>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="md:col-span-2">
              <label className="text-sm">
                Company Logo{" "}
                <span className="text-sm text-text-disabled">(optional)</span>
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
                      {stringAvatar(form.watch("name"))}
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
              name="legal_entity_name"
              required
              options={[
                { label: "PT (Perseroan Terbatas)", value: "PT" },
                { label: "CV", value: "CV" },
              ]}
              label="Legal Entity"
            />
            <div className="md:col-span-2 grid md:grid-cols-2">
              <InputForm
                name="industry"
                label="Industry / Business Sector"
                required
              />
            </div>
            <InputForm name="email" label="Company Email Address" required />
            <PhoneInput
              name="phone"
              label="Company Phone Number"
              required
              helperText="Enter digits only (3-15 characters). Formatting will be applied automatically."
            />
            <InputForm
              name="business_registration_number"
              label="Business Registration Number"
              required
            />
            <InputForm name="website" label="Website" isOptional />
            <TextAreaForm name="address" label="Company Address" />
            <div className="flex flex-col gap-2">
              <span className="text-sm">
                Attendance Location<span className="text-error">*</span>
              </span>
              <AttendenceLocationModal />
              <InputForm name="website" label="Maximum Radius" isOptional />
            </div>
            <Separator className="md:col-span-2 my-4" />
            <h2 className="font-semibold text-lg text-black col-span-2">
              Payroll Information
            </h2>
            <InputForm
              name="payroll_bank_name"
              label="Bank Account Name"
              required
            />
            <InputForm
              name="payroll_bank_account_number"
              label="Bank Account Number"
              required
            />
            <InputForm
              name="payroll_bank_account_name"
              label="Bank Account Holder"
              required
            />
            <InputForm name="payroll_currency" label="Currency" required />
            <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
              <Button
                variant="outline"
                className="md:max-w-36 w-[50%]"
                type="button"
                disabled={isPendingAddBranch}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                isLoading={isPendingAddBranch}
                className="md:max-w-36 w-[50%]"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  },
);
