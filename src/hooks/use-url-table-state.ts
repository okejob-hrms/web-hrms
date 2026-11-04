'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PaginationState } from '@tanstack/react-table';

type FilterValue = string | number | undefined;

interface UseUrlTableStateOptions<F> {
  defaultFilters: F;
  /** Keys read back as numbers when their default is not a number (e.g. `undefined`). */
  numberKeys?: (keyof F)[];
  defaultPageSize?: number;
  /** Turn off for embedded lists (dashboard, ESS) so they never touch the host page's URL. */
  enabled?: boolean;
}

const STORAGE_PREFIX = 'list-state:';
const PAGE_KEY = 'page';
const PAGE_SIZE_KEY = 'per_page';

const isEmpty = (value: FilterValue) => value === undefined || value === '';

const readStorage = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode, quota) — URL still carries the state.
  }
};

/**
 * Table filters + pagination that survive mutations, navigation and reloads.
 *
 * State lives in React and is mirrored to the query string (only non-default
 * values). The last query per path is also kept in sessionStorage, so coming
 * back through the sidebar or a form's redirect restores where the user left off.
 *
 * Reading sessionStorage in the state initializer relies on callers rendering
 * client-only: AuthGuard returns null on private routes until a client effect
 * runs, so these lists never go through SSR or hydration. Using this hook on a
 * server-rendered route would need the restore moved into a mount effect.
 */
export function useUrlTableState<F extends { [K in keyof F]: FilterValue }>({
  defaultFilters,
  numberKeys = [],
  defaultPageSize = 10,
  enabled = true,
}: UseUrlTableStateOptions<F>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storageKey = `${STORAGE_PREFIX}${pathname}`;

  // Defaults are a static literal per page, so the key set never changes.
  const [filterKeys] = React.useState(
    () => Object.keys(defaultFilters) as (keyof F & string)[],
  );
  const [managedKeys] = React.useState<string[]>(() => [
    ...filterKeys,
    PAGE_KEY,
    PAGE_SIZE_KEY,
  ]);
  const [defaults] = React.useState(defaultFilters);

  const [initial] = React.useState(() => {
    let params = enabled
      ? new URLSearchParams(searchParams?.toString() ?? '')
      : new URLSearchParams();
    const hasUrlState = managedKeys.some((key) => params.has(key));
    if (enabled && !hasUrlState && typeof window !== 'undefined') {
      const stored = readStorage(storageKey);
      if (stored) params = new URLSearchParams(stored);
    }

    const filters = { ...defaults };
    for (const key of filterKeys) {
      const raw = params.get(key);
      if (raw === null) continue;
      const isNumber =
        typeof defaults[key] === 'number' || numberKeys.includes(key);
      if (raw === '') {
        filters[key] = (isNumber ? undefined : '') as F[typeof key];
      } else if (isNumber) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) filters[key] = parsed as F[typeof key];
      } else {
        filters[key] = raw as F[typeof key];
      }
    }

    const page = Number(params.get(PAGE_KEY));
    const pageSize = Number(params.get(PAGE_SIZE_KEY));
    const pagination: PaginationState = {
      pageIndex: Number.isInteger(page) && page >= 1 ? page - 1 : 0,
      pageSize:
        Number.isInteger(pageSize) && pageSize >= 1 ? pageSize : defaultPageSize,
    };

    return { filters, pagination };
  });

  const [filters, setFilters] = React.useState<F>(initial.filters);
  const [pagination, setPagination] = React.useState<PaginationState>(
    initial.pagination,
  );

  React.useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams(window.location.search);
    managedKeys.forEach((key) => params.delete(key));

    const own = new URLSearchParams();
    for (const key of filterKeys) {
      const value = filters[key];
      const fallback = defaults[key];
      if (value === fallback || (isEmpty(value) && isEmpty(fallback))) continue;
      own.set(key, isEmpty(value) ? '' : String(value));
    }
    if (pagination.pageIndex > 0) {
      own.set(PAGE_KEY, String(pagination.pageIndex + 1));
    }
    if (pagination.pageSize !== defaultPageSize) {
      own.set(PAGE_SIZE_KEY, String(pagination.pageSize));
    }
    own.forEach((value, key) => params.set(key, value));

    writeStorage(storageKey, own.toString());

    const query = params.toString();
    const { pathname: path, search, hash } = window.location;
    const nextUrl = `${path}${query ? `?${query}` : ''}${hash}`;
    if (nextUrl !== `${path}${search}${hash}`) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [
    enabled,
    filters,
    pagination,
    storageKey,
    defaultPageSize,
    defaults,
    filterKeys,
    managedKeys,
  ]);

  return { filters, setFilters, pagination, setPagination };
}
