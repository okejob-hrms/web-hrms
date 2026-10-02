'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Info, Lock } from 'lucide-react';

import { getEssProfile, updateEssProfile } from '@/services/ess/profile';
import type { EssProfileUpdatePayload } from '@/services/ess/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

/** Fields that only HR can change */
const PROTECTED_FIELDS = [
  'name',
  'email',
  'id_number',
  'npwp',
  'bpjs',
  'marital_status',
  'date_of_birth',
  'gender',
] as const;

export const SectionProfile = () => {
  const t = useTranslations('ess');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ess-profile'],
    queryFn: getEssProfile,
  });

  const profile = data?.data;

  const [form, setForm] = React.useState<EssProfileUpdatePayload>({});

  React.useEffect(() => {
    if (profile) {
      setForm({
        phone_number: profile.phone_number ?? '',
        residential_address: profile.residential_address ?? '',
        citizen_id_address: profile.citizen_id_address ?? '',
        place_of_birth: profile.place_of_birth ?? '',
        blood_type: profile.blood_type ?? '',
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (payload: EssProfileUpdatePayload) => updateEssProfile(payload),
    onSuccess: () => {
      toast.success(tCommon('saveSuccess', { item: t('myProfile') }));
      queryClient.invalidateQueries({ queryKey: ['ess-profile'] });
    },
    onError: () => {
      toast.error(tCommon('saveFailed', { message: '' }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 pt-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12 py-6">
      <h2 className="font-semibold text-xl text-primary">{t('myProfile')}</h2>

      {/* HR-only notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('profileProtectedHint')}</span>
      </div>

      {/* Protected read-only fields */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          {t('profileIdentitySection')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">{tCommon('name')}</label>
            <Input value={profile?.name ?? ''} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{tCommon('email')}</label>
            <Input value={profile?.email ?? ''} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">ID Number (KTP)</label>
            <Input value={profile?.id_number ?? '-'} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">NPWP</label>
            <Input value={profile?.npwp ?? '-'} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">BPJS</label>
            <Input value={profile?.bpjs ?? '-'} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profileMaritalStatus')}
            </label>
            <Input
              value={profile?.marital_status_label ?? profile?.marital_status ?? '-'}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profileDateOfBirth')}
            </label>
            <Input
              value={profile?.date_of_birth ?? '-'}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t('profileGender')}</label>
            <Input
              value={profile?.gender_label ?? profile?.gender ?? '-'}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h3 className="font-semibold text-base">{t('profileContactSection')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profilePhone')}
            </label>
            <Input
              value={form.phone_number ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone_number: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profilePlaceOfBirth')}
            </label>
            <Input
              value={form.place_of_birth ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, place_of_birth: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profileBloodType')}
            </label>
            <Input
              value={form.blood_type ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, blood_type: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profileResidentialAddress')}
            </label>
            <Input
              value={form.residential_address ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  residential_address: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {t('profileCitizenIdAddress')}
            </label>
            <Input
              value={form.citizen_id_address ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  citizen_id_address: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <Button
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate(form)}
        >
          {saveMutation.isPending ? tCommon('saving') : tCommon('saveChanges')}
        </Button>
      </div>
    </div>
  );
};
