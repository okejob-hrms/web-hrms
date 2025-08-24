"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PermissionTable } from "./section/setting-permission";
import AssignEmployee from "./section/assign-employee";
import { useRoleManagementForm } from "./hook";
import { RowSelectionState } from "@tanstack/react-table";
import { IEmployee } from "@/services/settings/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

export default function SettingsAccessControlAdd() {
  const {
    permission,
    pagination: employees,
    handleBack,
  } = useRoleManagementForm();
  const router = useRouter();

  const [selectedPermissions, setSelectedPermissions] = React.useState<
    number[]
  >([]);

  const [selectedEmployees, setSelectedEmployees] = React.useState<IEmployee[]>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
    mode: "onChange",
  });

  const handleTogglePermission = (id: number, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      permissions: selectedPermissions,
      employees: selectedEmployees.map((e) => e.id),
    };

    console.log("Submit Payload:", payload);
    router.push("/auth/success-change-password");
  };

  const tabs = [
    {
      name: "Setting Permission",
      value: "setting-permission",
      content: (
        <PermissionTable
          data={permission}
          selected={selectedPermissions}
          onToggle={handleTogglePermission}
        />
      ),
      icon: <Icon name="userSolid" size={18} color="currentColor" />,
    },
    {
      name: "Assign Employee",
      value: "assign-employee",
      content: employees ? (
        <AssignEmployee
          pagination={employees}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
        />
      ) : (
        <div>Loading employees...</div>
      ),
      icon: <Icon name="documentOutlined" size={18} color="currentColor" />,
    },
  ];

  return (
    <div className="font-sans p-4">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex gap-2 items-center flex-wrap">
          <h2 className="font-semibold text-xl">Role Information</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Enter role description"
                      className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
              <TabsList className="p-1 w-full bg-secondary-background min-h-12">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "px-2.5 sm:px-3 text-secondary-hover",
                      "data-[state=active]:bg-secondary data-[state=active]:text-white"
                    )}
                  >
                    <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                      {tab.icon} {tab.name}
                    </code>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>

            {/* Actions */}
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid}
                className="min-w-[100px]"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
