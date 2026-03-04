'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const OPTIONS = [
  { id: 'en', name: 'English' },
  { id: 'id', name: 'Bahasa Indonesia' },
] as const;

function getLocaleFromCookie(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : '';
  return OPTIONS.some((o) => o.id === value) ? value : 'en';
}

function setLocaleCookie(locale: string) {
  const expires = new Date(Date.now() + ONE_YEAR_MS).toUTCString();
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; expires=${expires}; path=/`;
}

export function DocsLanguageSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const segs = pathname?.split('/').filter(Boolean) ?? [];
    if (segs[0] === 'docs' && (segs[1] === 'en' || segs[1] === 'id')) {
      setLocale(segs[1]);
    } else {
      setLocale(getLocaleFromCookie());
    }
    setMounted(true);
  }, [pathname]);

  const onValueChange = useCallback(
    (value: string) => {
      if (value !== 'en' && value !== 'id') return;
      setLocale(value);
      setLocaleCookie(value);
      const segs = pathname?.split('/').filter(Boolean) ?? [];
      if (segs[1] === 'en' || segs[1] === 'id') {
        segs[1] = value;
        router.push('/' + segs.join('/'));
      } else {
        router.push(`/docs/${value}`);
      }
    },
    [pathname, router]
  );

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 max-md:hidden">
      <Select value={locale} onValueChange={onValueChange}>
        <SelectTrigger
          id="docs-locale"
          title="Change language"
          aria-label="Change language"
          className="h-8 w-[145px] border-black/10 bg-transparent text-sm text-gray-600 hover:text-black dark:border-white/20 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
