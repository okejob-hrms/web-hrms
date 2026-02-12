'use client';

import { useCallback, useEffect, useState } from 'react';

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
  const [locale, setLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(getLocaleFromCookie());
    setMounted(true);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'en' | 'id';
    setLocale(value);
    setLocaleCookie(value);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 max-md:hidden">
      <label htmlFor="docs-locale" className="sr-only">
        Change language
      </label>
      <select
        id="docs-locale"
        title="Change language"
        value={locale}
        onChange={onChange}
        className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm text-gray-600 hover:text-black dark:border-white/20 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Change language"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
