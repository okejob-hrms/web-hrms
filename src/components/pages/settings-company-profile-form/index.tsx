"use client";

import { CompanyFormValues, useCompanyForm } from "./hook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, stringAvatar } from "@/lib/utils";
import TitleContent from "@/components/ui/title";

export default function SettingsCompanyProfileForm() {
  const {
    form,
    onSubmit,
    dataWorkSchedule,
    handleBack,
    daysOfWeek,
    uploadLogo,
    imagePhoto,
  } = useCompanyForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const [workSchedules, setWorkSchedules] = useState(
  //   dataWorkSchedule?.rawWorkSchedules || [],
  // );
  const [previewLogo, setPreviewLogo] = useState<string | null | undefined>(
    imagePhoto,
  );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewLogo(localUrl);

      uploadLogo(file, {
        onSuccess: (res) => {
          const photoUrl = res.data.path;
          form.setValue("logo", photoUrl, { shouldValidate: true });
          setPreviewLogo(res.data.url);
        },
      });
    }
  };

  const defaultValueNew = {
    shift_name: "Night Shift",
    start_time: "09:05",
    end_time: "17:00",
    break_start_time: "12:00",
    break_end_time: "13:00",
    ends_next_day: false,
  };

  const handleSubmit = (values: CompanyFormValues) => {
    // const dataWork = workSchedules.map((day) => ({
    //   day_of_week: day.day_of_week,
    //   schedules: (day.schedules ?? []).map((s) => ({
    //     shift_name: s.shift_name,
    //     start_time: s.start_time,
    //     end_time: s.end_time,
    //     sequence: s.sequence,
    //     ends_next_day: s.ends_next_day,
    //     break_start_time: s.break_start_time,
    //     break_end_time: s.break_end_time,
    //   })),
    // }));

    onSubmit({
      ...values,
      // workSchedules: dataWork,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TitleContent label="Company Information" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Company Logo */}
          <div className="mt-5">
            <FormLabel>Company Logo</FormLabel>
            <div className="flex items-center gap-4 mt-2">
              <Avatar className="size-20 bg-grayscale-10 items-center justify-center">
                <AvatarImage
                  src={previewLogo || "/icons/userPlaceholder.svg"}
                  alt="Profile photo"
                  className={cn(
                    `bg-grayscale-10 m-auto object-cover`,
                    !previewLogo && "h-10 w-10",
                  )}
                />
                <AvatarFallback className="size-10 font-semibold">
                  {stringAvatar(dataWorkSchedule?.companyInfo.name || "C")}
                </AvatarFallback>
              </Avatar>

              {/* Custom file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />

              <Button
                variant="outline"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus />
                Select Image
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Legal Entity */}
            <FormField
              control={form.control}
              name="legalEntity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Entity</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "PT"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PT">
                        PT (Perseroan Terbatas)
                      </SelectItem>
                      <SelectItem value="CV">CV</SelectItem>
                      <SelectItem value="Firma">Firma</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry / Business Sector</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Manufacturing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Email */}
            <div className="col-start-1">
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="companyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Reg Number */}
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://company.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Company Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h2 className="text-xl font-semibold pt-6 border-t">
            Payroll Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Bank Account Name */}
            <FormField
              control={form.control}
              name="bankAccountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="PT. Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Account Number */}
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Account Holder */}
            <FormField
              control={form.control}
              name="bankAccountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Holder</FormLabel>
                  <FormControl>
                    <Input placeholder="Account Holder Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "IDR"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IDR">
                        IDR (Indonesian Rupiah)
                      </SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-[100px]">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
