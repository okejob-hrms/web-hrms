'use client';

import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PermissionTable } from './section/setting-permission';
import AssignEmployee from './section/assign-employee';
import { useRoleManagementForm } from './hook';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { IPermissionAction } from '@/services/settings/types';
import { useTranslations } from 'next-intl';

type SettingsAccessControlAddProps = {
  id?: number;
};

export default function SettingsAccessControlAdd({
  id,
}: SettingsAccessControlAddProps) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const {
    permission,
    pagination: employees,
    handleBack,
    handleSubmit,
    selectedPermissions,
    handleTogglePermission,
    rowSelection,
    setRowSelection,
    selectedEmployees,
    setSelectedEmployees,
    formSchema,
    handleDetailData,
    roleDetail,
    userWithRole,
    setSelectedPermissions,
    searchEmployee,
    setSearchEmployee,
  } = useRoleManagementForm();

  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '' },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (id) {
      handleDetailData(id);
    }
  }, [id, handleDetailData]);

  React.useEffect(() => {
    if (roleDetail?.data) {
      form.reset({
        name: roleDetail.data.name ?? '',
        description: roleDetail.data.description ?? '',
      });

      const grantedIds =
        roleDetail?.data?.permissions?.flatMap((module) =>
          module.rows.flatMap((row) =>
            Object.values(row.actions)
              .filter(
                (action): action is IPermissionAction =>
                  !!action && action.granted,
              )
              .map((action) => action.id),
          ),
        ) || [];

      setSelectedPermissions(grantedIds);
    }
  }, [roleDetail?.data, form, setSelectedPermissions]);

  React.useEffect(() => {
    if (userWithRole?.data) {
      setSelectedEmployees(userWithRole.data);
    }
  }, [userWithRole, setSelectedEmployees]);

  const tabs = [
    {
      name: t('settingPermission'),
      value: 'setting-permission',
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
      name: t('assignEmployee'),
      value: 'assign-employee',
      content: employees ? (
        <AssignEmployee
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          searchEmployee={searchEmployee}
          setSearchEmployee={(e) => setSearchEmployee(e)}
          pagination={employees}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
        />
      ) : (
        <div>{t('loadingEmployees')}</div>
      ),
      icon: <Icon name="documentOutlined" size={18} color="currentColor" />,
    },
  ];

  return (
    <div className="font-sans md:px-[125px] px-4">
      <div className="flex flex-col justify-between gap-6">
        <h2 className="font-semibold text-xl">{t('roleInformation')}</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>{t('roleName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('roleNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>{tCommon('description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('roleDescPlaceholder')}
                      className="w-full"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
              <TabsList className="p-1 w-full bg-secondary-background min-h-12">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'px-2.5 sm:px-3 text-secondary-hover',
                      'data-[state=active]:bg-secondary data-[state=active]:text-white',
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

            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="min-w-[100px]"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                className="min-w-[100px]"
              >
                {form.formState.isSubmitting
                  ? tCommon('saving')
                  : tCommon('save')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
