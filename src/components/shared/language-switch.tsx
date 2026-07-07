'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LOCALE_OPTIONS,
  type AppLocale,
  isAppLocale,
  setLocaleCookie,
} from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';

interface LanguageSwitchProps {
  className?: string;
  showOnMobile?: boolean;
}

export function LanguageSwitch({
  className,
  showOnMobile = false,
}: LanguageSwitchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [locale, setLocale] = useState<AppLocale>(
    isAppLocale(currentLocale) ? currentLocale : 'en',
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isAppLocale(currentLocale)) {
      setLocale(currentLocale);
    }
    setMounted(true);
  }, [currentLocale]);

  const onValueChange = useCallback(
    (value: string) => {
      if (!isAppLocale(value)) return;
      setLocale(value);
      setLocaleCookie(value);

      const segs = pathname?.split('/').filter(Boolean) ?? [];
      if (segs[0] === 'docs' && (segs[1] === 'en' || segs[1] === 'id')) {
        segs[1] = value;
        router.push('/' + segs.join('/'));
        return;
      }

      router.refresh();
    },
    [pathname, router],
  );

  if (!mounted) return null;

  return (
    <div
      className={
        className ??
        `flex items-center gap-2 ${showOnMobile ? '' : 'max-md:hidden'}`
      }
    >
      <Select value={locale} onValueChange={onValueChange}>
        <SelectTrigger
          id="app-locale"
          size="sm"
          title="Change language"
          aria-label="Change language"
          className={cn(
            'w-8 shrink-0 justify-center border-black/10 bg-transparent p-0 text-gray-600 hover:text-black',
            'md:w-[145px] md:justify-between md:px-3',
            'dark:border-white/20 dark:text-gray-400 dark:hover:text-gray-200',
            '[&_[data-slot=select-value]]:hidden md:[&_[data-slot=select-value]]:flex',
            '[&>svg:last-child]:hidden md:[&>svg:last-child]:block',
          )}
        >
          <Languages className="size-4 shrink-0 md:hidden" aria-hidden="true" />
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LOCALE_OPTIONS.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** @deprecated Use LanguageSwitch */
export const DocsLanguageSwitch = LanguageSwitch;
