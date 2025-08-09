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
import { CandidateListSection } from "./candidate-list-section";
import Image from "next/image";

export const PersonalInformationSection = React.memo(
  function PersonalInformationSection() {
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Personal Information
        </h2>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div className="col-span-2">
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

          <CandidateListSection />
          <InputForm name="email" label="Email" required />
          <div className="flex items-end gap-1">
            <SelectForm
              name="countryCode"
              options={[
                { label: "+01", value: "+01" },
                { label: "+02", value: "+02" },
                { label: "+62", value: "+62" },
              ]}
            />
            <InputForm name="phoneNumber" required />
          </div>
          <RadioForm
            required
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            className="self-start"
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
            <InputForm name="height" label="Height" required />
            <InputForm name="weight" label="Weight" required />
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
            className="col-span-2"
          />
          <TextAreaForm
            name="personalDescription"
            label="Personal Description"
            className="col-span-2"
          />
          <div className="flex items-end gap-1">
            <SelectForm
              name="socialMediaOption"
              label="Social Media"
              isOptional
              options={[
                { label: "IG", value: "instagram" },
                { label: "Twitter", value: "twitter" },
              ]}
            />
            <InputForm name="socialMedia" isOptional />
          </div>
          <Separator className="col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
