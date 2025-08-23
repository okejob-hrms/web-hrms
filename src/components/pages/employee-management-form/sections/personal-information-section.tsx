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
// import { CandidateListSection } from "./candidate-list-section";
import Image from "next/image";
import { FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRoles } from "@/services/roles";

export const PersonalInformationSection = React.memo(
  function PersonalInformationSection() {
    const { data: roles } = useQuery({
      queryKey: ["roles"],
      queryFn: getRoles,
    });

    const { watch } = useFormContext();
    const [socialMediaForm, setSocialMediaForm] = React.useState(1);

    const roleOptions = React.useMemo(() => {
      if (roles?.data) {
        return roles.data?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [roles?.data]);

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm">
              Photo{" "}
              <span className="text-sm text-text-disabled">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback className="size-10">CN</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-44" size="lg">
                <Image
                  src="/icons/imagePlaceholder.svg"
                  width={18}
                  height={18}
                  alt="icon search"
                />
                Select Image
              </Button>
            </div>
          </div>
          <InputForm name="name" label="Name" required />

          {/* <CandidateListSection /> */}
          <SelectForm
            name="role"
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
          <div className="grid gap-2 w-full">
            <FormLabel className="text-sm font-normal">
              Phone Number
              <span className="text-error">*</span>
            </FormLabel>
            <div className="flex items-end gap-2 w-full">
              <SelectForm
                name="countryCode"
                options={[
                  { label: "+01", value: "+01" },
                  { label: "+02", value: "+02" },
                  { label: "+62", value: "+62" },
                ]}
                disabled
              />
              <InputForm name="phoneNumber" required className="w-full" />
            </div>
          </div>
          <RadioForm
            required
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            className="md:self-start"
          />

          <div className="grid grid-cols-2 gap-2">
            <InputForm name="placeOfBirth" label="Place of Birth" required />
            <DatePicker name="bornDate" label="Born Date" />
          </div>

          <div className="grid grid-cols-2 gap-2 items-end">
            <SelectForm
              name="maritalStatus"
              label="Marital Status"
              options={[
                { label: "Single", value: "single" },
                { label: "Married", value: "married" },
                { label: "Divorced", value: "divorced" },
                { label: "Widowed", value: "widowed" },
                { label: "Separated", value: "separated" },
              ]}
              required
            />
            <InputForm name="bloodType" label="Blood Type" required />
          </div>
          <div className="grid grid-cols-2 gap-2 col-start-1 col-end-2">
            <InputForm
              name="height"
              label="Height"
              required
              iconPosition="right"
              icon={<span className="text-text-disabled text-base">cm</span>}
            />
            <InputForm
              name="weight"
              label="Weight"
              required
              iconPosition="right"
              icon={<span className="text-text-disabled text-base">kg</span>}
            />
          </div>

          <InputForm name="idNumber" label="ID Number" required />
          <InputForm name="npwp" label="Taxpayer ID Number (NPWP)" required />
          <InputForm
            name="bpjs"
            label="Health Insurance Number (BPJS)"
            required
          />

          <TextAreaForm name="addressCitizen" label="Citizen ID Address" />
          <TextAreaForm name="residentalAddress" label="Residental Address" />
          <InputForm name="hobby" label="Hobby" required />

          <TextAreaForm
            name="achievement"
            label="Achievement"
            className="md:col-span-2"
          />
          <TextAreaForm
            name="personalDescription"
            label="Personal Description"
            className="md:col-span-2"
          />
          <div className="grid gap-2 w-full">
            <FormLabel className="text-sm font-normal">
              Social Media
              <span className="text-text-disabled">(optional)</span>
            </FormLabel>
            {socialMediaForm > 0 &&
              [...Array(socialMediaForm)].map((_, index) => (
                <div key={index} className="flex items-end gap-2 w-full ">
                  <SelectForm
                    name="socialMediaOption"
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
                        label: "Linkedin",
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
                  />
                  <InputForm
                    name={watch("socialMediaOption")}
                    isOptional
                    className="w-full"
                  />
                </div>
              ))}
          </div>
          <Button
            variant="ghost"
            className="w-fit text-primary"
            type="button"
            onClick={() => {
              setSocialMediaForm((prev) => prev + 1);
            }}
          >
            <Plus /> Add More
          </Button>
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
