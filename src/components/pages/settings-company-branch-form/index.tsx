/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { LocationBadge } from "@/components/ui/location-badge";
import { Switch } from "@/components/ui/switch";

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
      defaultMap,
      selectedMap,
      map,
      openAttendenceModal,
      setOpenAttendenceModal,
      handleOpenAttendenceModal,
      handleSetMap,
      setSelectedMap,
      loading,
      setLocation,
      location,
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
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(handleSubmit)();
            }}
            noValidate
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
              key={`legal_entity_${form.watch("legal_entity_name")}`}
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
            <TextAreaForm name="address" label="Company Address" required />
            <div className="flex flex-col gap-2">
              <span className="text-sm">
                Attendance Location<span className="text-error">*</span>
              </span>
              <div
                className={cn(
                  "flex w-fit",
                  map.lat !== 0 && map.lng !== 0 ? "gap-4" : "gap-0",
                )}
              >
                <div>
                  {map.lat !== 0 && map.lng !== 0 && (
                    <LocationBadge
                      lat={Number(map.lat)}
                      lng={Number(map.lng)}
                    />
                  )}
                </div>
                <AttendenceLocationModal
                  openAttendenceModal={openAttendenceModal}
                  setOpenAttendenceModal={setOpenAttendenceModal}
                  handleOpenAttendenceModal={handleOpenAttendenceModal}
                  selectedMap={selectedMap}
                  setSelectedMap={setSelectedMap}
                  handleSetMap={handleSetMap}
                  loading={loading}
                  defaultMap={defaultMap}
                  location={location}
                  setLocation={setLocation}
                />
              </div>
              <InputForm
                name="max_radius"
                label="Maximum Radius"
                type="number"
                isOptional
              />
            </div>
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 col-span-2">
                  <FormLabel>Is Primary?</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">No</span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm  font-medium">Yes</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                type="button"
                onClick={() => {
                  form.handleSubmit(handleSubmit)();
                }}
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
